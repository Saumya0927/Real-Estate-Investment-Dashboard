'use client'

import { useState, useEffect } from 'react'
import PropertyForm from './PropertyForm'
import { useCreateProperty, useUpdateProperty } from '@/hooks/useProperties'
import activityService from '@/lib/services/activityService'

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  property?: any; // For editing
}

export default function AddPropertyModal({ isOpen, onClose, onSuccess, property }: AddPropertyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createProperty = useCreateProperty()
  const updateProperty = useUpdateProperty()
  const isEditing = Boolean(property)
  
  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('AddPropertyModal opened. isEditing:', isEditing, 'property:', property)
    }
  }, [isOpen, isEditing, property])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleSubmit = async (propertyData: any) => {
    setIsSubmitting(true)
    try {
      let result;
      if (isEditing) {
        result = await updateProperty.mutateAsync({ id: property.id, data: propertyData })
        // Record activity
        activityService.recordPropertyUpdated(propertyData.name, property.id, ['Property details updated'])
      } else {
        result = await createProperty.mutateAsync(propertyData)
        // Record activity
        activityService.recordPropertyAdded(result.name, result.id)
      }
      
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} property:`, error)
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <PropertyForm
            property={property}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}