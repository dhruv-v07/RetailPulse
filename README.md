# RetailPulse

A stock analysis tool that shows real-time prices and what people on Reddit are saying about stocks.

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

## Running it yourself

You'll need Node.js installed first.

```bash
git clone <this-repo-url>
cd retailpulse
npm install
npm run dev
```

Then go to http://localhost:3000

You'll need to set up your own API keys in a `.env.local` file for the stock data and AI features to work.

## What it's made with

- Next.js for the website
- TypeScript for the code
- Tailwind for styling
- Firebase for user accounts
- Reddit API for posts
- OpenAI for AI recommendations
- Alpha Vantage for stock prices

## License

MIT