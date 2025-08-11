export enum InvestmentStatus {
  ACTIVE = 'ACTIVE',
  EXITED = 'EXITED',
  PENDING = 'PENDING'
}

export interface Investment {
  id: string
  userId: string
  user?: User
  propertyId: string
  property?: Property
  
  investmentAmount: number
  ownershipPercentage: number
  investmentDate: Date | string
  exitDate?: Date | string | null
  status: InvestmentStatus
  
  // Returns
  totalReturn?: number | null
  annualizedReturn?: number | null
  cashOnCashReturn?: number | null
  
  createdAt: Date | string
  updatedAt: Date | string
}

export interface CreateInvestmentInput {
  propertyId: string
  investmentAmount: number
  ownershipPercentage: number
  investmentDate: Date | string
}

export interface UpdateInvestmentInput {
  status?: InvestmentStatus
  exitDate?: Date | string
  totalReturn?: number
  annualizedReturn?: number
  cashOnCashReturn?: number
}

export interface InvestmentMetrics {
  totalInvested: number
  currentValue: number
  totalReturn: number
  averageAnnualizedReturn: number
  bestPerformingInvestment: Investment | null
  worstPerformingInvestment: Investment | null
}

export interface InvestmentFilter {
  status?: InvestmentStatus
  minAmount?: number
  maxAmount?: number
  startDate?: Date | string
  endDate?: Date | string
  propertyId?: string
}

// Import required types
import type { User } from './user'
import type { Property } from './property'