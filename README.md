# RetailPulse

A full-stack stock analysis application that combines real-time market data with social media sentiment analysis and AI-powered investment recommendations.

## What this does

- Shows current stock prices that update automatically
- Finds Reddit posts about the stock you're looking at
- Uses AI to give you a buy/sell recommendation
- Tells you if the stock market is open or closed
- Lets you create an account to save your preferences

## How to use it

1. Pick a stock from the dropdown (like Apple, Tesla, etc.)
2. Click "Analyze Stock" 
3. See the current price, Reddit posts, and AI recommendation
4. The data updates every 10 seconds when markets are open

## Features

- **Real-time Stock Data**: Live NYSE stock prices with automatic updates
- **Social Sentiment Analysis**: Reddit post analysis using AI
- **Investment Recommendations**: AI-powered buy/sell/hold suggestions
- **User Authentication**: Firebase-powered login/signup system
- **Responsive Design**: Modern dark theme UI
- **Market Status**: Live/closed market indicators

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Firebase Auth
- **APIs**: Alpha Vantage, Yahoo Finance, Reddit API, OpenAI GPT-4
- **Database**: Firebase Firestore
- **Deployment**: Vercel

## Running Locally

```bash
git clone <this-repo-url>
cd retailpulse
npm install
npm run dev
```

**Note**: You'll need to set up your own API keys in a `.env.local` file for full functionality.

## Key Technical Achievements

- **Real-time Data Integration**: Implemented live stock price updates with 10-second intervals
- **AI-Powered Analysis**: Built sentiment analysis pipeline using OpenAI GPT-4
- **Social Media Integration**: Reddit API integration with relevance filtering
- **User Authentication**: Complete Firebase Auth implementation with user profiles
- **Responsive UI**: Modern dark theme with Tailwind CSS and custom components
- **API Design**: RESTful API architecture with proper error handling

## License

MIT