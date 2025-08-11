export interface MarketData {
  id: string
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
  
  dataDate: Date | string
  source: string
  
  createdAt: Date | string
  updatedAt: Date | string
}

export interface MarketTrend {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  data: MarketDataPoint[]
  change: MarketChange
  forecast?: MarketForecast
}

export interface MarketDataPoint {
  date: string
  price: number
  rent: number
  inventory: number
  sales: number
  rentals: number
}

export interface MarketChange {
  price: {
    value: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }
  rent: {
    value: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }
  inventory: {
    value: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }
}

export interface MarketForecast {
  nextMonth: {
    price: number
    rent: number
    confidence: number
  }
  nextQuarter: {
    price: number
    rent: number
    confidence: number
  }
  nextYear: {
    price: number
    rent: number
    confidence: number
  }
}

export interface MarketComparison {
  location: string
  currentMarket: MarketSnapshot
  comparables: ComparableMarket[]
  ranking: MarketRanking
}

export interface MarketSnapshot {
  price: number
  rent: number
  yieldRate: number
  vacancy: number
  growth: number
  score: number
}

export interface ComparableMarket {
  location: string
  distance: number
  price: number
  rent: number
  yieldRate: number
  similarity: number
}

export interface MarketRanking {
  priceRank: number
  rentRank: number
  yieldRank: number
  growthRank: number
  overallRank: number
  totalMarkets: number
}

export interface MarketAlert {
  id: string
  type: 'price_change' | 'rent_change' | 'inventory_alert' | 'opportunity'
  severity: 'low' | 'medium' | 'high'
  location: string
  message: string
  data: any
  createdAt: Date | string
}

export interface MarketOpportunity {
  id: string
  location: string
  type: 'undervalued' | 'high_yield' | 'growth_potential' | 'distressed'
  score: number
  metrics: {
    currentPrice: number
    estimatedValue: number
    potentialReturn: number
    riskLevel: 'low' | 'medium' | 'high'
  }
  reasons: string[]
  createdAt: Date | string
}