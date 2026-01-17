"""
Backpack Exchange API Client
"""
import time
import json
import base64
import requests
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives import serialization
import base58


class BackpackClient:
    BASE_URL = "https://api.backpack.exchange"

    def __init__(self, api_key: str, api_secret: str):
        self.api_key = api_key
        self.api_secret = api_secret
        self._load_private_key()

    def _load_private_key(self):
        """Load Ed25519 private key from base64 encoded secret"""
        try:
            # Backpack API secret is base64 encoded Ed25519 private key
            secret_bytes = base64.b64decode(self.api_secret)
            self.private_key = Ed25519PrivateKey.from_private_bytes(secret_bytes[:32])
        except Exception as e:
            raise ValueError(f"Failed to load private key: {e}")

    def _sign(self, message: str) -> str:
        """Sign message with Ed25519 private key"""
        signature = self.private_key.sign(message.encode())
        return base64.b64encode(signature).decode()

    def _get_headers(self, method: str, endpoint: str, params: dict = None) -> dict:
        """Generate authenticated headers for request"""
        timestamp = int(time.time() * 1000)
        window = 5000  # 5 second window

        # Build signature payload
        if params:
            sorted_params = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
            sign_str = f"instruction={endpoint}&{sorted_params}&timestamp={timestamp}&window={window}"
        else:
            sign_str = f"instruction={endpoint}&timestamp={timestamp}&window={window}"

        signature = self._sign(sign_str)

        return {
            "X-API-Key": self.api_key,
            "X-Signature": signature,
            "X-Timestamp": str(timestamp),
            "X-Window": str(window),
            "Content-Type": "application/json"
        }

    def _request(self, method: str, endpoint: str, params: dict = None, signed: bool = False) -> dict:
        """Make API request"""
        url = f"{self.BASE_URL}{endpoint}"

        if signed:
            headers = self._get_headers(method, endpoint.split("/")[-1], params)
        else:
            headers = {"Content-Type": "application/json"}

        try:
            if method == "GET":
                response = requests.get(url, params=params, headers=headers, timeout=30)
            elif method == "POST":
                response = requests.post(url, json=params, headers=headers, timeout=30)
            elif method == "DELETE":
                response = requests.delete(url, json=params, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            if response.status_code == 200:
                return response.json()
            else:
                print(f"API Error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"Request failed: {e}")
            return None

    # Public APIs
    def get_ticker(self, symbol: str) -> dict:
        """Get ticker for a symbol"""
        return self._request("GET", "/api/v1/ticker", {"symbol": symbol})

    def get_orderbook(self, symbol: str) -> dict:
        """Get orderbook for a symbol"""
        return self._request("GET", "/api/v1/depth", {"symbol": symbol})

    def get_markets(self) -> list:
        """Get all available markets"""
        return self._request("GET", "/api/v1/markets")

    # Private APIs
    def get_balances(self) -> dict:
        """Get account balances"""
        return self._request("GET", "/api/v1/capital", signed=True)

    def get_open_orders(self, symbol: str = None) -> list:
        """Get open orders"""
        params = {"symbol": symbol} if symbol else None
        return self._request("GET", "/api/v1/orders", params, signed=True)

    def place_order(self, symbol: str, side: str, order_type: str,
                    quantity: float, price: float = None, time_in_force: str = "GTC") -> dict:
        """
        Place an order

        Args:
            symbol: Trading pair (e.g., 'SOL_USDC')
            side: 'Bid' for buy, 'Ask' for sell
            order_type: 'Limit' or 'Market'
            quantity: Order quantity
            price: Order price (required for limit orders)
            time_in_force: 'GTC', 'IOC', or 'FOK'
        """
        params = {
            "symbol": symbol,
            "side": side,
            "orderType": order_type,
            "quantity": str(quantity),
            "timeInForce": time_in_force
        }
        if price:
            params["price"] = str(price)

        return self._request("POST", "/api/v1/order", params, signed=True)

    def cancel_order(self, symbol: str, order_id: str) -> dict:
        """Cancel an order"""
        params = {
            "symbol": symbol,
            "orderId": order_id
        }
        return self._request("DELETE", "/api/v1/order", params, signed=True)

    def cancel_all_orders(self, symbol: str) -> dict:
        """Cancel all orders for a symbol"""
        params = {"symbol": symbol}
        return self._request("DELETE", "/api/v1/orders", params, signed=True)

    def get_order_history(self, symbol: str = None, limit: int = 100) -> list:
        """Get order history"""
        params = {"limit": limit}
        if symbol:
            params["symbol"] = symbol
        return self._request("GET", "/api/v1/orders/history", params, signed=True)

    def get_fill_history(self, symbol: str = None, limit: int = 100) -> list:
        """Get fill/trade history"""
        params = {"limit": limit}
        if symbol:
            params["symbol"] = symbol
        return self._request("GET", "/api/v1/fills", params, signed=True)
