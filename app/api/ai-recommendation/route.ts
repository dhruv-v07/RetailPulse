import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { symbol, stockData, sentimentData, redditData } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: "Stock symbol is required" }, { status: 400 })
    }

    console.log(`[AI Recommendation] Generating recommendation for ${symbol}`)

    // Prepare data for AI analysis
    const currentPrice = stockData?.price || 0
    const changePercent = stockData?.changePercent || 0
    const volume = stockData?.volume || 0
    const sentiment = sentimentData?.overall || 0.5
    const redditPosts = redditData?.length || 0

    // Enhanced prompt that aligns sentiment with recommendations
    const sentimentLevel = sentiment > 0.7 ? 'Very Bullish' : sentiment > 0.6 ? 'Bullish' : sentiment > 0.4 ? 'Neutral' : 'Bearish'
    const sentimentBias = sentiment > 0.6 ? 'positive' : sentiment < 0.4 ? 'negative' : 'neutral'
    
    const prompt = `You are a professional financial analyst. Analyze this stock data and provide an investment recommendation that ALIGNS with the sentiment data.

STOCK DATA:
- Symbol: ${symbol}
- Current Price: $${currentPrice}
- Price Change: ${changePercent > 0 ? '+' : ''}${changePercent}%
- Volume: ${volume?.toLocaleString() || 'N/A'}

SENTIMENT ANALYSIS:
- Overall Sentiment: ${(sentiment * 100).toFixed(0)}% (${sentimentLevel})
- Sentiment Bias: ${sentimentBias}
- Social Media Activity: ${redditPosts} Reddit posts analyzed

RECOMMENDATION RULES:
1. If sentiment > 70% AND price change > -2%: Strong BUY bias
2. If sentiment > 60% AND price change > -5%: BUY bias  
3. If sentiment 40-60%: HOLD (neutral)
4. If sentiment < 40% OR price change < -5%: SELL bias
5. Volume > 1M indicates strong interest (positive factor)

Provide JSON response with:
{
  "recommendation": "BUY/SELL/HOLD",
  "confidence": 0.0-1.0,
  "keyPoints": ["point1", "point2", "point3", "point4", "point5"],
  "priceTarget": number or "Not Applicable",
  "timeframe": "short-term/mid-term/long-term"
}

Make sure the recommendation aligns with the ${sentimentLevel} sentiment (${(sentiment * 100).toFixed(0)}%).`

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional financial analyst. Provide clear, data-driven investment recommendations. Always respond in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    })

    if (!openaiResponse.ok) {
      console.error(`[AI Recommendation] OpenAI API error: ${openaiResponse.status}`)
      return NextResponse.json({ error: "Failed to generate AI recommendation" }, { status: 500 })
    }

    const openaiData = await openaiResponse.json()
    const aiContent = openaiData.choices[0]?.message?.content

    if (!aiContent) {
      console.error('[AI Recommendation] No content from OpenAI')
      return NextResponse.json({ error: "No AI response received" }, { status: 500 })
    }

    console.log('[AI Recommendation] Raw OpenAI response:', aiContent)

    // Parse the JSON response
    let recommendation
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : aiContent
      recommendation = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('[AI Recommendation] JSON parse error:', parseError)
      // Fallback recommendation that aligns with sentiment
      let fallbackRecommendation = 'HOLD'
      let fallbackConfidence = 0.6
      
      if (sentiment > 0.7 && changePercent > -2) {
        fallbackRecommendation = 'BUY'
        fallbackConfidence = 0.8
      } else if (sentiment > 0.6 && changePercent > -5) {
        fallbackRecommendation = 'BUY'
        fallbackConfidence = 0.7
      } else if (sentiment < 0.4 || changePercent < -5) {
        fallbackRecommendation = 'SELL'
        fallbackConfidence = 0.7
      }
      
      recommendation = {
        recommendation: fallbackRecommendation,
        confidence: fallbackConfidence,
        keyPoints: [
          `Current price change: ${changePercent > 0 ? '+' : ''}${changePercent}%`,
          `Market sentiment: ${sentiment > 0.6 ? 'Bullish' : sentiment < 0.4 ? 'Bearish' : 'Neutral'} (${(sentiment * 100).toFixed(0)}%)`,
          `Social media activity: ${redditPosts} posts analyzed`,
          `Recommendation based on ${sentiment > 0.6 ? 'positive' : sentiment < 0.4 ? 'negative' : 'neutral'} sentiment`,
          'Consider your risk tolerance and investment goals'
        ],
        priceTarget: sentiment > 0.6 ? currentPrice * 1.15 : sentiment < 0.4 ? currentPrice * 0.9 : 'Not Applicable',
        timeframe: sentiment > 0.6 ? 'mid-term' : sentiment < 0.4 ? 'short-term' : '3-6 months'
      }
    }

    console.log(`[AI Recommendation] Generated recommendation: ${recommendation.recommendation}`)
    return NextResponse.json(recommendation)

  } catch (error) {
    console.error('[AI Recommendation] Error:', error)
    return NextResponse.json({ error: "Failed to generate recommendation" }, { status: 500 })
  }
}

