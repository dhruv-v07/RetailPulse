"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  TrendingUp, 
  Activity,
  Building2,
  BarChart3
} from "lucide-react"
import { NYSE_STOCKS, searchStocks, type NYSEStock } from "@/lib/nyse-stocks"

interface StockSelectorProps {
  onAnalyze: (symbol: string) => void
  isAnalyzing: boolean
  isLoggedIn: boolean
}

export function StockSelector({ onAnalyze, isAnalyzing, isLoggedIn }: StockSelectorProps) {
  const [selectedStock, setSelectedStock] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()

  const filteredStocks = useMemo(() => {
    return searchStocks(searchQuery)
  }, [searchQuery])

  const selectedStockData = useMemo(() => {
    return NYSE_STOCKS.find(stock => stock.symbol === selectedStock)
  }, [selectedStock])

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol)
    setSearchQuery("")
    setShowDropdown(false)
  }

  const handleAnalyze = () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    
    if (selectedStock) {
      onAnalyze(selectedStock)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Stock Analysis
        </CardTitle>
        <CardDescription>
          Select any NYSE stock from our comprehensive database to analyze social media sentiment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stock Search and Selection */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Search stocks by symbol, name, sector, or industry..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            
            {/* Dropdown Results */}
            {showDropdown && searchQuery && (
              <div className="absolute z-50 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                      onClick={() => handleStockSelect(stock.symbol)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-sm text-muted-foreground">{stock.name}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {stock.sector}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-muted-foreground text-center">
                    No stocks found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Stock Display */}
          {selectedStockData && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedStockData.symbol}</h3>
                  <p className="text-muted-foreground">{selectedStockData.name}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{selectedStockData.sector}</Badge>
                    <Badge variant="outline">{selectedStockData.industry}</Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedStock("")
                    setSearchQuery("")
                  }}
                >
                  Change Stock
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Select Popular Stocks */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Popular Stocks</h4>
          <div className="flex flex-wrap gap-2">
            {["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "JPM", "V", "JNJ"].map((symbol) => {
              const stock = NYSE_STOCKS.find(s => s.symbol === symbol)
              return (
                <Button
                  key={symbol}
                  variant={selectedStock === symbol ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStockSelect(symbol)}
                  className="text-xs"
                >
                  {symbol}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Sector Quick Select */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Browse by Sector</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {["Technology", "Financial Services", "Healthcare", "Consumer Discretionary", "Energy", "Industrial", "Consumer Staples", "Utilities"].map((sector) => {
              const sectorStocks = NYSE_STOCKS.filter(s => s.sector === sector)
              return (
                <Button
                  key={sector}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(sector)
                    setShowDropdown(true)
                  }}
                  className="text-xs justify-start"
                >
                  <Building2 className="w-3 h-3 mr-2" />
                  {sector} ({sectorStocks.length})
                </Button>
              )
            })}
          </div>
        </div>

        {/* Analyze Button */}
        <div className="pt-4">
          <Button 
            onClick={handleAnalyze}
            disabled={!selectedStock || isAnalyzing}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Analyzing {selectedStock}...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Analyze {selectedStock || "Stock"}
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Analysis will include Reddit discussions and AI-powered sentiment scoring
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{NYSE_STOCKS.length}</div>
            <div className="text-xs text-muted-foreground">NYSE Stocks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">10</div>
            <div className="text-xs text-muted-foreground">Sectors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">Real-time</div>
            <div className="text-xs text-muted-foreground">Data</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
