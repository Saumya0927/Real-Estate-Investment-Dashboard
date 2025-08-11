export enum PropertyType {
  SINGLE_FAMILY = 'SINGLE_FAMILY',
  MULTI_FAMILY = 'MULTI_FAMILY',
  CONDO = 'CONDO',
  TOWNHOUSE = 'TOWNHOUSE',
  APARTMENT = 'APARTMENT',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND',
  OTHER = 'OTHER'
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  FOR_SALE = 'FOR_SALE',
  SOLD = 'SOLD'
}

export interface Property {
  id: string
  name: string
  type: PropertyType
  status: PropertyStatus
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  latitude?: number | null
  longitude?: number | null
  
  // Property Details
  yearBuilt: number
  squareFeet: number
  lotSize?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  parking?: number | null
  description?: string | null
  features: string[]
  images?: PropertyImage[]
  
  // Financial Information
  purchasePrice: number
  currentValue: number
  monthlyRent?: number | null
  monthlyExpenses?: number | null
  propertyTax?: number | null
  insurance?: number | null
  hoa?: number | null
  managementFee?: number | null
  
  // Metrics
  capRate?: number | null
  cashFlow?: number | null
  roi?: number | null
  occupancyRate?: number | null
  
  // Relations
  ownerId: string
  owner?: User
  investments?: Investment[]
  transactions?: Transaction[]
  documents?: Document[]
  maintenanceRecords?: MaintenanceRecord[]
  tenants?: Tenant[]
  analytics?: PropertyAnalytics[]
  
  // Timestamps
  createdAt: Date | string
  updatedAt: Date | string
}

export interface PropertyImage {
  id: string
  propertyId: string
  url: string
  caption?: string | null
  isPrimary: boolean
  order: number
  createdAt: Date | string
}

export interface CreatePropertyInput {
  name: string
  type: PropertyType
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  yearBuilt: number
  squareFeet: number
  purchasePrice: number
  currentValue: number
  bedrooms?: number
  bathrooms?: number
  description?: string
  features?: string[]
  monthlyRent?: number
  monthlyExpenses?: number
}

export interface UpdatePropertyInput {
  name?: string
  status?: PropertyStatus
  currentValue?: number
  monthlyRent?: number
  monthlyExpenses?: number
  description?: string
  features?: string[]
}

export interface PropertyMetrics {
  totalValue: number
  totalMonthlyIncome: number
  totalMonthlyExpenses: number
  netCashFlow: number
  averageOccupancy: number
  averageROI: number
  averageCapRate: number
}

export interface PropertyFilter {
  type?: PropertyType
  status?: PropertyStatus
  city?: string
  state?: string
  minPrice?: number
  maxPrice?: number
  minSquareFeet?: number
  maxSquareFeet?: number
  bedrooms?: number
  bathrooms?: number
}

// Import required types
import type { User } from './user'
import type { Investment } from './investment'
import type { Transaction } from './transaction'
import type { MaintenanceRecord } from './maintenance'
import type { Tenant } from './tenant'
import type { PropertyAnalytics } from './analytics'