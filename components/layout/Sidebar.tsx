'use client'

import { Home, Building, TrendingUp, Calculator, FileText, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface SidebarProps {
  isOpen: boolean
  activeView: string
  setActiveView: (view: string) => void
}

export default function Sidebar({ isOpen, activeView, setActiveView }: SidebarProps) {
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: api.getProperties,
    staleTime: 1000 * 60 * 5,
  })

  // Calculate portfolio metrics
  const portfolioValue = properties.reduce((total, property) => {
    return total + (property.currentValue || property.purchasePrice || 0)
  }, 0)

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    } else {
      return `$${amount.toLocaleString()}`
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'properties', label: 'Properties', icon: Building },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ duration: 0.3 }}
          className="w-64 bg-gradient-to-b from-primary-900 to-primary-800 text-white fixed lg:relative h-full z-30"
        >
          <div className="p-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building className="h-8 w-8" />
              <span>DST Real Estate</span>
            </h1>
          </div>
          
          <nav className="mt-6">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                    activeView === item.id
                      ? 'bg-primary-700 border-l-4 border-white'
                      : 'hover:bg-primary-700/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="bg-primary-700/50 rounded-lg p-4">
              <p className="text-sm opacity-90">Portfolio Value</p>
              <p className="text-2xl font-bold">{formatCurrency(portfolioValue)}</p>
              <p className="text-xs opacity-75 mt-1">
                {properties.length === 0 ? 'No properties yet' : `${properties.length} properties`}
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}