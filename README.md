# 🔥 RetailPulse

AI-powered analysis of retail investor sentiment from Reddit and StockTwits.

## Features

- **Real-time Sentiment Analysis**: Bullish, bearish, and neutral sentiment breakdown
- **Daily Market Digest**: AI-generated 3-bullet summary of market trends
- **Trend Clusters**: Identified themes and patterns from retail discussions
- **Beautiful Dashboard**: Modern, responsive UI built with Next.js and Tailwind CSS
- **Interactive Charts**: Visual sentiment analysis using Chart.js

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd retailpulse
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:
```
OPENAI_API_KEY=your_openai_api_key_here

```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
retailpulse/
├── src/
│   ├── app/
│   │   ├── api/analyze/     # AI analysis API endpoint
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main dashboard page
│   ├── components/
│   │   ├── SentimentChart.tsx    # Pie chart component
│   │   ├── DailyDigest.tsx       # Digest card component
│   │   └── TrendClusters.tsx     # Trend clusters component
│   └── lib/                 # Utility functions
├── sample-data/
│   └── retail_posts.json    # Sample retail posts data
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## API Integration

### Current Implementation
- Uses mock data for demonstration
- Sample posts from `sample-data/retail_posts.json`

### Production Setup
To integrate with real data sources:

1. **Reddit API**: Add Reddit client credentials to `.env.local`
2. **StockTwits API**: Add StockTwits API key
3. **OpenAI Integration**: Uncomment OpenAI code in `/api/analyze/route.ts`

### Example API Usage

```typescript
// GET /api/analyze
const response = await fetch('/api/analyze')
const data = await response.json()

// Returns:
{
  sentimentBreakdown: { bullish: 45, bearish: 30, neutral: 25 },
  digest: ["Tech stocks bullish...", "Fed concerns...", "AI sector..."],
  clusters: [
    { theme: "Tech Earnings", description: "...", sentiment: "bullish" }
  ]
}
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## Customization

### Adding New Data Sources
1. Create new API route in `src/app/api/`
2. Update data fetching logic in main page
3. Modify analysis prompt for new data format

### Styling
- Modify `tailwind.config.js` for theme customization
- Update component styles in individual component files
- Global styles in `src/app/globals.css`

### Chart Customization
- Modify `src/components/SentimentChart.tsx`
- Add new chart types using Chart.js
- Update color scheme in chart configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please open a GitHub issue or contact the development team.

---

Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and Chart.js

