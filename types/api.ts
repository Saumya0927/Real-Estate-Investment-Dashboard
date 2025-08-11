// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
  metadata?: ResponseMetadata
}

export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
}

export interface ResponseMetadata {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
  hasMore?: boolean
  nextCursor?: string
  prevCursor?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  cursor?: string
}

export interface SearchParams extends PaginationParams {
  query?: string
  filters?: Record<string, any>
}

// API Request Types
export interface CreateRequest<T> {
  data: T
}

export interface UpdateRequest<T> {
  id: string
  data: Partial<T>
}

export interface DeleteRequest {
  id: string
}

export interface BulkRequest<T> {
  ids?: string[]
  data?: T
  action: 'create' | 'update' | 'delete'
}

// WebSocket Event Types
export interface SocketEvent<T = any> {
  event: string
  data: T
  timestamp: string
  userId?: string
}

export interface SocketSubscription {
  channel: string
  filters?: Record<string, any>
}

// File Upload Types
export interface FileUploadRequest {
  file: File
  type: 'image' | 'document' | 'spreadsheet' | 'other'
  entityType?: string
  entityId?: string
}

export interface FileUploadResponse {
  url: string
  publicId: string
  size: number
  mimeType: string
  metadata?: Record<string, any>
}

// Export Types
export interface ExportRequest {
  format: 'csv' | 'xlsx' | 'pdf' | 'json'
  entityType: string
  filters?: Record<string, any>
  fields?: string[]
  dateRange?: {
    start: Date | string
    end: Date | string
  }
}

export interface ExportResponse {
  url: string
  expiresAt: Date | string
  size: number
  recordCount: number
}

// Batch Operations
export interface BatchOperation<T> {
  operations: Array<{
    type: 'create' | 'update' | 'delete'
    data: T
    id?: string
  }>
}

export interface BatchOperationResult {
  successful: number
  failed: number
  results: Array<{
    success: boolean
    id?: string
    error?: string
  }>
}

// Rate Limiting
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: Date | string
}

// Health Check
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  uptime: number
  services: {
    database: ServiceStatus
    redis?: ServiceStatus
    storage?: ServiceStatus
    email?: ServiceStatus
  }
  timestamp: string
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded'
  latency?: number
  error?: string
}