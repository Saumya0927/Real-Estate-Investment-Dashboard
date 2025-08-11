'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import marketDataService from '@/lib/services/marketDataService'
import ErrorBoundary from '@/components/ErrorBoundary'

interface MarketTrendDisplay {
  city: string;
  change: number;
  status: 'up' | 'down' | 'stable';
  avgPrice: string;
}

export default function MarketTrends() {
  const [timeRange, setTimeRange] = useState('30days')
  const [trends, setTrends] = useState<MarketTrendDisplay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load market trends data
  useEffect(() => {
    const loadMarketTrends = async () => {
      try {
        setIsLoading(true)
        const marketTrends = await marketDataService.getMarketTrends()
        
        const formattedTrends: MarketTrendDisplay[] = marketTrends.map(trend => ({
          city: trend.city,
          change: trend.priceChangePercent,
          status: trend.priceChangePercent > 0.5 ? 'up' : 
                  trend.priceChangePercent < -0.5 ? 'down' : 'stable',
          avgPrice: `$${(trend.medianPrice / 1000).toFixed(0)}K`
        }))

        setTrends(formattedTrends)
        setError(null)
      } catch (err) {
        console.error('Error loading market trends:', err)
        setError('Failed to load market trends')
      } finally {
        setIsLoading(false)
      }
    }

    loadMarketTrends()

    // Refresh data every 5 minutes
    const interval = setInterval(loadMarketTrends, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getTrendIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'text-green-500'
      case 'down':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">Failed to load market trends</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please try again later</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Trends</h3>
          <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Trends</h3>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
        </div>

        {trends.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No market data available</p>
              <p className="text-sm">Market trends will appear here when data is available</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    {getTrendIcon(trend.status)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{trend.city}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg: {trend.avgPrice}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${getTrendColor(trend.status)}`}>
                    {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">MoM</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-900 font-medium">Market Insight</p>
          <p className="text-xs text-primary-700 mt-1">
            Real-time market data powered by professional APIs. Trends updated every 5 minutes.
          </p>
        </div>
      </div>
    </ErrorBoundary>
  )
}