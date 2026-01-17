# Backpack Exchange Volume Farming Script

A Python script for automated volume farming on Backpack Exchange.

## Features

- Automated buy/sell trading to accumulate volume
- Configurable trading parameters
- Daily trade limits
- Graceful shutdown with Ctrl+C
- Random intervals to appear more natural
- Two trading modes: normal and wash

## Requirements

- Python 3.8+
- Backpack Exchange account with API access

## Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd daiwa
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create config file:
```bash
cp config.example.json config.json
```

4. Edit `config.json` with your API credentials:
```json
{
    "api_key": "your_api_key_here",
    "api_secret": "your_api_secret_here",
    "symbol": "SOL_USDC",
    "trade_amount_usdc": 10,
    "interval_seconds": 60,
    "price_offset_percent": 0.1,
    "max_trades_per_day": 100
}
```

## Getting API Keys

1. Go to [Backpack Exchange](https://backpack.exchange)
2. Navigate to Settings > API Keys
3. Create a new API key with trading permissions
4. Copy the API Key and Secret to your config file

## Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `api_key` | Your Backpack API key | Required |
| `api_secret` | Your Backpack API secret (base64 encoded) | Required |
| `symbol` | Trading pair (e.g., SOL_USDC, BTC_USDC) | Required |
| `trade_amount_usdc` | Amount in USDC per trade | Required |
| `interval_seconds` | Seconds between trade cycles | 60 |
| `price_offset_percent` | Price offset for limit orders | 0.1 |
| `max_trades_per_day` | Maximum trades per day | 100 |

## Usage

### Check Balance
```bash
python farming.py --check-balance
```

### Run Normal Mode
```bash
python farming.py
```

### Run Wash Trade Mode
```bash
python farming.py --mode wash
```

### Custom Config File
```bash
python farming.py -c /path/to/config.json
```

## Trading Modes

### Normal Mode
Places IOC (Immediate or Cancel) orders slightly above/below market price. Orders will fill immediately against existing orders in the book.

### Wash Mode
Places matching buy and sell limit orders at the same price. May provide higher volume with lower cost but could violate exchange ToS.

## Risk Warning

- Trading involves financial risk
- This script may violate exchange Terms of Service
- Use at your own risk
- Never invest more than you can afford to lose
- Test with small amounts first

## License

MIT License
