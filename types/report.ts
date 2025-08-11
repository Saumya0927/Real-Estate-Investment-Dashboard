export enum ReportType {
  FINANCIAL = 'FINANCIAL',
  PERFORMANCE = 'PERFORMANCE',
  TAX = 'TAX',
  PORTFOLIO = 'PORTFOLIO',
  CUSTOM = 'CUSTOM'
}

export interface Report {
  id: string
  userId: string
  user?: User
  type: ReportType
  name: string
  description?: string | null
  data: any
  url?: string | null
  generatedAt: Date | string
}

export interface CreateReportInput {
  type: ReportType
  name: string
  description?: string
  filters?: ReportFilters
  format?: 'pdf' | 'excel' | 'csv'
}

export interface ReportFilters {
  dateRange: {
    start: Date | string
    end: Date | string
  }
  properties?: string[]
  categories?: string[]
  includeProjections?: boolean
  includeComparisons?: boolean
}

export interface FinancialReport {
  summary: {
    totalRevenue: number
    totalExpenses: number
    netIncome: number
    cashFlow: number
  }
  incomeStatement: {
    revenue: RevenueBreakdown
    expenses: ExpenseBreakdown
    netIncome: number
  }
  balanceSheet: {
    assets: AssetBreakdown
    liabilities: LiabilityBreakdown
    equity: number
  }
  cashFlowStatement: {
    operatingActivities: number
    investingActivities: number
    financingActivities: number
    netCashFlow: number
  }
  metrics: {
    roi: number
    capRate: number
    cashOnCashReturn: number
    debtServiceCoverageRatio: number
  }
}

export interface RevenueBreakdown {
  rent: number
  lateFees: number
  other: number
  total: number
}

export interface ExpenseBreakdown {
  mortgage: number
  propertyTax: number
  insurance: number
  maintenance: number
  utilities: number
  management: number
  other: number
  total: number
}

export interface AssetBreakdown {
  properties: number
  cash: number
  investments: number
  other: number
  total: number
}

export interface LiabilityBreakdown {
  mortgages: number
  loans: number
  other: number
  total: number
}

export interface TaxReport {
  taxableIncome: number
  deductions: TaxDeductions
  credits: TaxCredits
  estimatedTax: number
  forms: TaxForm[]
}

export interface TaxDeductions {
  depreciation: number
  mortgageInterest: number
  propertyTax: number
  repairs: number
  utilities: number
  insurance: number
  professionalFees: number
  other: number
  total: number
}

export interface TaxCredits {
  energyEfficiency: number
  historicRehabilitation: number
  other: number
  total: number
}

export interface TaxForm {
  formNumber: string
  description: string
  data: any
}

export interface PerformanceReport {
  period: string
  properties: PropertyPerformanceReport[]
  portfolio: PortfolioPerformanceReport
  benchmarks: BenchmarkComparison
}

export interface PropertyPerformanceReport {
  propertyId: string
  propertyName: string
  occupancy: number
  revenue: number
  expenses: number
  noi: number
  cashFlow: number
  roi: number
  trending: 'up' | 'down' | 'stable'
}

export interface PortfolioPerformanceReport {
  totalValue: number
  valueChange: number
  totalRevenue: number
  revenueChange: number
  avgOccupancy: number
  avgROI: number
  topPerformers: string[]
  underperformers: string[]
}

export interface BenchmarkComparison {
  marketAverage: number
  percentile: number
  outperformance: number
}

// Import required types
import type { User } from './user'