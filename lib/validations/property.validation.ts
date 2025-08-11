import { z } from 'zod'

export const createPropertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  type: z.string(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  
  yearBuilt: z.number().optional(),
  squareFeet: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  description: z.string().optional(),
  
  purchasePrice: z.number().positive('Purchase price must be positive'),
  currentValue: z.number().optional(),
  monthlyRent: z.number().optional(),
  monthlyExpenses: z.number().optional()
})

export const updatePropertySchema = createPropertySchema.partial().extend({
  status: z.string().optional()
})

export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>