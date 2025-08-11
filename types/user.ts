export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  emailVerified: boolean
  profileImage?: string | null
  phoneNumber?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
  createdAt: Date | string
  updatedAt: Date | string
  lastLoginAt?: Date | string | null
}

export interface UserProfile extends User {
  properties?: Property[]
  investments?: Investment[]
  totalPortfolioValue?: number
  totalProperties?: number
  totalInvestments?: number
}

export interface CreateUserInput {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: UserRole
  phoneNumber?: string
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  profileImage?: string
}

export interface UserStats {
  totalProperties: number
  totalInvestments: number
  portfolioValue: number
  monthlyIncome: number
  monthlyExpenses: number
  netCashFlow: number
  averageROI: number
  occupancyRate: number
}

// Import required types (will be defined in other files)
import type { Property } from './property'
import type { Investment } from './investment'