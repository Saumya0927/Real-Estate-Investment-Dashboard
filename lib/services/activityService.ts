/**
 * Activity Service - Professional Activity Tracking and Feed Generation
 * Tracks user actions and generates real-time activity feed
 */

interface Activity {
  id: string;
  type: 'PROPERTY_ADDED' | 'PROPERTY_UPDATED' | 'PROPERTY_DELETED' | 'TRANSACTION_ADDED' | 
        'VALUATION_UPDATED' | 'REPORT_GENERATED' | 'MARKET_ALERT' | 'CALCULATION_SAVED';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  propertyId?: string;
  propertyName?: string;
  metadata?: Record<string, any>;
}

interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  weekActivities: number;
  monthActivities: number;
  mostActivePropertyId?: string;
}

class ActivityService {
  private activities: Activity[] = [];
  private readonly STORAGE_KEY = 'dashboard_activities';
  private readonly MAX_ACTIVITIES = 1000;

  constructor() {
    this.loadActivities();
    this.generateInitialActivities();
  }

  /**
   * Record a new activity
   */
  recordActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Activity {
    const newActivity: Activity = {
      ...activity,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };

    this.activities.unshift(newActivity);
    
    // Limit activities to prevent memory issues
    if (this.activities.length > this.MAX_ACTIVITIES) {
      this.activities = this.activities.slice(0, this.MAX_ACTIVITIES);
    }

    this.saveActivities();
    return newActivity;
  }

  /**
   * Get recent activities with pagination
   */
  getRecentActivities(limit: number = 10, offset: number = 0): Activity[] {
    return this.activities.slice(offset, offset + limit);
  }

  /**
   * Get activities for a specific property
   */
  getPropertyActivities(propertyId: string, limit: number = 10): Activity[] {
    return this.activities
      .filter(activity => activity.propertyId === propertyId)
      .slice(0, limit);
  }

  /**
   * Get activities by type
   */
  getActivitiesByType(type: Activity['type'], limit: number = 10): Activity[] {
    return this.activities
      .filter(activity => activity.type === type)
      .slice(0, limit);
  }

  /**
   * Get activity statistics
   */
  getActivityStats(): ActivityStats {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayActivities = this.activities.filter(a => 
      new Date(a.timestamp) >= today
    ).length;

    const weekActivities = this.activities.filter(a => 
      new Date(a.timestamp) >= weekAgo
    ).length;

    const monthActivities = this.activities.filter(a => 
      new Date(a.timestamp) >= monthAgo
    ).length;

    // Find most active property
    const propertyActivityCount = new Map<string, number>();
    this.activities.forEach(activity => {
      if (activity.propertyId) {
        const current = propertyActivityCount.get(activity.propertyId) || 0;
        propertyActivityCount.set(activity.propertyId, current + 1);
      }
    });

    let mostActivePropertyId: string | undefined;
    let maxCount = 0;
    for (const [propertyId, count] of propertyActivityCount) {
      if (count > maxCount) {
        maxCount = count;
        mostActivePropertyId = propertyId;
      }
    }

    return {
      totalActivities: this.activities.length,
      todayActivities,
      weekActivities,
      monthActivities,
      mostActivePropertyId
    };
  }

  /**
   * Record property-related activities
   */
  recordPropertyAdded(propertyName: string, propertyId: string): Activity {
    return this.recordActivity({
      type: 'PROPERTY_ADDED',
      title: 'New Property Added',
      description: `Added "${propertyName}" to your portfolio`,
      icon: 'Plus',
      color: 'bg-green-500',
      propertyId,
      propertyName,
      metadata: { action: 'create' }
    });
  }

  recordPropertyUpdated(propertyName: string, propertyId: string, changes: string[]): Activity {
    return this.recordActivity({
      type: 'PROPERTY_UPDATED',
      title: 'Property Updated',
      description: `Updated ${changes.join(', ')} for "${propertyName}"`,
      icon: 'Edit',
      color: 'bg-blue-500',
      propertyId,
      propertyName,
      metadata: { changes, action: 'update' }
    });
  }

  recordPropertyDeleted(propertyName: string): Activity {
    return this.recordActivity({
      type: 'PROPERTY_DELETED',
      title: 'Property Removed',
      description: `Removed "${propertyName}" from your portfolio`,
      icon: 'Trash2',
      color: 'bg-red-500',
      metadata: { action: 'delete' }
    });
  }

  recordTransactionAdded(propertyName: string, propertyId: string, amount: number, type: string): Activity {
    return this.recordActivity({
      type: 'TRANSACTION_ADDED',
      title: 'Transaction Recorded',
      description: `Recorded ${type.toLowerCase()} of $${amount.toLocaleString()} for "${propertyName}"`,
      icon: type === 'INCOME' ? 'TrendingUp' : 'TrendingDown',
      color: type === 'INCOME' ? 'bg-green-500' : 'bg-orange-500',
      propertyId,
      propertyName,
      metadata: { amount, transactionType: type }
    });
  }

  recordValuationUpdate(propertyName: string, propertyId: string, newValue: number, change: number): Activity {
    return this.recordActivity({
      type: 'VALUATION_UPDATED',
      title: 'Property Valuation Updated',
      description: `"${propertyName}" valued at $${newValue.toLocaleString()} (${change > 0 ? '+' : ''}${change.toFixed(1)}%)`,
      icon: change > 0 ? 'TrendingUp' : 'TrendingDown',
      color: change > 0 ? 'bg-green-500' : 'bg-red-500',
      propertyId,
      propertyName,
      metadata: { newValue, change }
    });
  }

  recordReportGenerated(reportType: string, propertyName?: string): Activity {
    return this.recordActivity({
      type: 'REPORT_GENERATED',
      title: 'Report Generated',
      description: `Generated ${reportType} report${propertyName ? ` for "${propertyName}"` : ''}`,
      icon: 'FileText',
      color: 'bg-purple-500',
      propertyName,
      metadata: { reportType }
    });
  }

  recordMarketAlert(message: string): Activity {
    return this.recordActivity({
      type: 'MARKET_ALERT',
      title: 'Market Alert',
      description: message,
      icon: 'Alert',
      color: 'bg-yellow-500',
      metadata: { alertType: 'market' }
    });
  }

  recordCalculationSaved(calculationType: string, result: any): Activity {
    return this.recordActivity({
      type: 'CALCULATION_SAVED',
      title: 'Calculation Saved',
      description: `Saved ${calculationType} calculation with ${result.roi || result.monthlyPayment || 'result'}`,
      icon: 'Calculator',
      color: 'bg-indigo-500',
      metadata: { calculationType, result }
    });
  }

  /**
   * Generate initial activities for demonstration
   */
  private generateInitialActivities(): void {
    if (this.activities.length > 0) return; // Already have activities

    const now = new Date();
    const activities = [
      {
        type: 'PROPERTY_ADDED' as const,
        title: 'Welcome to Your Dashboard',
        description: 'Your real estate investment tracking system is ready',
        icon: 'Home',
        color: 'bg-primary-500',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        type: 'VALUATION_UPDATED' as const,
        title: 'Property Valuations Updated',
        description: 'Automatic valuation updates have been enabled for your portfolio',
        icon: 'TrendingUp',
        color: 'bg-green-500',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      },
      {
        type: 'MARKET_ALERT' as const,
        title: 'Market Report Available',
        description: 'Q4 2024 real estate market analysis is now available',
        icon: 'BarChart3',
        color: 'bg-blue-500',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      }
    ];

    activities.forEach(activity => {
      this.activities.push({
        ...activity,
        id: this.generateId()
      });
    });

    this.saveActivities();
  }

  /**
   * Load activities from localStorage
   */
  private loadActivities(): void {
    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') return;
      
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.activities = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      this.activities = [];
    }
  }

  /**
   * Save activities to localStorage
   */
  private saveActivities(): void {
    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') return;
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.activities));
    } catch (error) {
      console.error('Error saving activities:', error);
    }
  }

  /**
   * Generate unique ID for activities
   */
  private generateId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all activities (for development/testing)
   */
  clearActivities(): void {
    this.activities = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Get formatted time ago string
   */
  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }
}

export const activityService = new ActivityService();
export default activityService;