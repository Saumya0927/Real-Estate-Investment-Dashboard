import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import axios from 'axios'
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from '@/types'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
  clearError: () => void
  checkAuth: () => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (credentials) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })
        
        try {
          const response = await axios.post<AuthResponse>(
            `${API_URL}/auth/login`,
            credentials
          )
          
          const { user, accessToken, refreshToken } = response.data
          
          set((state) => {
            state.user = user
            state.accessToken = accessToken
            state.refreshToken = refreshToken
            state.isAuthenticated = true
            state.isLoading = false
          })
          
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
          
          toast.success('Login successful!')
        } catch (error: any) {
          set((state) => {
            state.isLoading = false
            state.error = error.response?.data?.error?.message || 'Login failed'
          })
          toast.error(error.response?.data?.error?.message || 'Login failed')
          throw error
        }
      },
      
      register: async (credentials) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })
        
        try {
          const response = await axios.post<AuthResponse>(
            `${API_URL}/auth/register`,
            credentials
          )
          
          const { user, accessToken, refreshToken } = response.data
          
          set((state) => {
            state.user = user
            state.accessToken = accessToken
            state.refreshToken = refreshToken
            state.isAuthenticated = true
            state.isLoading = false
          })
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
          
          toast.success('Registration successful!')
        } catch (error: any) {
          set((state) => {
            state.isLoading = false
            state.error = error.response?.data?.error?.message || 'Registration failed'
          })
          toast.error(error.response?.data?.error?.message || 'Registration failed')
          throw error
        }
      },
      
      logout: async () => {
        try {
          const refreshToken = get().refreshToken
          if (refreshToken) {
            await axios.post(`${API_URL}/auth/logout`, { refreshToken })
          }
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set((state) => {
            state.user = null
            state.accessToken = null
            state.refreshToken = null
            state.isAuthenticated = false
            state.error = null
          })
          
          delete axios.defaults.headers.common['Authorization']
          toast.success('Logged out successfully')
        }
      },
      
      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken
        
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }
        
        try {
          const response = await axios.post<AuthResponse>(
            `${API_URL}/auth/refresh`,
            { refreshToken }
          )
          
          const { accessToken, refreshToken: newRefreshToken } = response.data
          
          set((state) => {
            state.accessToken = accessToken
            state.refreshToken = newRefreshToken
          })
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        } catch (error) {
          set((state) => {
            state.user = null
            state.accessToken = null
            state.refreshToken = null
            state.isAuthenticated = false
          })
          
          delete axios.defaults.headers.common['Authorization']
          throw error
        }
      },
      
      updateUser: (updates) => {
        set((state) => {
          if (state.user) {
            Object.assign(state.user, updates)
          }
        })
      },
      
      clearError: () => {
        set((state) => {
          state.error = null
        })
      },
      
      checkAuth: async () => {
        const accessToken = get().accessToken
        
        if (!accessToken) {
          set((state) => {
            state.isAuthenticated = false
          })
          return
        }
        
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
          const response = await axios.get(`${API_URL}/auth/me`)
          
          set((state) => {
            state.user = response.data.user
            state.isAuthenticated = true
          })
        } catch (error) {
          // Try to refresh token
          try {
            await get().refreshAccessToken()
            const response = await axios.get(`${API_URL}/auth/me`)
            set((state) => {
              state.user = response.data.user
              state.isAuthenticated = true
            })
          } catch (refreshError) {
            set((state) => {
              state.user = null
              state.accessToken = null
              state.refreshToken = null
              state.isAuthenticated = false
            })
          }
        }
      }
    })),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      })
    }
  )
)