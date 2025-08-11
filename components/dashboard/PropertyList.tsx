'use client'

import { MapPin, TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react'
import { useProperties } from '@/hooks/useProperties'
import { useEffect, useState } from 'react'
import imageService from '@/lib/services/imageService'
import { useRouter } from 'next/navigation'
import ErrorBoundary from '@/components/ErrorBoundary'

interface PropertyWithImage {
  id: string;
  name: string;
  location: string;
  value: string;
  monthlyIncome: string;
  occupancy: number;
  image: string;
  trend: number;
  currentValue?: number;
  purchasePrice: number;
}

export default function PropertyList() {
  const { data: rawProperties = [], isLoading, error } = useProperties()
  const [propertiesWithImages, setPropertiesWithImages] = useState<PropertyWithImage[]>([])
  const [loadingImages, setLoadingImages] = useState(true)
  const router = useRouter()

  // Load property images and calculate market values
  useEffect(() => {
    const loadPropertyData = async () => {
      if (rawProperties.length === 0) {
        setLoadingImages(false)
        return
      }

      try {
        const propertiesWithData = await Promise.all(
          rawProperties.map(async (property: any) => {
            // Get property image
            const image = await imageService.getPropertyImage(property.id, property.type)
            
            // Calculate trend from purchase price to current value
            let trend = 0
            const currentValue = property.currentValue || property.purchasePrice
            if (property.purchasePrice && currentValue) {
              trend = ((currentValue - property.purchasePrice) / property.purchasePrice) * 100
            }

            return {
              id: property.id,
              name: property.name,
              location: `${property.city}, ${property.state}`,
              value: currentValue ? `$${currentValue.toLocaleString()}` : `$${property.purchasePrice.toLocaleString()}`,
              monthlyIncome: property.monthlyRent ? `$${property.monthlyRent.toLocaleString()}` : '$0',
              occupancy: property.status === 'OCCUPIED' ? 100 : property.status === 'AVAILABLE' ? 0 : 85,
              image,
              trend,
              currentValue,
              purchasePrice: property.purchasePrice
            }
          })
        )

        // Sort by value and take top 4 for dashboard widget
        const sortedProperties = propertiesWithData
          .sort((a, b) => (b.currentValue || b.purchasePrice) - (a.currentValue || a.purchasePrice))
          .slice(0, 4)

        setPropertiesWithImages(sortedProperties)
      } catch (error) {
        console.error('Error loading property data:', error)
      } finally {
        setLoadingImages(false)
      }
    }

    loadPropertyData()
  }, [rawProperties])

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">Failed to load properties</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please try again later</p>
        </div>
      </div>
    )
  }

  if (isLoading || loadingImages) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Properties</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 p-3 rounded-lg animate-pulse">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Properties</h3>
          <button 
            onClick={() => router.push('/properties')}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
          >
            View All
          </button>
        </div>

        {propertiesWithImages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No properties found</p>
              <p className="text-sm">Add your first property to get started</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {propertiesWithImages.map((property) => (
              <div 
                key={property.id} 
                onClick={() => router.push('/properties')}
                className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-61ef4d3fdf05?w=400&h=200&fit=crop'
                    }}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{property.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{property.value}</p>
                      <div className="flex items-center justify-end mt-1">
                        {property.trend >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                        )}
                        <span className={`text-sm ${property.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {Math.abs(property.trend).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <DollarSign className="h-3 w-3 mr-1" />
                      <span>{property.monthlyIncome}/mo</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{property.occupancy}% occupied</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}