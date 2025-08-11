import { z } from 'zod'

export const createTransactionSchema = z.object({
  type: z.string(), // INCOME, EXPENSE, etc.
  category: z.string(), // RENT, MAINTENANCE, etc.
  amount: z.number().positive('Amount must be positive'),
  date: z.string().or(z.date()),
  description: z.string().optional(),
  propertyId: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional()
})

export const updateTransactionSchema = createTransactionSchema.partial()

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>