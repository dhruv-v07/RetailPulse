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
}

const REDDIT_API_BASE = "https://www.reddit.com"
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache
const redditCache = new Map<string, { data: RedditPost[]; timestamp: number }>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")?.toUpperCase()
  const limit = parseInt(searchParams.get("limit") || "15", 10)

  if (!symbol) {
    return NextResponse.json({ error: "Stock symbol is required" }, { status: 400 })
  }

  // Check cache first
  const cacheKey = `${symbol}-${limit}`
  const cached = redditCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[Real-time Reddit] Returning cached data for ${symbol}`)
    return NextResponse.json(cached.data)
  }

  try {
    console.log(`[Real-time Reddit] Fetching live data for ${symbol}`)
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 15000)
    )
    
    const redditPostsPromise = fetchRealtimeReddit(symbol, limit)
    
    const redditPosts = await Promise.race([redditPostsPromise, timeoutPromise]) as RedditPost[]
    
    // Cache the result
    redditCache.set(cacheKey, { data: redditPosts, timestamp: Date.now() })

    return NextResponse.json(redditPosts)
  } catch (error) {
    console.error(`[Real-time Reddit] Error fetching Reddit data for ${symbol}:`, error)
    // Return empty array instead of error to prevent frontend from breaking
    return NextResponse.json([])
  }
}

async function fetchRealtimeReddit(symbol: string, limit: number): Promise<RedditPost[]> {
  const companyNames = getCompanyNames(symbol)
  
  // Use a simple, reliable approach - just get hot posts and filter
  const subreddits = ["wallstreetbets", "stocks"]
  let allPosts: RedditPost[] = []
  const fetchedIds = new Set<string>()

  // Add delay between requests to avoid rate limiting
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  for (const subreddit of subreddits) {
    try {
      const hotUrl = `${REDDIT_API_BASE}/r/${subreddit}/hot.json?limit=${limit * 2}`
      console.log(`[Reddit API] Fetching hot posts from: ${hotUrl}`)
      
      const response = await fetch(hotUrl, {
        headers: {
          "User-Agent": "RetailPulseApp/1.0 (by /u/yourusername)",
          "Accept": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`[Reddit API] Got ${data?.data?.children?.length || 0} posts from r/${subreddit}`)
        
        if (data?.data?.children) {
          data.data.children.forEach((child: any) => {
            const post = child.data
            if (!fetchedIds.has(post.id) && post.selftext && post.selftext.length > 50) {
              // Very lenient relevance check - include more posts
              const isRelevant = isPostRelevantToStock(post, symbol, companyNames)
              if (isRelevant) {
                allPosts.push({
                  id: post.id,
                  title: post.title,
                  url: `${REDDIT_API_BASE}${post.permalink}`,
                  score: post.score,
                  num_comments: post.num_comments,
                  created_utc: post.created_utc,
                  subreddit: post.subreddit,
                  author: post.author,
                  selftext: post.selftext,
                  permalink: post.permalink,
                })
                fetchedIds.add(post.id)
                console.log(`[Reddit API] Added post: "${post.title.substring(0, 50)}..."`)
              }
            }
          })
        }
      } else if (response.status === 429) {
        console.log(`[Reddit API] Rate limited on r/${subreddit}, waiting 3 seconds...`)
        await delay(3000)
      } else {
        console.error(`[Reddit API] Error fetching from r/${subreddit}: ${response.status}`)
      }

      // Add delay between subreddits
      await delay(2000)
      
    } catch (error) {
      console.error(`[Reddit API] Error fetching from r/${subreddit}:`, error)
      await delay(2000)
    }
  }

  console.log(`[Reddit API] Found ${allPosts.length} total posts for ${symbol}`)

  // If we don't have enough posts, try a different approach
  if (allPosts.length < 3) {
    console.log(`[Reddit API] Not enough relevant posts found, trying alternative approach...`)
    
    // Try r/stocks subreddit as fallback
    try {
      const stocksUrl = `${REDDIT_API_BASE}/r/stocks/hot.json?limit=${limit}`
      console.log(`[Reddit API] Trying r/stocks: ${stocksUrl}`)
      
      const stocksResponse = await fetch(stocksUrl, {
        headers: {
          "User-Agent": "RetailPulseApp/1.0 (by /u/yourusername)",
          "Accept": "application/json",
        },
      })

      if (stocksResponse.ok) {
        const data = await stocksResponse.json()
        if (data?.data?.children) {
          data.data.children.forEach((child: any) => {
            const post = child.data
            if (!fetchedIds.has(post.id) && post.selftext && post.selftext.length > 50) {
              const isRelevant = isPostRelevantToStock(post, symbol, companyNames)
              if (isRelevant) {
                allPosts.push({
                  id: post.id,
                  title: post.title,
                  url: `${REDDIT_API_BASE}${post.permalink}`,
                  score: post.score,
                  num_comments: post.num_comments,
                  created_utc: post.created_utc,
                  subreddit: post.subreddit,
                  author: post.author,
                  selftext: post.selftext,
                  permalink: post.permalink,
                })
                fetchedIds.add(post.id)
              }
            }
          })
        }
      }
    } catch (error) {
      console.error(`[Reddit API] Error fetching from r/stocks:`, error)
    }
  }

  // Filter posts to be within the last 7 days (more lenient)
  const sevenDaysAgo = Date.now() / 1000 - 7 * 24 * 60 * 60
  const recentPosts = allPosts.filter(post => post.created_utc >= sevenDaysAgo)

  console.log(`[Reddit API] Found ${recentPosts.length} recent posts for ${symbol}`)

  // If no recent posts, use all posts regardless of date
  const postsToUse = recentPosts.length > 0 ? recentPosts : allPosts
  console.log(`[Reddit API] Using ${postsToUse.length} posts for ${symbol}`)

  // Calculate a viral score based on relevance, recency, and engagement
  const scoredPosts = postsToUse.map(post => {
    const recencyScore = 1 - (Date.now() / 1000 - post.created_utc) / (7 * 24 * 60 * 60)
    const engagementScore = (post.score + post.num_comments * 5) / 1000
    const relevanceScore = (post.title.toLowerCase().includes(symbol.toLowerCase()) || companyNames.some(name => post.title.toLowerCase().includes(name.toLowerCase()))) ? 1 : 0.5

    const viralScore = (recencyScore * 0.4) + (engagementScore * 0.4) + (relevanceScore * 0.2)
    return { ...post, relevanceScore: Math.min(1, viralScore) }
  })

  // Sort by viral score and take the top 'limit' posts
  const sortedPosts = scoredPosts.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
  const finalPosts = sortedPosts.slice(0, limit)

  console.log(`[Reddit API] Returning ${finalPosts.length} relevant posts for ${symbol}`)
  return finalPosts
}

function isPostRelevantToStock(post: any, symbol: string, companyNames: string[]): boolean {
  const title = post.title.toLowerCase()
  const selftext = post.selftext.toLowerCase()
  const combinedText = `${title} ${selftext}`
  
  // Very lenient filtering - include posts with any stock-related terms
  const stockTerms = [
    'stock', 'stocks', 'trading', 'invest', 'investment', 'portfolio', 
    'market', 'bull', 'bear', 'calls', 'puts', 'options', 'earnings',
    'dividend', 'buy', 'sell', 'hold', 'long', 'short', 'squeeze',
    'wsb', 'wallstreetbets', 'tendies', 'moon', 'diamond hands',
    'paper hands', 'hodl', 'yolo', 'dd', 'analysis', 'fundamental',
    'technical', 'chart', 'candlestick', 'support', 'resistance'
  ]

  // Check for any stock-related terms
  for (const term of stockTerms) {
    if (combinedText.includes(term)) {
      return true
    }
  }

  // Check for direct symbol mentions
  if (combinedText.includes(symbol.toLowerCase())) {
    return true
  }
  
  // Check for company name mentions
  for (const companyName of companyNames) {
    if (combinedText.includes(companyName.toLowerCase())) {
      return true
    }
  }
  
  return false
}

function getCompanySpecificTerms(symbol: string): string[] {
  const companyTerms: { [key: string]: string[] } = {
    AAPL: ["iphone", "ipad", "macbook", "apple watch", "app store", "ios", "macos", "tim cook", "apple ecosystem"],
    MSFT: ["windows", "office", "azure", "xbox", "microsoft office", "satya nadella", "teams", "linkedin"],
    GOOGL: ["google", "youtube", "android", "chrome", "search", "alphabet", "sundar pichai", "google cloud"],
    AMZN: ["amazon", "aws", "prime", "jeff bezos", "andy jassy", "amazon web services", "e-commerce"],
    TSLA: ["tesla", "elon musk", "model s", "model 3", "model x", "model y", "cybertruck", "autopilot", "fsd"],
    NVDA: ["nvidia", "gpu", "rtx", "gtx", "cuda", "ai", "machine learning", "jensen huang", "gaming"],
    META: ["facebook", "meta", "instagram", "whatsapp", "oculus", "vr", "ar", "mark zuckerberg", "metaverse"],
    JPM: ["jpmorgan", "chase", "jamie dimon", "banking", "investment bank", "jpm"],
    V: ["visa", "credit card", "payment", "fintech", "digital payments"],
    JNJ: ["johnson", "pharmaceutical", "vaccine", "medical", "healthcare"],
  }
  
  return companyTerms[symbol] || []
}

function getCompanyNames(symbol: string): string[] {
  const companyMap: { [key: string]: string[] } = {
    AAPL: ["Apple Inc", "Apple"],
    MSFT: ["Microsoft Corp", "Microsoft"],
    GOOGL: ["Alphabet Inc", "Alphabet", "Google"],
    AMZN: ["Amazon.com Inc", "Amazon"],
    TSLA: ["Tesla Inc", "Tesla"],
    NVDA: ["NVIDIA Corp", "NVIDIA"],
    META: ["Meta Platforms Inc", "Meta", "Facebook"],
    JPM: ["JPMorgan Chase & Co", "JPMorgan", "Chase"],
    V: ["Visa Inc", "Visa"],
    JNJ: ["Johnson & Johnson", "Johnson"],
    WMT: ["Walmart Inc", "Walmart"],
    PG: ["Procter & Gamble Co", "Procter & Gamble"],
    XOM: ["Exxon Mobil Corp", "Exxon Mobil"],
    CVX: ["Chevron Corp", "Chevron"],
    KO: ["Coca-Cola Co", "Coca-Cola"],
    PEP: ["PepsiCo Inc", "PepsiCo"],
    DIS: ["Walt Disney Co", "Disney"],
    NFLX: ["Netflix Inc", "Netflix"],
    ADBE: ["Adobe Inc", "Adobe"],
    CRM: ["Salesforce Inc", "Salesforce"],
  }
  
  return companyMap[symbol] || []
}
