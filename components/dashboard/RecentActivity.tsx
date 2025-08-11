'use client'

import { Clock, Home, DollarSign, FileText, Users, TrendingUp, TrendingDown, Plus, Edit, Trash2, Calculator, AlertCircle, BarChart3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import activityService from '@/lib/services/activityService'
import ErrorBoundary from '@/components/ErrorBoundary'

interface ActivityWithIcon {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
  timeAgo: string;
}

const iconMap = {
  'Plus': Plus,
  'Edit': Edit,
  'Trash2': Trash2,
  'TrendingUp': TrendingUp,
  'TrendingDown': TrendingDown,
  'FileText': FileText,
  'Calculator': Calculator,
  'Alert': AlertCircle,
  'AlertCircle': AlertCircle,
  'Home': Home,
  'BarChart3': BarChart3,
  'DollarSign': DollarSign,
  'Users': Users
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityWithIcon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const recentActivities = activityService.getRecentActivities(10)
        
        const activitiesWithIcons = recentActivities.map(activity => ({
          ...activity,
          icon: iconMap[activity.icon as keyof typeof iconMap] || Home,
          timeAgo: activityService.getTimeAgo(activity.timestamp)
        }))

        setActivities(activitiesWithIcons)
      } catch (error) {
        console.error('Error loading activities:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadActivities()

    // Refresh activities every 30 seconds
    const interval = setInterval(loadActivities, 30000)
    return () => clearInterval(interval)
  }, [])

  const displayActivities = showAll ? activities : activities.slice(0, 5)

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          {activities.length > 5 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              {showAll ? 'Show Less' : 'View All'}
            </button>
          )}
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No recent activity</p>
              <p className="text-sm">Your activity will appear here as you use the dashboard</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className={`w-10 h-10 rounded-full ${activity.color} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${activity.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{activity.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{activity.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {activity.timeAgo}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!showAll && activities.length > 5 && (
          <button 
            onClick={() => setShowAll(true)}
            className="w-full mt-4 py-2 text-center text-sm text-primary-500 hover:text-primary-600 font-medium border-t dark:border-gray-700 pt-4 transition-colors"
          >
            Load More Activities ({activities.length - 5} more)
          </button>
        )}

        {activities.length === 0 && (
          <div className="mt-4 text-center py-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No recent activity. Add properties and transactions to see activity here.
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}