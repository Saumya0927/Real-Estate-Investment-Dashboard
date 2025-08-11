'use client'

import { useState, useEffect } from 'react'
import { Save, X, MapPin, DollarSign, Home, Square } from 'lucide-react'
import imageService from '@/lib/services/imageService'

interface PropertyFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: string;
  status: string;
  purchasePrice: number | '';
  currentValue: number | '';
  purchaseDate: string;
  bedrooms: number | '';
  bathrooms: number | '';
  squareFeet: number | '';
  monthlyRent: number | '';
  description: string;
}

interface PropertyFormErrors {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  type?: string;
  status?: string;
  purchasePrice?: string;
  currentValue?: string;
  purchaseDate?: string;
  bedrooms?: string;
  bathrooms?: string;
  squareFeet?: string;
  monthlyRent?: string;
  description?: string;
}

interface PropertyFormProps {
  property?: any;
  onSubmit: (property: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PROPERTY_TYPES = [
  'SINGLE_FAMILY',
  'MULTI_FAMILY',
  'CONDO',
  'TOWNHOUSE',
  'COMMERCIAL',
  'LAND'
]

const PROPERTY_STATUSES = [
  'AVAILABLE',
  'OCCUPIED',
  'MAINTENANCE',
  'FOR_SALE'
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export default function PropertyForm({ property, onSubmit, onCancel, isSubmitting = false }: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'SINGLE_FAMILY',
    status: 'AVAILABLE',
    purchasePrice: '',
    currentValue: '',
    purchaseDate: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    monthlyRent: '',
    description: ''
  })

  const [errors, setErrors] = useState<PropertyFormErrors>({})
  const [previewImage, setPreviewImage] = useState<string>('')

  // Initialize form data if editing
  useEffect(() => {
    if (property) {
      console.log('PropertyForm received property for editing:', property)
      setFormData({
        name: property.name || '',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        zipCode: property.zipCode || '',
        type: property.type || 'SINGLE_FAMILY',
        status: property.status || 'AVAILABLE',
        purchasePrice: property.purchasePrice || '',
        currentValue: property.currentValue || '',
        purchaseDate: property.purchaseDate ? new Date(property.purchaseDate).toISOString().split('T')[0] || '' : '',
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        squareFeet: property.squareFeet || '',
        monthlyRent: property.monthlyRent || '',
        description: property.description || ''
      })
    }
  }, [property])

  // Generate preview image when property type changes
  useEffect(() => {
    const generatePreviewImage = async () => {
      if (formData.type) {
        try {
          const image = await imageService.getPropertyImage('preview', formData.type)
          setPreviewImage(image)
        } catch (error) {
          console.error('Error generating preview image:', error)
        }
      }
    }
    generatePreviewImage()
  }, [formData.type])

  const validateForm = (): boolean => {
    const newErrors: PropertyFormErrors = {}

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = 'Property name is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required'
    if (!formData.purchasePrice || formData.purchasePrice <= 0) newErrors.purchasePrice = 'Purchase price must be greater than 0'
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required'

    // ZIP code validation
    if (formData.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code'
    }

    // Numeric validations
    if (formData.currentValue && formData.currentValue <= 0) {
      newErrors.currentValue = 'Current value must be greater than 0'
    }
    if (formData.bedrooms && formData.bedrooms < 0) {
      newErrors.bedrooms = 'Bedrooms cannot be negative'
    }
    if (formData.bathrooms && formData.bathrooms < 0) {
      newErrors.bathrooms = 'Bathrooms cannot be negative'
    }
    if (formData.squareFeet && formData.squareFeet <= 0) {
      newErrors.squareFeet = 'Square feet must be greater than 0'
    }
    if (formData.monthlyRent && formData.monthlyRent < 0) {
      newErrors.monthlyRent = 'Monthly rent cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const propertyData = {
      ...formData,
      purchasePrice: Number(formData.purchasePrice),
      currentValue: formData.currentValue ? Number(formData.currentValue) : null,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
      squareFeet: formData.squareFeet ? Number(formData.squareFeet) : null,
      monthlyRent: formData.monthlyRent ? Number(formData.monthlyRent) : null,
    }

    onSubmit(propertyData)
  }

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/10">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {property ? 'Edit Property' : 'Add New Property'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Preview Image */}
        {previewImage && (
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-24 rounded-lg overflow-hidden">
              <img
                src={previewImage}
                alt="Property preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Home className="h-4 w-4" />
            Basic Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., Sunset Villa"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {PROPERTY_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {PROPERTY_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="123 Main Street"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Los Angeles"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State *
              </label>
              <select
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.state ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select State</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="90210"
              />
              {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Purchase Price *
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', e.target.value ? Number(e.target.value) : '')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.purchasePrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="450000"
              />
              {errors.purchasePrice && <p className="text-red-500 text-xs mt-1">{errors.purchasePrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Value
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.currentValue}
                onChange={(e) => handleInputChange('currentValue', e.target.value ? Number(e.target.value) : '')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.currentValue ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="500000"
              />
              {errors.currentValue && <p className="text-red-500 text-xs mt-1">{errors.currentValue}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monthly Rent
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={formData.monthlyRent}
                onChange={(e) => handleInputChange('monthlyRent', e.target.value ? Number(e.target.value) : '')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.monthlyRent ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="2500"
              />
              {errors.monthlyRent && <p className="text-red-500 text-xs mt-1">{errors.monthlyRent}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Purchase Date *
            </label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                errors.purchaseDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.purchaseDate && <p className="text-red-500 text-xs mt-1">{errors.purchaseDate}</p>}
          </div>
        </div>

        {/* Property Details */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Square className="h-4 w-4" />
            Property Details
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', e.target.value ? Number(e.target.value) : '')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.bedrooms ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="3"
              />
              {errors.bedrooms && <p className="text-red-500 text-xs mt-1">{errors.bedrooms}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => handleInputChange('bathrooms', e.target.value ? Number(e.target.value) : '')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.bathrooms ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="2.5"
              />
              {errors.bathrooms && <p className="text-red-500 text-xs mt-1">{errors.bathrooms}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Square Feet
              </label>
              <input
                type="number"
                min="0"
                value={formData.squareFeet}
                onChange={(e) => handleInputChange('squareFeet', e.target.value ? Number(e.target.value) : '')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.squareFeet ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="2000"
              />
              {errors.squareFeet && <p className="text-red-500 text-xs mt-1">{errors.squareFeet}</p>}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Optional description of the property..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {property ? 'Update Property' : 'Save Property'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}