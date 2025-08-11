'use client'

import { MapPin, DollarSign, Users, TrendingUp, Calendar, Building, Edit2, Trash2, MoreHorizontal } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface PropertyCardProps {
  property: any
  viewType: 'grid' | 'list'
  onClick: () => void
  onEdit?: (property: any) => void
  onDelete?: (property: any) => void
}

export default function PropertyCard({ property, viewType, onClick, onEdit, onDelete }: PropertyCardProps) {
  const [showActions, setShowActions] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowActions(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  // Debug logging
  useEffect(() => {
    if (showActions) {
      console.log('PropertyCard dropdown opened for:', property.name)
    }
  }, [showActions, property.name])
  
  // Calculate derived values
  const currentValue = property.currentValue || property.purchasePrice || 0
  const monthlyRent = property.monthlyRent || 0
  const purchasePrice = property.purchasePrice || 0
  const monthlyExpenses = property.monthlyExpenses || property.expenses || 0
  
  // ROI = (Annual Net Income / Initial Investment) * 100
  // Annual Net Income = (Monthly Rent * 12) - (Monthly Expenses * 12)
  const annualNetIncome = (monthlyRent * 12) - (monthlyExpenses * 12)
  const roi = purchasePrice > 0 ? (annualNetIncome / purchasePrice * 100).toFixed(1) : '0.0'
  
  // Appreciation rate (separate from ROI)
  const appreciation = purchasePrice > 0 ? ((currentValue - purchasePrice) / purchasePrice * 100).toFixed(1) : '0.0'
  
  const occupancy = property.status === 'OCCUPIED' ? '100' : 
                    property.status === 'AVAILABLE' ? '0' : '85'
  
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('PropertyCard action clicked')
    action()
    setShowActions(false)
  }

  if (viewType === 'list') {
    return (
      <div 
        onClick={onClick}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow cursor-pointer"
      >
        <div className="flex gap-6">
          <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
            {property.image ? (
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=200&fit=crop'
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Building className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{property.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {property.city}, {property.state}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-medium rounded">
                  {property.type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </span>
                {(onEdit || onDelete) && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowActions(!showActions)
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </button>
                    {showActions && (
                      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                        {onEdit && (
                          <button
                            onClick={(e) => handleAction(e, () => onEdit(property))}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => handleAction(e, () => onDelete(property))}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Current Value</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  ${currentValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Rent</p>
                <p className="text-sm font-semibold text-green-600">
                  ${monthlyRent.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">ROI</p>
                <p className="text-sm font-semibold text-primary-600">
                  {roi}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Occupancy</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {occupancy}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow cursor-pointer"
    >
      <div className="h-48 relative">
        {property.image ? (
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=400&fit=crop'
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Building className="h-16 w-16 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        
        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur text-xs font-medium rounded dark:text-white">
          {property.type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
        </div>
        
        {(onEdit || onDelete) && (
          <div className="absolute top-3 right-3">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(!showActions)
                }}
                className="p-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:bg-white dark:hover:bg-gray-700 rounded transition-colors"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </button>
              {showActions && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                  {onEdit && (
                    <button
                      onClick={(e) => handleAction(e, () => onEdit(property))}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => handleAction(e, () => onDelete(property))}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{property.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-1">
          <MapPin className="h-3 w-3 mr-1" />
          {property.city}, {property.state}
        </p>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Value</p>
              <p className="text-sm font-semibold dark:text-white">${currentValue.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">ROI</p>
              <p className="text-sm font-semibold text-green-600">{roi}%</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Occupancy</p>
              <p className="text-sm font-semibold dark:text-white">{occupancy}%</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Rent</p>
              <p className="text-sm font-semibold dark:text-white">${monthlyRent.toLocaleString()}/mo</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Purchased {property.purchaseDate ? new Date(property.purchaseDate).toLocaleDateString() : 'N/A'}
            </span>
            <span className="text-xs font-medium text-primary-600">
              +{roi}% return
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}