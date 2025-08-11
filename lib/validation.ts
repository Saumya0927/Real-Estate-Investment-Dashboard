/**
 * Validation utilities for form inputs
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateNumber = (value: string | number, min?: number, max?: number): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

export const validatePositiveNumber = (value: string | number): boolean => {
  return validateNumber(value, 0);
};

export const validatePhone = (phone: string): boolean => {
  // Basic phone validation - accepts various formats
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};

export const formatPercentage = (value: number | string, decimals: number = 1): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0%';
  return `${num.toFixed(decimals)}%`;
};

export const sanitizeNumberInput = (value: string): string => {
  // Remove all non-numeric characters except decimal point and negative sign
  return value.replace(/[^0-9.-]/g, '');
};

export const parseNumberSafely = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (value === '' || value === null || value === undefined) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

export type ValidationRule = {
  validate: (value: any) => boolean;
  message: string;
};

export const createValidationRules = {
  required: (message: string = 'This field is required'): ValidationRule => ({
    validate: validateRequired,
    message,
  }),
  
  email: (message: string = 'Please enter a valid email address'): ValidationRule => ({
    validate: validateEmail,
    message,
  }),
  
  positiveNumber: (message: string = 'Please enter a positive number'): ValidationRule => ({
    validate: validatePositiveNumber,
    message,
  }),
  
  phone: (message: string = 'Please enter a valid phone number'): ValidationRule => ({
    validate: validatePhone,
    message,
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length <= max,
    message: message || `Must be no more than ${max} characters`,
  }),
};

export const validateField = (value: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }
  return null;
};

export const validateForm = <T extends Record<string, any>>(
  data: T,
  schema: Record<keyof T, ValidationRule[]>
): Record<keyof T, string | null> => {
  const errors = {} as Record<keyof T, string | null>;
  
  for (const field in schema) {
    errors[field] = validateField(data[field], schema[field]);
  }
  
  return errors;
};

export const hasFormErrors = <T extends Record<string, any>>(
  errors: Record<keyof T, string | null>
): boolean => {
  return Object.values(errors).some(error => error !== null);
};