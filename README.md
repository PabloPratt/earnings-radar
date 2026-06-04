# Earnings Radar

A real-time stock screener that ranks companies with upcoming earnings reports by:
- **Analyst Sentiment**: How undervalued the stock is according to analysts
- **Beat Probability**: Likelihood the company will exceed earnings expectations
- **Composite Score**: Combined ranking metric (0-100)

## Features

- 🔄 Real-time data updates every minute
- 📊 Live leaderboard of high-potential earnings plays
- 📈 Combines analyst sentiment with historical beat rates
- 🎯 Filters for stocks with strong upside potential
- 🚀 Built with Next.js and React

## Getting Started

### Prerequisites
- Node.js 18+
- UnusualWhales API key

### Installation

```bash
npm install
```

### Configuration

1. Get your UnusualWhales API key from https://unusualwhales.com/
2. Copy `.env.local.example` to `.env.local`
3. Add your API key:

```bash
UNUSUALWHALES_API_KEY=your_key_here
```

### Running the App

```bash
npm run dev
```

Open http://localhost:3000 to see the live dashboard.

## How It Works

The ranking engine:
1. **Fetches upcoming earnings** from the next 30 days
2. **Analyzes analyst sentiment** - extracts undervalued signals from target prices vs. current prices
3. **Calculates beat probability** - combines historical beat rates with analyst consensus
4. **Ranks all candidates** - filters and scores based on a composite metric
5. **Serves via API** - real-time data cached for 5 minutes

## Tech Stack

- **Frontend**: React, Next.js 15, Tailwind CSS
- **Backend**: Next.js API Routes
- **Data**: UnusualWhales API

## License

MIT
