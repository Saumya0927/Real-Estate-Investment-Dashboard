'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import Dashboard from '@/components/dashboard/Dashboard'
import Properties from '@/components/properties/Properties'
import Analytics from '@/components/analytics/Analytics'
import Calculator from '@/components/calculator/Calculator'
import Reports from '@/components/reports/Reports'
import Settings from '@/components/settings/Settings'

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      // Clear any potentially cached demo data when user logs in
      // This ensures dashboard shows real data only
      const clearDemoCache = () => {
        const currentUser = localStorage.getItem('user')
        const lastClearUser = localStorage.getItem('last_clear_user')
        
        // Clear cache if different user or first time
        if (!lastClearUser || lastClearUser !== currentUser) {
          localStorage.removeItem('portfolio_history')
          localStorage.removeItem('last_snapshot_date')
          localStorage.setItem('last_clear_user', currentUser || '')
        }
      }
      clearDemoCache()
    }
  }, [router])

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'properties':
        return <Properties />
      case 'analytics':
        return <Analytics />
      case 'calculator':
        return <Calculator />
      case 'reports':
        return <Reports />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          currentView={activeView}
          setActiveView={setActiveView}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  )
}