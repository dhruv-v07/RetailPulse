import { type NextRequest, NextResponse } from "next/server"

interface RedditPost {
  id: string
  title: string
  url: string
  score: number
  num_comments: number
  created_utc: number
  subreddit: string
  author: string
  selftext: string
  sentiment?: number
  relevanceScore?: number
  permalink: string
  summary?: string
}

interface SentimentAnalysis {
  overall: number
  reddit: number
  aiConfidence: number
  mentions: {
    reddit: number
    total: number
  }
  redditPosts: RedditPost[]
  trends: Array<{
    source: string
    sentiment: string
    confidence: number
    change: string
  }>
  keyTopics: string[]
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")

  if (!symbol) {
    return NextResponse.json({ error: "Stock symbol is required" }, { status: 400 })
  }

  try {
    console.log(`[Social Sentiment] Fetching social sentiment for ${symbol}`)

    // Use fallback Reddit data directly (no internal API calls)
    const redditData = await fetchRedditData(symbol)
    console.log(`[Social Sentiment] Using ${redditData.length} Reddit posts for ${symbol}`)

    // Use OpenAI for sentiment analysis
    const aiAnalysis = await analyzeWithOpenAI(redditData, symbol)

    return NextResponse.json({
      overall: aiAnalysis.overall,
      reddit: aiAnalysis.reddit,
      aiConfidence: aiAnalysis.confidence,
      mentions: {
        reddit: redditData.length,
        total: redditData.length
      },
      redditPosts: redditData.slice(0, 10),
      trends: aiAnalysis.trends,
      keyTopics: aiAnalysis.keyTopics
    })
  } catch (error) {
    console.error(`[Social Sentiment] Error analyzing ${symbol}:`, error)
    return NextResponse.json({ error: "Failed to fetch social sentiment" }, { status: 500 })
  }
}

async function fetchRedditData(symbol: string): Promise<RedditPost[]> {
  console.log(`[Social Sentiment] Fetching fallback Reddit data for ${symbol}`)

  // Enhanced mock data with 10+ posts
  const mockRedditPosts: RedditPost[] = [
    {
      id: "reddit_1",
      title: `${symbol} Q4 earnings beat expectations - strong guidance for 2024`,
      url: `https://reddit.com/r/stocks/comments/${symbol.toLowerCase()}_earnings_beat`,
      score: 1247,
      num_comments: 189,
      created_utc: Date.now() / 1000 - 3600,
      subreddit: "stocks",
      author: "investor_guru",
      selftext: "Looks like a great entry point for long-term investors. The market is underestimating their growth potential.",
      sentiment: 0.85,
      relevanceScore: 0.95,
      permalink: `/r/stocks/comments/${symbol.toLowerCase()}_earnings_beat`
    },
    {
      id: "reddit_2",
      title: `Why ${symbol} is poised for a breakout in the next quarter`,
      url: `https://reddit.com/r/wallstreetbets/comments/${symbol.toLowerCase()}_breakout`,
      score: 890,
      num_comments: 345,
      created_utc: Date.now() / 1000 - 7200,
      subreddit: "wallstreetbets",
      author: "diamond_hands_joe",
      selftext: "All the indicators are lining up. This is going to the moon! 🚀",
      sentiment: 0.92,
      relevanceScore: 0.90,
      permalink: `/r/wallstreetbets/comments/${symbol.toLowerCase()}_breakout`
    },
    {
      id: "reddit_3",
      title: `Concern about ${symbol}'s new product launch delays`,
      url: `https://reddit.com/r/investing/comments/${symbol.toLowerCase()}_product_delays`,
      score: 310,
      num_comments: 78,
      created_utc: Date.now() / 1000 - 10800,
      subreddit: "investing",
      author: "cautious_capital",
      selftext: "The delays could impact Q1 revenue. Need to watch this closely.",
      sentiment: 0.30,
      relevanceScore: 0.80,
      permalink: `/r/investing/comments/${symbol.toLowerCase()}_product_delays`
    },
    {
      id: "reddit_4",
      title: `Daily discussion thread - ${symbol} mentioned frequently`,
      url: `https://reddit.com/r/stocks/comments/daily_discussion_${symbol.toLowerCase()}`,
      score: 560,
      num_comments: 210,
      created_utc: Date.now() / 1000 - 14400,
      subreddit: "stocks",
      author: "auto_mod",
      selftext: "Lots of chatter about ${symbol} today. What are your thoughts?",
      sentiment: 0.65,
      relevanceScore: 0.70,
      permalink: `/r/stocks/comments/daily_discussion_${symbol.toLowerCase()}`
    },
    {
      id: "reddit_5",
      title: `Is ${symbol} a buy at current levels?`,
      url: `https://reddit.com/r/investing/comments/${symbol.toLowerCase()}_buy_or_sell`,
      score: 420,
      num_comments: 150,
      created_utc: Date.now() / 1000 - 18000,
      subreddit: "investing",
      author: "market_watcher",
      selftext: "Considering adding to my position, but worried about macro headwinds.",
      sentiment: 0.55,
      relevanceScore: 0.75,
      permalink: `/r/investing/comments/${symbol.toLowerCase()}_buy_or_sell`
    },
    {
      id: "reddit_6",
      title: `Massive short squeeze potential for ${symbol}?`,
      url: `https://reddit.com/r/wallstreetbets/comments/${symbol.toLowerCase()}_short_squeeze`,
      score: 1500,
      num_comments: 700,
      created_utc: Date.now() / 1000 - 21600,
      subreddit: "wallstreetbets",
      author: "wsb_legend",
      selftext: "The shorts are trapped! Let's send it to the moon!",
      sentiment: 0.98,
      relevanceScore: 0.99,
      permalink: `/r/wallstreetbets/comments/${symbol.toLowerCase()}_short_squeeze`
    },
    {
      id: "reddit_7",
      title: `Technical analysis: ${symbol} forming a bullish pattern`,
      url: `https://reddit.com/r/stocks/comments/${symbol.toLowerCase()}_technical_analysis`,
      score: 700,
      num_comments: 90,
      created_utc: Date.now() / 1000 - 25200,
      subreddit: "stocks",
      author: "chart_master",
      selftext: "Looks like a cup and handle. Very bullish.",
      sentiment: 0.80,
      relevanceScore: 0.88,
      permalink: `/r/stocks/comments/${symbol.toLowerCase()}_technical_analysis`
    },
    {
      id: "reddit_8",
      title: `New competitor entering ${symbol}'s market`,
      url: `https://reddit.com/r/investing/comments/${symbol.toLowerCase()}_competitor`,
      score: 200,
      num_comments: 50,
      created_utc: Date.now() / 1000 - 28800,
      subreddit: "investing",
      author: "industry_insider",
      selftext: "This could put pressure on ${symbol}'s margins.",
      sentiment: 0.20,
      relevanceScore: 0.70,
      permalink: `/r/investing/comments/${symbol.toLowerCase()}_competitor`
    },
    {
      id: "reddit_9",
      title: `${symbol} dividend increase announced!`,
      url: `https://reddit.com/r/stocks/comments/${symbol.toLowerCase()}_dividend`,
      score: 1100,
      num_comments: 120,
      created_utc: Date.now() / 1000 - 32400,
      subreddit: "stocks",
      author: "dividend_hunter",
      selftext: "Great news for long-term holders!",
      sentiment: 0.90,
      relevanceScore: 0.93,
      permalink: `/r/stocks/comments/${symbol.toLowerCase()}_dividend`
    },
    {
      id: "reddit_10",
      title: `Options activity for ${symbol} is heating up`,
      url: `https://reddit.com/r/wallstreetbets/comments/${symbol.toLowerCase()}_options`,
      score: 600,
      num_comments: 250,
      created_utc: Date.now() / 1000 - 36000,
      subreddit: "wallstreetbets",
      author: "options_trader",
      selftext: "Calls are flying off the shelves. Something big is coming.",
      sentiment: 0.88,
      relevanceScore: 0.85,
      permalink: `/r/wallstreetbets/comments/${symbol.toLowerCase()}_options`
    }
  ]

  // Filter posts to be within the last 30 days
  const thirtyDaysAgo = Date.now() / 1000 - 30 * 24 * 60 * 60
  const recentPosts = mockRedditPosts.filter(post => post.created_utc >= thirtyDaysAgo)

  // Sort by a combination of relevance, recency, and score
  const sortedPosts = recentPosts.sort((a, b) => {
    const aScore = (a.relevanceScore || 0) * 0.4 + (a.sentiment || 0) * 0.3 + (a.score / 1000) * 0.3
    const bScore = (b.relevanceScore || 0) * 0.4 + (b.sentiment || 0) * 0.3 + (b.score / 1000) * 0.3
    return bScore - aScore
  })

  return sortedPosts.slice(0, 15)
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

async function analyzeWithOpenAI(redditPosts: RedditPost[], symbol: string) {
  if (!OPENAI_API_KEY) {
    console.warn("[OpenAI] OPENAI_API_KEY is not set. Skipping AI analysis.")
    return {
      overall: 0.5,
      reddit: 0.5,
      confidence: 0.5,
      trends: [],
      keyTopics: []
    }
  }

  const postsText = redditPosts.map(post => `${post.title} ${post.selftext}`).join("\n\n")

  if (postsText.trim() === "") {
    return {
      overall: 0.5,
      reddit: 0.5,
      confidence: 0.5,
      trends: [],
      keyTopics: []
    }
  }

  const prompt = `Analyze the sentiment of the following Reddit posts about ${symbol}. Provide an overall sentiment score for Reddit (0-1 for bearish to bullish), a confidence score (0-1), 3 key trends, and 3 key topics.

Reddit Posts:
${postsText}

Format your response as a JSON object:
{
  "overall": number,
  "reddit": number,
  "confidence": number,
  "trends": [
    {"source": "Reddit", "sentiment": "Bullish/Neutral/Bearish", "confidence": number, "change": "Up/Down/Stable"},
    {"source": "Reddit", "sentiment": "Bullish/Neutral/Bearish", "confidence": number, "change": "Up/Down/Stable"},
    {"source": "Reddit", "sentiment": "Bullish/Neutral/Bearish", "confidence": number, "change": "Up/Down/Stable"}
  ],
  "keyTopics": ["topic1", "topic2", "topic3"]
}`

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[OpenAI] API Error:", errorData)
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    console.log("[OpenAI] Raw response:", content)

    // Attempt to parse JSON, handle cases where AI might return extra text
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      // Ensure sentiment values are numbers between 0 and 1
      parsed.overall = Math.max(0, Math.min(1, parsed.overall))
      parsed.reddit = Math.max(0, Math.min(1, parsed.reddit))
      parsed.confidence = Math.max(0, Math.min(1, parsed.confidence))
      return parsed
    } else {
      console.error("[OpenAI] Could not parse JSON from AI response:", content)
      throw new Error("Failed to parse AI sentiment analysis response.")
    }
  } catch (error) {
    console.error("[OpenAI] Error during AI analysis:", error)
    // Fallback to default sentiment if AI analysis fails
    return {
      overall: 0.5,
      reddit: 0.5,
      confidence: 0.5,
      trends: [],
      keyTopics: []
    }
  }
}
