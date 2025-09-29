# Real-Time Data Setup Guide

## ✅ **Real-Time Data Implementation Complete!**

Your RetailPulse app now has real-time data integration for:
- **Stock Prices** (Alpha Vantage API)
- **Reddit Posts** (Reddit JSON API)
- **Twitter Posts** (Twitter API v2)
- **Social Sentiment Analysis** (Combined real-time data)

## 🔧 **API Keys Setup**

Create a `.env.local` file in your project root with the following API keys:

```bash
# OpenAI API Key for sentiment analysis
OPENAI_API_KEY=your_openai_api_key_here

# Twitter API Bearer Token
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# Alpha Vantage API Key for real-time stock data
# Get your free API key from: https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here

# Reddit API credentials (optional - for enhanced Reddit data)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
```

## 🚀 **How to Get API Keys**

### 1. Alpha Vantage (Stock Data)
- Go to: https://www.alphavantage.co/support/#api-key
- Sign up for a free account
- Copy your API key and replace `your_alpha_vantage_api_key_here`

### 2. Twitter API (Already configured)
- Your Twitter Bearer Token is already set up
- No additional action needed

### 3. Reddit API (Optional)
- Go to: https://www.reddit.com/prefs/apps
- Create a new app
- Copy Client ID and Secret

## 📊 **What's Real-Time Now**

### Stock Prices
- **Real-time price updates** every 30 seconds
- **Live market data** from Alpha Vantage
- **Fallback to mock data** if API fails
- **Company names and sectors** included

### Reddit Posts
- **Live posts** from r/wallstreetbets, r/investing, r/stocks, etc.
- **Real sentiment analysis** using keyword detection
- **Relevance scoring** for better filtering
- **Fallback to enhanced mock data** if Reddit API fails

### Twitter Posts
- **Live tweets** mentioning the stock symbol
- **Real engagement metrics** (likes, retweets)
- **Sentiment analysis** using AI
- **Fallback to enhanced mock data** if Twitter API fails

### Social Sentiment
- **Combined analysis** from Reddit + Twitter
- **AI-powered sentiment scoring**
- **Trending topics** detection
- **Confidence scores** for each analysis

## 🔄 **Auto-Refresh Features**

- **Stock prices**: Updates every 30 seconds
- **Social media**: Updates every 5 minutes
- **Caching**: 2-5 minute cache to avoid rate limits
- **Error handling**: Graceful fallback to mock data

## 🧪 **Test the Real-Time Data**

1. **Start your app**: `npm run dev`
2. **Select a stock** (e.g., AAPL, MSFT, TSLA)
3. **Click "Analyze Stock"**
4. **Watch the real-time updates** in the console logs
5. **See live data** in the analysis dashboard

## 📝 **Console Logs**

You'll see real-time logs like:
```
[Real-time Stock] Fetching live data for AAPL
[Real-time Reddit] Fetching live data for AAPL
[Real-time Twitter] Fetching live data for AAPL
[Social Sentiment] Fetched 5 Reddit posts for AAPL
[Social Sentiment] Fetched 5 Twitter posts for AAPL
```

## 🎯 **Next Steps**

1. **Add your Alpha Vantage API key** to get real stock prices
2. **Test with different stocks** to see the variety of data
3. **Monitor the console** to see real-time data fetching
4. **Enjoy your real-time financial sentiment analysis app!**

The app will work with mock data even without API keys, but adding the Alpha Vantage key will give you real stock prices!
