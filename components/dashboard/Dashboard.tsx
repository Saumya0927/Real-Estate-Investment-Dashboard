'use client'

import { TrendingUp, DollarSign, Home, Users } from 'lucide-react'
import StatsCard from './StatsCard'
import PortfolioChart from './PortfolioChart'
import PropertyList from './PropertyList'
import MarketTrends from './MarketTrends'
import RecentActivity from './RecentActivity'
import { useProperties } from '@/hooks/useProperties'
import { useEffect, useState } from 'react'
import portfolioHistoryService from '@/lib/services/portfolioHistoryService'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function Dashboard() {
  const { data: properties = [], isLoading: propertiesLoading } = useProperties()
  const [portfolioMetrics, setPortfolioMetrics] = useState({
    portfolioValue: 0,
    portfolioValueChange: 0,
    totalProperties: 0,
    totalPropertiesChange: 0,
    monthlyIncome: 0,
    monthlyIncomeChange: 0,
    occupancyRate: 0,
    occupancyRateChange: 0
  })

  // Calculate REAL portfolio metrics with historical data
  useEffect(() => {
    if (properties.length > 0) {
      const metrics = portfolioHistoryService.calculateMetrics(properties)
      setPortfolioMetrics(metrics)

      // Take a snapshot for historical tracking
      portfolioHistoryService.takeSnapshot(properties)
    } else {
      // Clear metrics when no properties exist
      setPortfolioMetrics({
        portfolioValue: 0,
        portfolioValueChange: 0,
        totalProperties: 0,
        totalPropertiesChange: 0,
        monthlyIncome: 0,
        monthlyIncomeChange: 0,
        occupancyRate: 0,
        occupancyRateChange: 0
      })
    }
  }, [properties])
  
  const stats = [
    {
      title: 'Total Portfolio Value',
      value: portfolioMetrics.portfolioValue > 0 ? `$${portfolioMetrics.portfolioValue.toLocaleString()}` : '$0',
      change: portfolioMetrics.portfolioValueChange,
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      title: 'Properties Owned',
      value: portfolioMetrics.totalProperties.toString(),
      change: portfolioMetrics.totalPropertiesChange,
      icon: Home,
      color: 'bg-green-500',
    },
    {
      title: 'Monthly Income',
      value: portfolioMetrics.monthlyIncome > 0 ? `$${portfolioMetrics.monthlyIncome.toLocaleString()}` : '$0',
      change: portfolioMetrics.monthlyIncomeChange,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Occupancy Rate',
      value: `${portfolioMetrics.occupancyRate.toFixed(1)}%`,
      change: portfolioMetrics.occupancyRateChange,
      icon: Users,
      color: 'bg-orange-500',
    },
  ]
  
  const isLoading = propertiesLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-32"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-64"></div>
          <div className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-64"></div>
        </div>
      </div>
    )
  }
  
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PortfolioChart />
          </div>
          <div>
            <MarketTrends />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PropertyList />
          <RecentActivity />
        </div>
      </div>
    </ErrorBoundary>
  )
}