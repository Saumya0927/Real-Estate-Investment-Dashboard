export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EVICTED = 'EVICTED',
  PENDING = 'PENDING'
}

export interface Tenant {
  id: string
  propertyId: string
  property?: Property
  
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  
  leaseStart: Date | string
  leaseEnd: Date | string
  monthlyRent: number
  securityDeposit: number
  status: TenantStatus
  
  createdAt: Date | string
  updatedAt: Date | string
}

export interface CreateTenantInput {
  propertyId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  leaseStart: Date | string
  leaseEnd: Date | string
  monthlyRent: number
  securityDeposit: number
}

export interface UpdateTenantInput {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  leaseEnd?: Date | string
  monthlyRent?: number
  status?: TenantStatus
}

export interface TenantDetails extends Tenant {
  paymentHistory: PaymentRecord[]
  maintenanceRequests: MaintenanceRequest[]
  documents: TenantDocument[]
  emergencyContacts: EmergencyContact[]
  notes: TenantNote[]
}

export interface PaymentRecord {
  id: string
  tenantId: string
  amount: number
  dueDate: Date | string
  paidDate?: Date | string | null
  status: 'pending' | 'paid' | 'late' | 'partial'
  method?: PaymentMethod
  referenceNumber?: string
  lateFee?: number
}

export interface MaintenanceRequest {
  id: string
  tenantId: string
  propertyId: string
  description: string
  priority: MaintenancePriority
  status: MaintenanceStatus
  requestDate: Date | string
  completedDate?: Date | string | null
  cost?: number
}

export interface TenantDocument {
  id: string
  tenantId: string
  type: 'lease' | 'id' | 'proof_of_income' | 'reference' | 'other'
  name: string
  url: string
  uploadDate: Date | string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phoneNumber: string
  email?: string
}

export interface TenantNote {
  id: string
  tenantId: string
  note: string
  createdBy: string
  createdAt: Date | string
}

export interface TenantScreening {
  creditScore: number
  creditReport?: string
  backgroundCheck: {
    status: 'clear' | 'review' | 'failed'
    details?: string
  }
  incomeVerification: {
    verified: boolean
    monthlyIncome: number
    employer: string
    employmentLength: string
  }
  references: TenantReference[]
  decision: 'approved' | 'denied' | 'conditional'
  conditions?: string[]
}

export interface TenantReference {
  name: string
  relationship: 'previous_landlord' | 'employer' | 'personal'
  phoneNumber: string
  rating?: number
  notes?: string
}

export interface LeaseRenewal {
  tenantId: string
  currentLeaseEnd: Date | string
  proposedStart: Date | string
  proposedEnd: Date | string
  currentRent: number
  proposedRent: number
  rentIncrease: number
  rentIncreasePercentage: number
  status: 'pending' | 'accepted' | 'declined' | 'negotiating'
  notes?: string
}

export interface TenantStats {
  totalTenants: number
  activeTenants: number
  averageRent: number
  totalMonthlyRent: number
  averageTenancy: number
  turnoverRate: number
  collectionRate: number
  latePaymentRate: number
}

export interface TenantFilter {
  propertyId?: string
  status?: TenantStatus
  leaseExpiringBefore?: Date | string
  minRent?: number
  maxRent?: number
  searchTerm?: string
}

// Import required types
import type { Property } from './property'
import type { MaintenancePriority, MaintenanceStatus } from './maintenance'
import type { PaymentMethod } from './transaction'