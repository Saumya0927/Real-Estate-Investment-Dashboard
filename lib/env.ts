import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string(),
  
  // JWT
  JWT_SECRET: z.string().min(10),
  REFRESH_SECRET: z.string().min(10),
  
  // API URLs
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_LAMBDA_URL: z.string().url(),
  
  // Server
  PORT: z.string().transform(Number).default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().url(),
})

// Validate environment variables
const validateEnv = () => {
  try {
    const env = envSchema.parse(process.env)
    return { success: true, env }
  } catch (error) {
    return { success: false, error }
  }
}

// Export validated environment variables
export const env = (() => {
  const result = validateEnv()
  
  if (!result.success) {
    // In production, fail fast
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment variable validation failed')
    }
    
    // In development, return defaults
    return {
      DATABASE_URL: 'file:./dev.db',
      JWT_SECRET: 'personal-dev-jwt-secret-key-2024',
      REFRESH_SECRET: 'personal-dev-refresh-secret-key-2024',
      NEXT_PUBLIC_API_URL: 'http://localhost:3001/api',
      NEXT_PUBLIC_LAMBDA_URL: 'http://localhost:3003',
      PORT: 3001,
      NODE_ENV: 'development' as const,
      CLIENT_URL: 'http://localhost:3000',
    }
  }
  
  return result.env
})()

export type Env = z.infer<typeof envSchema>