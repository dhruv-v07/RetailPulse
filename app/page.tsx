"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockSelector } from "@/components/stock-selector"
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  MessageSquare, 
  Brain,
  ArrowRight,
  Activity,
  DollarSign,
  Users,
  Target,
  LogOut,
  User,
  RefreshCw
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const [selectedStock, setSelectedStock] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const { user, userProfile, logout } = useAuth()

  const fetchAnalysisData = async (symbol: string) => {
    try {
      // Fetch real-time data
      const [stockResponse, sentimentResponse, redditResponse] = await Promise.all([
        fetch(`/api/stock-price?symbol=${symbol}`),
        fetch(`/api/social-sentiment?symbol=${symbol}`),
        fetch(`/api/realtime-reddit?symbol=${symbol}&limit=15`)
      ])
      
      let stockData = null
      let sentimentData = null
      let redditData = null
      
      if (stockResponse.ok) {
        stockData = await stockResponse.json()
        console.log('Stock data received:', stockData)
        console.log('Stock price:', stockData?.price)
        console.log('Stock change:', stockData?.change)
        console.log('Stock change percent:', stockData?.changePercent)
      } else {
        console.error('Stock response not ok:', stockResponse.status, stockResponse.statusText)
      }
      
      if (sentimentResponse.ok) {
        sentimentData = await sentimentResponse.json()
        console.log('Sentiment data:', sentimentData)
      }

      if (redditResponse.ok) {
        redditData = await redditResponse.json()
        console.log('Reddit data:', redditData)
        console.log('Reddit data length:', redditData?.length)
      } else {
        console.log('Reddit response not ok:', redditResponse.status, redditResponse.statusText)
      }

      // Generate AI recommendation
      let aiRecommendation = null
      try {
        console.log('Generating AI recommendation...')
        const aiResponse = await fetch('/api/ai-recommendation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symbol,
            stockData,
            sentimentData,
            redditData
          })
        })

        if (aiResponse.ok) {
          aiRecommendation = await aiResponse.json()
          console.log('AI recommendation:', aiRecommendation)
        } else {
          console.error('AI recommendation failed:', aiResponse.status)
        }
      } catch (aiError) {
        console.error('Error generating AI recommendation:', aiError)
      }

      setAnalysisData({ stockData, sentimentData, redditData, aiRecommendation })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleAnalyze = async (symbol: string) => {
    setSelectedStock(symbol)
    setIsAnalyzing(true)
    
    await fetchAnalysisData(symbol)
    setIsAnalyzing(false)
  }

  const handleRefresh = async () => {
    if (selectedStock) {
      setIsAnalyzing(true)
      await fetchAnalysisData(selectedStock)
      setIsAnalyzing(false)
    }
  }


  // Auto-update all data every 10 seconds when a stock is selected
  useEffect(() => {
    if (!selectedStock) return

    const interval = setInterval(() => {
      handleRefresh()
    }, 10000) // 10 seconds

    return () => clearInterval(interval)
  }, [selectedStock])

  // Check if market is open (9:30 AM - 4:00 PM ET, Monday-Friday)
  const isMarketOpen = () => {
    const now = new Date()
    const etTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}))
    const day = etTime.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hour = etTime.getHours()
    const minute = etTime.getMinutes()
    const timeInMinutes = hour * 60 + minute
    
    // Market is closed on weekends
    if (day === 0 || day === 6) return false
    
    // Market hours: 9:30 AM - 4:00 PM ET (570 minutes to 960 minutes)
    const marketOpen = 9 * 60 + 30 // 9:30 AM
    const marketClose = 16 * 60 // 4:00 PM
    
    return timeInMinutes >= marketOpen && timeInMinutes < marketClose
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">RetailPulse</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <User className="w-4 h-4" />
                    <span className="text-sm">
                      {userProfile?.firstName || user.displayName || user.email}
                    </span>
                  </div>
                  <button 
                    onClick={logout}
                    className="px-4 py-2 border border-slate-600 rounded-md hover:bg-slate-800/50 text-slate-300 hover:text-white transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 border border-slate-600 rounded-md hover:bg-slate-800/50 text-slate-300 hover:text-white transition-colors">
                    Log In
                  </Link>
                  <Link href="/signup" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Real-time Stock Sentiment from{" "}
              <span className="text-primary">Social Media</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Harness the power of AI to analyze Reddit sentiment for NYSE stocks. 
              Make informed trading decisions with real-time social media insights.
            </p>
            {!user && (
              <div className="flex justify-center">
                <Link href="/login">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Start Analysis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Stock Analysis Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto">
            <StockSelector 
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              isLoggedIn={!!user}
            />

            {selectedStock && analysisData && (
              <div className="mt-8">
                <Tabs defaultValue="overview" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                      <TabsTrigger value="social">Social Feed</TabsTrigger>
                    </TabsList>
                    
                    <button
                      onClick={handleRefresh}
                      disabled={isAnalyzing || !selectedStock}
                      className="ml-4 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh all data"
                    >
                      <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Current Price</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold flex items-center gap-2">
                            ${analysisData.stockData?.price?.toFixed(2) || "N/A"}
                            {analysisData.stockData?.price && (
                              <span className={`text-xs ${isMarketOpen() ? 'text-green-500 animate-pulse' : 'text-red-500'} font-semibold`}>
                                {isMarketOpen() ? 'LIVE' : 'CLOSED'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {analysisData.stockData?.changePercent ? 
                              `${analysisData.stockData.changePercent > 0 ? '+' : ''}${analysisData.stockData.changePercent.toFixed(2)}%` : 
                              'N/A'
                            } from previous close
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Updates every 10 seconds
                            {analysisData.stockData?.timestamp && (
                              <span className="block">
                                Last updated: {new Date(analysisData.stockData.timestamp).toLocaleTimeString()}
                              </span>
                            )}
                            <span className="block">
                              Market status: {isMarketOpen() ? 'Open' : 'Closed'} (ET)
                            </span>
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
                          <Brain className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {analysisData.sentimentData?.overall ? 
                              `+${(analysisData.sentimentData.overall * 100).toFixed(0)}` : 
                              'N/A'
                            }
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {analysisData.sentimentData?.overall ? 
                              (analysisData.sentimentData.overall > 0.6 ? 'Bullish' : 
                               analysisData.sentimentData.overall < 0.4 ? 'Bearish' : 'Neutral') : 
                              'N/A'
                            } sentiment
                          </p>
                        </CardContent>
                      </Card>
                      
                    </div>
                  </TabsContent>
                    
                  <TabsContent value="analytics" className="space-y-4">
                    {/* AI Recommendation */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="w-5 h-5" />
                          AI Investment Recommendation
                        </CardTitle>
                        <CardDescription>
                          AI-powered analysis based on current data and market sentiment
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analysisData.aiRecommendation ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Badge 
                                variant={analysisData.aiRecommendation.recommendation === 'BUY' ? 'default' : 
                                        analysisData.aiRecommendation.recommendation === 'SELL' ? 'destructive' : 'secondary'}
                                className="text-lg px-3 py-1"
                              >
                                {analysisData.aiRecommendation.recommendation || 'HOLD'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Confidence: {Math.round((analysisData.aiRecommendation.confidence || 0.5) * 100)}%
                              </span>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-sm mb-3">Key Points:</h4>
                                <div className="space-y-2">
                                  {(analysisData.aiRecommendation.keyPoints || [
                                    "Current price movement analysis",
                                    "Market sentiment evaluation", 
                                    "Social media activity review",
                                    "Risk assessment and recommendations",
                                    "Investment timeline considerations"
                                  ]).map((point: string, index: number) => (
                                    <div key={index} className="flex items-start gap-2 text-sm">
                                      <span className="text-primary font-bold text-lg leading-none mt-0.5">•</span>
                                      <span className="leading-relaxed">{point}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {analysisData.aiRecommendation.priceTarget && (
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">Price Target:</h4>
                                  <p className="text-sm text-muted-foreground">
                                    ${analysisData.aiRecommendation.priceTarget}
                                  </p>
                                </div>
                              )}
                              
                              {analysisData.aiRecommendation.timeframe && (
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">Timeframe:</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {analysisData.aiRecommendation.timeframe}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>AI recommendation will appear here after analysis</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                  </TabsContent>
                    
                  <TabsContent value="sentiment" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Sentiment Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Reddit</span>
                            <Badge variant="secondary" className="bg-green-50 text-green-700">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Bullish
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Overall</span>
                            <Badge variant="secondary" className="bg-green-50 text-green-700">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Bullish
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Key Topics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {analysisData.sentimentData?.keyTopics?.map((topic: string, index: number) => (
                              <Badge key={index} variant="outline">{topic}</Badge>
                            )) || (
                              <>
                                <Badge variant="outline">Earnings</Badge>
                                <Badge variant="outline">Growth</Badge>
                                <Badge variant="outline">Analyst Upgrade</Badge>
                                <Badge variant="outline">Technical Analysis</Badge>
                                <Badge variant="outline">Institutional Buying</Badge>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                    
                  <TabsContent value="social" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          Live Social Feed
                        </CardTitle>
                        <CardDescription>
                          Real-time Reddit posts about {selectedStock}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analysisData.redditData && analysisData.redditData.length > 0 ? (
                            analysisData.redditData.map((post: any, index: number) => (
                              <div key={post.id || index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      r/{post.subreddit}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(post.created_utc * 1000).toLocaleDateString()}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      by u/{post.author}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                      {post.score} upvotes
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {post.num_comments} comments
                                    </span>
                                  </div>
                                </div>
                                
                                <h4 className="font-semibold mb-3 text-lg leading-tight">
                                  <a 
                                    href={post.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-primary transition-colors"
                                  >
                                    {post.title}
                                  </a>
                                </h4>
                                
                                {post.selftext && (
                                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                    {post.selftext.length > 300 
                                      ? `${post.selftext.substring(0, 300)}...` 
                                      : post.selftext
                                    }
                                  </p>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 text-sm">
                                    <a 
                                      href={post.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                      Read on Reddit
                                    </a>
                                    <span className="text-muted-foreground">
                                      {post.relevanceScore ? `${Math.round(post.relevanceScore * 100)}% relevant` : ''}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                      👍 {post.score}
                                    </span>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      💬 {post.num_comments}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-12 text-muted-foreground">
                              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p className="text-lg font-medium mb-2">No Reddit posts available</p>
                              <p className="text-sm mb-4">Reddit API is experiencing rate limits. Please try refreshing in a few minutes.</p>
                              <Button 
                                onClick={handleRefresh}
                                disabled={isAnalyzing}
                                variant="outline"
                                size="sm"
                              >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                                Try Again
                              </Button>
                            </div>
                          )}
                </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <TrendingUp className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-bold text-white">RetailPulse</h3>
            </div>
            
            <div className="flex justify-center space-x-6 mb-6">
              <Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
            
            <div className="text-sm text-slate-400">
              <p>&copy; 2025 RetailPulse. All rights reserved.</p>
              <p className="mt-2">
                <strong className="text-slate-300">Disclaimer:</strong> This platform provides financial information for educational purposes only. 
                Not financial advice. Always consult a qualified financial advisor before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}