export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  INVESTMENT = 'INVESTMENT',
  WITHDRAWAL = 'WITHDRAWAL'
}

export enum TransactionCategory {
  RENT = 'RENT',
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  TAX = 'TAX',
  INSURANCE = 'INSURANCE',
  UTILITY = 'UTILITY',
  MANAGEMENT = 'MANAGEMENT',
  MORTGAGE = 'MORTGAGE',
  OTHER = 'OTHER'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CHECK = 'CHECK',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  OTHER = 'OTHER'
}

export interface Transaction {
  id: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  date: Date | string
  description?: string | null
  
  // Relations
  userId: string
  user?: User
  propertyId?: string | null
  property?: Property | null
  
  // Additional Info
  paymentMethod?: PaymentMethod | null
  referenceNumber?: string | null
  notes?: string | null
  attachments: string[]
  
  createdAt: Date | string
  updatedAt: Date | string
}

export interface CreateTransactionInput {
  type: TransactionType
  category: TransactionCategory
  amount: number
  date: Date | string
  description?: string
  propertyId?: string
  paymentMethod?: PaymentMethod
  referenceNumber?: string
  notes?: string
  attachments?: string[]
}

export interface UpdateTransactionInput {
  type?: TransactionType
  category?: TransactionCategory
  amount?: number
  date?: Date | string
  description?: string
  paymentMethod?: PaymentMethod
  notes?: string
}

export interface TransactionSummary {
  totalIncome: number
  totalExpenses: number
  netIncome: number
  incomeByCategory: Record<string, number>
  expensesByCategory: Record<string, number>
  monthlyTrend: MonthlyTrend[]
}

export interface MonthlyTrend {
  month: string
  income: number
  expenses: number
  netIncome: number
}

export interface TransactionFilter {
  type?: TransactionType
  category?: TransactionCategory
  propertyId?: string
  startDate?: Date | string
  endDate?: Date | string
  minAmount?: number
  maxAmount?: number
  paymentMethod?: PaymentMethod
}

// Import required types
import type { User } from './user'
import type { Property } from './property'