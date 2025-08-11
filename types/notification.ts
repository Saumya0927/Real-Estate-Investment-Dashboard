export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  REMINDER = 'REMINDER',
  ALERT = 'ALERT'
}

export interface Notification {
  id: string
  userId: string
  user?: User
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  metadata?: any
  createdAt: Date | string
  readAt?: Date | string | null
}

export interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  metadata?: any
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  inApp: boolean
  categories: {
    maintenance: boolean
    rent: boolean
    investment: boolean
    market: boolean
    system: boolean
  }
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

export interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  subject: string
  bodyTemplate: string
  variables: string[]
  isActive: boolean
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<NotificationType, number>
  recent: Notification[]
}

// Import required types
import type { User } from './user'