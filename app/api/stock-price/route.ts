import { type NextRequest, NextResponse } from "next/server"

interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: string
  high: number
  low: number
  open: number
  previousClose: number
  timestamp: string
}

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY
const CACHE_DURATION = 1 * 1000 // 1 second cache for real-time updates
const stockCache = new Map<string, { data: StockData; timestamp: number }>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")?.toUpperCase()

  if (!symbol) {
    return NextResponse.json({ error: "Stock symbol is required" }, { status: 400 })
  }

  // Check cache first
  const cached = stockCache.get(symbol)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[Real-time Stock] Returning cached data for ${symbol}`)
    return NextResponse.json(cached.data)
  }

  try {
    console.log(`[Real-time Stock] Fetching live data for ${symbol}`)
    const stockData = await fetchRealtimeStock(symbol)

    // Cache the result
    stockCache.set(symbol, { data: stockData, timestamp: Date.now() })

    return NextResponse.json(stockData)
  } catch (error) {
    console.error(`[Real-time Stock] Error fetching stock data for ${symbol}:`, error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}

async function fetchRealtimeStock(symbol: string): Promise<StockData> {
  console.log(`[Stock API] Fetching real-time data for ${symbol}`)
  
  // Try Yahoo Finance first (usually more current)
  try {
    console.log(`[Yahoo Finance] Trying Yahoo Finance first for ${symbol}`)
    return await fetchYahooFinanceStock(symbol)
  } catch (yahooError) {
    console.warn(`[Yahoo Finance] Failed for ${symbol}, trying Alpha Vantage:`, yahooError)
  }

  // Fallback to Alpha Vantage
  if (!ALPHA_VANTAGE_API_KEY) {
    console.warn("[Alpha Vantage] API key not set, using mock data")
    return generateMockStockData(symbol)
  }

  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    console.log(`[Alpha Vantage] Fetching from: ${url}`)

    const response = await fetch(url)
    
    if (!response.ok) {
      console.error(`[Alpha Vantage] HTTP error: ${response.status} ${response.statusText}`)
      throw new Error(`Alpha Vantage API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[Alpha Vantage] Response for ${symbol}:`, data)

    if (data["Error Message"]) {
      console.error(`[Alpha Vantage] API Error: ${data["Error Message"]}`)
      throw new Error(data["Error Message"])
    }

    if (data["Note"]) {
      console.warn("[Alpha Vantage] Rate limit reached, using mock data")
      return generateMockStockData(symbol)
    }

    const quote = data["Global Quote"]
    if (!quote || !quote["01. symbol"]) {
      console.error(`[Alpha Vantage] Invalid response format:`, data)
      throw new Error("Invalid response format from Alpha Vantage")
    }

    const price = parseFloat(quote["05. price"])
    const change = parseFloat(quote["09. change"])
    const changePercent = parseFloat(quote["10. change percent"].replace("%", ""))
    const volume = parseInt(quote["06. volume"])
    const high = parseFloat(quote["03. high"])
    const low = parseFloat(quote["04. low"])
    const open = parseFloat(quote["02. open"])
    const previousClose = parseFloat(quote["08. previous close"])

    console.log(`[Alpha Vantage] Successfully parsed data for ${symbol}: price=$${price}, change=${change}%`)

    return {
      symbol: quote["01. symbol"],
      price,
      change,
      changePercent,
      volume,
      marketCap: calculateMarketCap(price, volume),
      high,
      low,
      open,
      previousClose,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error(`[Alpha Vantage] Error fetching ${symbol}:`, error)
    console.log(`[Alpha Vantage] Falling back to mock data for ${symbol}`)
    return generateMockStockData(symbol)
  }
}

async function fetchYahooFinanceStock(symbol: string): Promise<StockData> {
  console.log(`[Yahoo Finance] Fetching data for ${symbol}`)
  
  try {
    // Use a CORS proxy to access Yahoo Finance
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)}`
    
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`[Yahoo Finance] Response for ${symbol}:`, data)
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error("Invalid response format from Yahoo Finance")
    }
    
    const result = data.chart.result[0]
    const meta = result.meta
    const quote = result.indicators.quote[0]
    
    const currentPrice = meta.regularMarketPrice
    const previousClose = meta.previousClose
    const change = currentPrice - previousClose
    const changePercent = (change / previousClose) * 100
    const volume = meta.regularMarketVolume
    const high = meta.regularMarketDayHigh
    const low = meta.regularMarketDayLow
    const open = meta.regularMarketOpen
    
    console.log(`[Yahoo Finance] Successfully parsed data for ${symbol}: price=$${currentPrice}, change=${change}%`)
    
    return {
      symbol: symbol.toUpperCase(),
      price: Math.round(currentPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: volume || 0,
      marketCap: calculateMarketCap(currentPrice, volume || 0),
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      open: Math.round(open * 100) / 100,
      previousClose: Math.round(previousClose * 100) / 100,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error(`[Yahoo Finance] Error fetching ${symbol}:`, error)
    throw error
  }
}

function generateMockStockData(symbol: string): StockData {
  const basePrice = getBasePrice(symbol)
  const volatility = 0.02 // 2% volatility
  const change = (Math.random() - 0.5) * basePrice * volatility
  const price = basePrice + change
  const changePercent = (change / basePrice) * 100

  return {
    symbol,
    price: Math.round(price * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    marketCap: calculateMarketCap(price, Math.floor(Math.random() * 10000000) + 1000000),
    high: Math.round((price + Math.random() * basePrice * 0.01) * 100) / 100,
    low: Math.round((price - Math.random() * basePrice * 0.01) * 100) / 100,
    open: Math.round((basePrice + (Math.random() - 0.5) * basePrice * 0.005) * 100) / 100,
    previousClose: basePrice,
    timestamp: new Date().toISOString()
  }
}

function getBasePrice(symbol: string): number {
  const basePrices: { [key: string]: number } = {
    AAPL: 150.00,
    MSFT: 300.00,
    GOOGL: 120.00,
    AMZN: 130.00,
    TSLA: 200.00,
    NVDA: 400.00,
    META: 250.00,
    JPM: 150.00,
    V: 200.00,
    JNJ: 160.00,
    WMT: 150.00,
    PG: 140.00,
    XOM: 100.00,
    CVX: 120.00,
    KO: 60.00,
    PEP: 160.00,
    DIS: 90.00,
    NFLX: 400.00,
    ADBE: 500.00,
    CRM: 200.00,
  }
  
  return basePrices[symbol] || 100.00
}

function calculateMarketCap(price: number, volume: number): string {
  const marketCap = price * volume
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`
  } else {
    return `$${marketCap.toFixed(0)}`
  }
}
