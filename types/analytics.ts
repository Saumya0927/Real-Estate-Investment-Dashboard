export interface PropertyAnalytics {
  id: string
  propertyId: string
  property?: Property
  date: Date | string
  
  // Metrics
  occupancyRate: number
  revenue: number
  expenses: number
  netIncome: number
  cashFlow: number
  
  // Market Data
  marketValue?: number | null
  comparableRent?: number | null
  marketTrend?: string | null
  
  createdAt: Date | string
}

export interface PortfolioAnalytics {
  totalProperties: number
  totalValue: number
  totalMonthlyIncome: number
  totalMonthlyExpenses: number
  netCashFlow: number
  averageOccupancyRate: number
  averageCapRate: number
  averageROI: number
  performanceTrend: PerformanceTrend[]
  propertyTypeDistribution: PropertyDistribution[]
  locationDistribution: LocationDistribution[]
}

export interface PerformanceTrend {
  date: string
  portfolioValue: number
  totalIncome: number
  totalExpenses: number
  netIncome: number
  roi: number
}

export interface PropertyDistribution {
  type: PropertyType
  count: number
  value: number
  percentage: number
}

export interface LocationDistribution {
  city: string
  state: string
  count: number
  value: number
  percentage: number
}

export interface MarketAnalytics {
  city: string
  state: string
  averagePrice: number
  medianPrice: number
  pricePerSqFt: number
  averageRent: number
  medianRent: number
  rentPerSqFt: number
  inventoryLevel: number
  daysOnMarket: number
  absorptionRate?: number | null
  priceChange: number
  rentChange: number
  forecast: AnalyticsMarketForecast
}

export interface AnalyticsMarketForecast {
  nextQuarterPrice: number
  nextQuarterRent: number
  yearEndPrice: number
  yearEndRent: number
  confidence: number
}

export interface InvestmentAnalytics {
  totalInvested: number
  currentValue: number
  totalReturn: number
  returnPercentage: number
  annualizedReturn: number
  cashOnCashReturn: number
  irr: number
  performanceByProperty: PropertyPerformance[]
  monthlyReturns: MonthlyReturn[]
}

export interface PropertyPerformance {
  propertyId: string
  propertyName: string
  invested: number
  currentValue: number
  totalReturn: number
  returnPercentage: number
  annualizedReturn: number
}

export interface MonthlyReturn {
  month: string
  return: number
  returnPercentage: number
  cumulativeReturn: number
}

// Import required types
import type { Property, PropertyType } from './property'