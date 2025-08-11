import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import axios from 'axios'
import { Property, PropertyFilter, CreatePropertyInput, UpdatePropertyInput } from '@/types'
import toast from 'react-hot-toast'

interface PropertyState {
  properties: Property[]
  selectedProperty: Property | null
  isLoading: boolean
  error: string | null
  filter: PropertyFilter
  totalCount: number
  currentPage: number
  totalPages: number
  
  // Actions
  fetchProperties: (filter?: PropertyFilter) => Promise<void>
  fetchPropertyById: (id: string) => Promise<void>
  createProperty: (data: CreatePropertyInput) => Promise<Property>
  updateProperty: (id: string, data: UpdatePropertyInput) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
  setSelectedProperty: (property: Property | null) => void
  setFilter: (filter: PropertyFilter) => void
  clearError: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const usePropertyStore = create<PropertyState>()(
  immer((set, get) => ({
    properties: [],
    selectedProperty: null,
    isLoading: false,
    error: null,
    filter: {},
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    
    fetchProperties: async (filter = {}) => {
      set((state) => {
        state.isLoading = true
        state.error = null
        state.filter = filter
      })
      
      try {
        const params = new URLSearchParams()
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value))
          }
        })
        
        const response = await axios.get(`${API_URL}/properties?${params}`)
        
        set((state) => {
          state.properties = response.data.data
          state.totalCount = response.data.metadata?.total || 0
          state.currentPage = response.data.metadata?.page || 1
          state.totalPages = response.data.metadata?.totalPages || 1
          state.isLoading = false
        })
      } catch (error: any) {
        set((state) => {
          state.isLoading = false
          state.error = error.response?.data?.error?.message || 'Failed to fetch properties'
        })
        toast.error('Failed to fetch properties')
      }
    },
    
    fetchPropertyById: async (id) => {
      set((state) => {
        state.isLoading = true
        state.error = null
      })
      
      try {
        const response = await axios.get(`${API_URL}/properties/${id}`)
        
        set((state) => {
          state.selectedProperty = response.data.data
          state.isLoading = false
        })
      } catch (error: any) {
        set((state) => {
          state.isLoading = false
          state.error = error.response?.data?.error?.message || 'Failed to fetch property'
        })
        toast.error('Failed to fetch property details')
      }
    },
    
    createProperty: async (data) => {
      set((state) => {
        state.isLoading = true
        state.error = null
      })
      
      try {
        const response = await axios.post(`${API_URL}/properties`, data)
        const newProperty = response.data.data
        
        set((state) => {
          state.properties.unshift(newProperty)
          state.isLoading = false
        })
        
        toast.success('Property created successfully!')
        return newProperty
      } catch (error: any) {
        set((state) => {
          state.isLoading = false
          state.error = error.response?.data?.error?.message || 'Failed to create property'
        })
        toast.error('Failed to create property')
        throw error
      }
    },
    
    updateProperty: async (id, data) => {
      set((state) => {
        state.isLoading = true
        state.error = null
      })
      
      try {
        const response = await axios.put(`${API_URL}/properties/${id}`, data)
        const updatedProperty = response.data.data
        
        set((state) => {
          const index = state.properties.findIndex(p => p.id === id)
          if (index !== -1) {
            state.properties[index] = updatedProperty
          }
          if (state.selectedProperty?.id === id) {
            state.selectedProperty = updatedProperty
          }
          state.isLoading = false
        })
        
        toast.success('Property updated successfully!')
      } catch (error: any) {
        set((state) => {
          state.isLoading = false
          state.error = error.response?.data?.error?.message || 'Failed to update property'
        })
        toast.error('Failed to update property')
        throw error
      }
    },
    
    deleteProperty: async (id) => {
      set((state) => {
        state.isLoading = true
        state.error = null
      })
      
      try {
        await axios.delete(`${API_URL}/properties/${id}`)
        
        set((state) => {
          state.properties = state.properties.filter(p => p.id !== id)
          if (state.selectedProperty?.id === id) {
            state.selectedProperty = null
          }
          state.isLoading = false
        })
        
        toast.success('Property deleted successfully!')
      } catch (error: any) {
        set((state) => {
          state.isLoading = false
          state.error = error.response?.data?.error?.message || 'Failed to delete property'
        })
        toast.error('Failed to delete property')
        throw error
      }
    },
    
    setSelectedProperty: (property) => {
      set((state) => {
        state.selectedProperty = property
      })
    },
    
    setFilter: (filter) => {
      set((state) => {
        state.filter = filter
      })
    },
    
    clearError: () => {
      set((state) => {
        state.error = null
      })
    }
  }))
)