'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, Grid, List, Plus, Home } from 'lucide-react'
import PropertyCard from './PropertyCard'
import PropertyDetails from './PropertyDetails'
import AddPropertyModal from './AddPropertyModal'
import { useProperties, useDeleteProperty } from '@/hooks/useProperties'
import imageService from '@/lib/services/imageService'
import ErrorBoundary from '@/components/ErrorBoundary'

interface PropertyWithImage {
  id: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  purchasePrice?: number;
  currentValue?: number;
  monthlyRent?: number;
  type?: string;
  status?: string;
  createdAt?: string;
  image: string;
}

export default function Properties() {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid')
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<any>(null)
  const [deletingProperty, setDeletingProperty] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    occupancy: '',
    sortBy: 'recent'
  })
  const [propertiesWithImages, setPropertiesWithImages] = useState<PropertyWithImage[]>([])
  const [loadingImages, setLoadingImages] = useState(true)
  
  const { data: rawProperties = [], isLoading, error } = useProperties()
  const deleteProperty = useDeleteProperty()

  // Load property images
  useEffect(() => {
    const loadPropertyImages = async () => {
      if (rawProperties.length === 0) {
        setPropertiesWithImages([])
        setLoadingImages(false)
        return
      }

      try {
        setLoadingImages(true)
        const propertiesWithData = await Promise.all(
          rawProperties.map(async (property: any) => {
            const image = await imageService.getPropertyImage(property.id, property.type)
            return { ...property, image }
          })
        )
        setPropertiesWithImages(propertiesWithData)
      } catch (error) {
        console.error('Error loading property images:', error)
        setPropertiesWithImages(rawProperties.map(p => ({ ...p, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800' })))
      } finally {
        setLoadingImages(false)
      }
    }

    loadPropertyImages()
  }, [rawProperties])

  // Handle edit property
  const handleEdit = (property: any) => {
    console.log('Edit clicked for property:', property.name, property)
    setEditingProperty(property)
    setAddModalOpen(true)
  }

  // Handle delete property
  const handleDelete = async (property: any) => {
    if (window.confirm(`Are you sure you want to delete "${property.name}"? This action cannot be undone.`)) {
      try {
        await deleteProperty.mutateAsync(property.id)
        // Success feedback handled by the hook
      } catch (error) {
        console.error('Error deleting property:', error)
      }
    }
  }

  // Close modal and reset editing state
  const handleCloseModal = () => {
    setAddModalOpen(false)
    setEditingProperty(null)
  }

  // Filter and search properties
  const filteredProperties = useMemo(() => {
    let filtered = propertiesWithImages

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(property =>
        property.name?.toLowerCase().includes(query) ||
        property.address?.toLowerCase().includes(query) ||
        property.city?.toLowerCase().includes(query) ||
        property.state?.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(property => property.type === filters.type)
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(property => 
        property.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        property.state?.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Occupancy filter
    if (filters.occupancy) {
      filtered = filtered.filter(property => {
        const isOccupied = property.status === 'OCCUPIED'
        switch (filters.occupancy) {
          case 'above90': return isOccupied
          case '70to90': return property.status === 'AVAILABLE'
          case 'below70': return property.status === 'MAINTENANCE'
          default: return true
        }
      })
    }

    // Sort
    switch (filters.sortBy) {
      case 'valueHigh':
        return filtered.sort((a, b) => (b.currentValue || b.purchasePrice || 0) - (a.currentValue || a.purchasePrice || 0))
      case 'valueLow':
        return filtered.sort((a, b) => (a.currentValue || a.purchasePrice || 0) - (b.currentValue || b.purchasePrice || 0))
      case 'roiHigh':
        return filtered.sort((a, b) => {
          const roiA = a.currentValue && a.purchasePrice ? ((a.currentValue - a.purchasePrice) / a.purchasePrice) * 100 : 0
          const roiB = b.currentValue && b.purchasePrice ? ((b.currentValue - b.purchasePrice) / b.purchasePrice) * 100 : 0
          return roiB - roiA
        })
      case 'recent':
      default:
        return filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    }
  }, [propertiesWithImages, searchQuery, filters])
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">Failed to load properties</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
        </div>
      </div>
    )
  }
  
  if (isLoading || loadingImages) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Property Portfolio</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Loading your properties...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {selectedProperty ? (
          <PropertyDetails 
            property={selectedProperty} 
            onBack={() => setSelectedProperty(null)} 
          />
        ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Property Portfolio</h2>
              <p className="text-gray-600 mt-1">Manage and monitor your real estate investments</p>
            </div>
            <button 
              onClick={() => setAddModalOpen(true)}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Property
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10 p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setViewType('grid')}
                    className={`p-2 ${viewType === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewType('list')}
                    className={`p-2 ${viewType === 'list' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {filterOpen && (
              <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select 
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Types</option>
                    <option value="SINGLE_FAMILY">Single Family</option>
                    <option value="MULTI_FAMILY">Multi Family</option>
                    <option value="CONDO">Condo</option>
                    <option value="TOWNHOUSE">Townhouse</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="LAND">Land</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <select 
                    value={filters.occupancy}
                    onChange={(e) => setFilters(prev => ({ ...prev, occupancy: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Status</option>
                    <option value="above90">Occupied</option>
                    <option value="70to90">Available</option>
                    <option value="below70">Maintenance</option>
                  </select>
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="recent">Recent First</option>
                    <option value="valueHigh">Value (High to Low)</option>
                    <option value="valueLow">Value (Low to High)</option>
                    <option value="roiHigh">ROI (High to Low)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className={viewType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProperties.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    {propertiesWithImages.length === 0 ? 'No properties found' : 'No properties match your filters'}
                  </p>
                  <p className="text-sm">
                    {propertiesWithImages.length === 0 ? 'Add your first property to get started' : 'Try adjusting your search or filters'}
                  </p>
                </div>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  viewType={viewType}
                  onClick={() => setSelectedProperty(property)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </>
        )}

        {/* Add/Edit Property Modal */}
        <AddPropertyModal
          isOpen={addModalOpen}
          onClose={handleCloseModal}
          property={editingProperty}
          onSuccess={() => {
            // Properties will be refetched automatically by React Query
          }}
        />
      </div>
    </ErrorBoundary>
  )
}