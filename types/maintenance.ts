export enum MaintenanceType {
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
  UPGRADE = 'UPGRADE',
  EMERGENCY = 'EMERGENCY',
  ROUTINE = 'ROUTINE'
}

export enum MaintenanceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface MaintenanceRecord {
  id: string
  propertyId: string
  property?: Property
  
  type: MaintenanceType
  description: string
  cost: number
  date: Date | string
  vendor?: string | null
  status: MaintenanceStatus
  priority: MaintenancePriority
  
  scheduledDate?: Date | string | null
  completedDate?: Date | string | null
  notes?: string | null
  attachments: string[]
  
  createdAt: Date | string
  updatedAt: Date | string
}

export interface CreateMaintenanceInput {
  propertyId: string
  type: MaintenanceType
  description: string
  cost: number
  date: Date | string
  vendor?: string
  priority?: MaintenancePriority
  scheduledDate?: Date | string
  notes?: string
}

export interface UpdateMaintenanceInput {
  status?: MaintenanceStatus
  cost?: number
  vendor?: string
  priority?: MaintenancePriority
  scheduledDate?: Date | string
  completedDate?: Date | string
  notes?: string
}

export interface MaintenanceSchedule {
  propertyId: string
  propertyName: string
  upcoming: ScheduledMaintenance[]
  overdue: ScheduledMaintenance[]
  recurring: RecurringMaintenance[]
}

export interface ScheduledMaintenance {
  id: string
  type: MaintenanceType
  description: string
  scheduledDate: Date | string
  estimatedCost: number
  priority: MaintenancePriority
  daysUntilDue: number
}

export interface RecurringMaintenance {
  id: string
  type: MaintenanceType
  description: string
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually'
  lastCompleted?: Date | string
  nextDue: Date | string
  estimatedCost: number
}

export interface MaintenanceStats {
  totalCost: number
  averageCost: number
  totalRequests: number
  completedRequests: number
  pendingRequests: number
  averageCompletionTime: number
  costByType: Record<MaintenanceType, number>
  costByProperty: Record<string, number>
  monthlyTrend: MaintenanceTrend[]
}

export interface MaintenanceTrend {
  month: string
  totalCost: number
  requestCount: number
  averageCost: number
  completionRate: number
}

export interface MaintenanceVendor {
  id: string
  name: string
  specialty: MaintenanceType[]
  rating: number
  totalJobs: number
  totalSpent: number
  averageResponseTime: number
  contact: {
    phone: string
    email: string
    address?: string
  }
  insurance: {
    liability: boolean
    workersComp: boolean
    expiryDate?: Date | string
  }
  notes?: string
}

export interface MaintenanceFilter {
  propertyId?: string
  type?: MaintenanceType
  status?: MaintenanceStatus
  priority?: MaintenancePriority
  startDate?: Date | string
  endDate?: Date | string
  minCost?: number
  maxCost?: number
  vendor?: string
}

// Import required types
import type { Property } from './property'