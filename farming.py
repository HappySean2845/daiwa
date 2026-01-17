#!/usr/bin/env python3
"""
Backpack Exchange Volume Farming Script

This script automates trading on Backpack Exchange to accumulate trading volume.
It uses a market-making strategy to minimize losses while generating volume.
"""
import json
import time
import random
import argparse
import signal
import sys
from datetime import datetime, timedelta
from backpack_client import BackpackClient


class VolumeFarmer:
    def __init__(self, config_path: str = "config.json"):
        self.config = self._load_config(config_path)
        self.client = BackpackClient(
            self.config["api_key"],
            self.config["api_secret"]
        )
        self.running = True
        self.daily_trades = 0
        self.daily_volume = 0.0
        self.last_reset = datetime.now().date()
        self.total_volume = 0.0

        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _load_config(self, path: str) -> dict:
        """Load configuration from JSON file"""
        try:
            with open(path, 'r') as f:
                config = json.load(f)

            # Validate required fields
            required = ["api_key", "api_secret", "symbol", "trade_amount_usdc"]
            for field in required:
                if field not in config:
                    raise ValueError(f"Missing required config field: {field}")

            # Set defaults
            config.setdefault("interval_seconds", 60)
            config.setdefault("price_offset_percent", 0.1)
            config.setdefault("max_trades_per_day", 100)

            return config
        except FileNotFoundError:
            print(f"Config file not found: {path}")
            print("Please copy config.example.json to config.json and fill in your API credentials")
            sys.exit(1)

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        print("\n\nShutting down gracefully...")
        self.running = False

    def _reset_daily_stats(self):
        """Reset daily statistics if it's a new day"""
        today = datetime.now().date()
        if today > self.last_reset:
            print(f"\n[{datetime.now()}] New day - resetting daily stats")
            print(f"Yesterday's volume: ${self.daily_volume:.2f}")
            self.daily_trades = 0
            self.daily_volume = 0.0
            self.last_reset = today

    def _get_market_price(self) -> float:
        """Get current market price"""
        ticker = self.client.get_ticker(self.config["symbol"])
        if ticker and "lastPrice" in ticker:
            return float(ticker["lastPrice"])
        return None

    def _calculate_quantity(self, price: float) -> float:
        """Calculate order quantity based on USDC amount and price"""
        usdc_amount = self.config["trade_amount_usdc"]
        quantity = usdc_amount / price

        # Round to appropriate decimal places (usually 3 for SOL)
        return round(quantity, 3)

    def _add_random_jitter(self, value: float, percent: float = 5) -> float:
        """Add random jitter to a value"""
        jitter = value * (percent / 100) * (random.random() * 2 - 1)
        return value + jitter

    def execute_trade_cycle(self):
        """Execute a buy and sell cycle to generate volume"""
        symbol = self.config["symbol"]
        offset_percent = self.config["price_offset_percent"]

        # Get current market price
        price = self._get_market_price()
        if not price:
            print(f"[{datetime.now()}] Failed to get market price")
            return False

        quantity = self._calculate_quantity(price)

        # Add some randomness to quantity
        quantity = round(self._add_random_jitter(quantity, 3), 3)

        print(f"\n[{datetime.now()}] Starting trade cycle")
        print(f"  Market price: ${price:.4f}")
        print(f"  Quantity: {quantity}")

        # Strategy: Place limit orders slightly above/below market to ensure fills
        # while minimizing slippage

        # Step 1: Place buy order slightly above market (more likely to fill)
        buy_price = round(price * (1 + offset_percent / 100), 2)
        print(f"  Placing buy order at ${buy_price:.4f}...")

        buy_order = self.client.place_order(
            symbol=symbol,
            side="Bid",
            order_type="Limit",
            quantity=quantity,
            price=buy_price,
            time_in_force="IOC"  # Immediate or Cancel
        )

        if not buy_order:
            print("  Buy order failed")
            return False

        print(f"  Buy order placed: {buy_order.get('id', 'N/A')}")

        # Small delay between orders
        time.sleep(random.uniform(0.5, 2))

        # Step 2: Place sell order slightly below market
        sell_price = round(price * (1 - offset_percent / 100), 2)
        print(f"  Placing sell order at ${sell_price:.4f}...")

        sell_order = self.client.place_order(
            symbol=symbol,
            side="Ask",
            order_type="Limit",
            quantity=quantity,
            price=sell_price,
            time_in_force="IOC"
        )

        if not sell_order:
            print("  Sell order failed")
            return False

        print(f"  Sell order placed: {sell_order.get('id', 'N/A')}")

        # Calculate approximate volume
        trade_volume = quantity * price * 2  # Both buy and sell
        self.daily_trades += 2
        self.daily_volume += trade_volume
        self.total_volume += trade_volume

        print(f"  Cycle complete! Volume: ${trade_volume:.2f}")
        return True

    def execute_wash_trade(self):
        """
        Execute a self-matching trade (wash trade) for maximum volume with minimal loss.
        Places both buy and sell limit orders at the same price.
        Note: This may violate exchange ToS - use at your own risk.
        """
        symbol = self.config["symbol"]

        # Get current market price
        price = self._get_market_price()
        if not price:
            print(f"[{datetime.now()}] Failed to get market price")
            return False

        quantity = self._calculate_quantity(price)
        quantity = round(self._add_random_jitter(quantity, 3), 3)

        # Use mid-market price for both orders
        trade_price = round(price, 2)

        print(f"\n[{datetime.now()}] Executing wash trade")
        print(f"  Price: ${trade_price:.4f}, Quantity: {quantity}")

        # Place buy order first
        buy_order = self.client.place_order(
            symbol=symbol,
            side="Bid",
            order_type="Limit",
            quantity=quantity,
            price=trade_price,
            time_in_force="GTC"
        )

        if not buy_order:
            print("  Buy order failed")
            return False

        # Immediately place matching sell order
        sell_order = self.client.place_order(
            symbol=symbol,
            side="Ask",
            order_type="Limit",
            quantity=quantity,
            price=trade_price,
            time_in_force="GTC"
        )

        if not sell_order:
            print("  Sell order failed, cancelling buy order...")
            self.client.cancel_all_orders(symbol)
            return False

        # Wait a moment for orders to potentially match
        time.sleep(2)

        # Clean up any unfilled orders
        self.client.cancel_all_orders(symbol)

        trade_volume = quantity * trade_price * 2
        self.daily_trades += 2
        self.daily_volume += trade_volume
        self.total_volume += trade_volume

        print(f"  Trade complete! Volume: ${trade_volume:.2f}")
        return True

    def show_stats(self):
        """Display current statistics"""
        print(f"\n{'='*50}")
        print(f"  Daily Trades: {self.daily_trades}")
        print(f"  Daily Volume: ${self.daily_volume:.2f}")
        print(f"  Total Volume: ${self.total_volume:.2f}")
        print(f"{'='*50}")

    def run(self, mode: str = "normal"):
        """
        Main loop to run the farming bot

        Args:
            mode: 'normal' for regular trading, 'wash' for wash trading
        """
        print(f"\n{'='*50}")
        print(f"  Backpack Volume Farmer Starting")
        print(f"  Symbol: {self.config['symbol']}")
        print(f"  Trade Amount: ${self.config['trade_amount_usdc']} USDC")
        print(f"  Interval: {self.config['interval_seconds']} seconds")
        print(f"  Mode: {mode}")
        print(f"{'='*50}\n")

        # Check balances first
        balances = self.client.get_balances()
        if balances:
            print("Account Balances:")
            for asset, data in balances.items():
                available = float(data.get("available", 0))
                if available > 0:
                    print(f"  {asset}: {available}")
        print()

        trade_func = self.execute_wash_trade if mode == "wash" else self.execute_trade_cycle

        while self.running:
            try:
                self._reset_daily_stats()

                # Check daily limit
                if self.daily_trades >= self.config["max_trades_per_day"]:
                    print(f"[{datetime.now()}] Daily trade limit reached ({self.daily_trades})")
                    print("Waiting until tomorrow...")
                    time.sleep(3600)  # Wait an hour before checking again
                    continue

                # Execute trade
                success = trade_func()

                if success:
                    self.show_stats()

                # Random interval to appear more human
                interval = self._add_random_jitter(
                    self.config["interval_seconds"],
                    20
                )
                interval = max(10, interval)  # Minimum 10 seconds

                print(f"Next trade in {interval:.0f} seconds...")
                time.sleep(interval)

            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"[{datetime.now()}] Error: {e}")
                time.sleep(30)

        # Cleanup
        print("\nCleaning up...")
        self.client.cancel_all_orders(self.config["symbol"])
        self.show_stats()
        print("Goodbye!")


def main():
    parser = argparse.ArgumentParser(description="Backpack Exchange Volume Farmer")
    parser.add_argument(
        "-c", "--config",
        default="config.json",
        help="Path to config file (default: config.json)"
    )
    parser.add_argument(
        "-m", "--mode",
        choices=["normal", "wash"],
        default="normal",
        help="Trading mode: normal or wash (default: normal)"
    )
    parser.add_argument(
        "--check-balance",
        action="store_true",
        help="Only check balance and exit"
    )

    args = parser.parse_args()

    farmer = VolumeFarmer(args.config)

    if args.check_balance:
        balances = farmer.client.get_balances()
        if balances:
            print("Account Balances:")
            for asset, data in balances.items():
                available = float(data.get("available", 0))
                locked = float(data.get("locked", 0))
                if available > 0 or locked > 0:
                    print(f"  {asset}: {available} (locked: {locked})")
        return

    farmer.run(mode=args.mode)


if __name__ == "__main__":
    main()
