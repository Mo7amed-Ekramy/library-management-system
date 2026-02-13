import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }).max(100, { message: 'Name must be less than 100 characters' }),
  email: z.string().trim().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).max(100, { message: 'Password must be less than 100 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Payment validation schema
export const paymentSchema = z.object({
  name: z.string().trim().min(2, { message: 'Cardholder name is required' }).max(100, { message: 'Name must be less than 100 characters' }),
  cardNumber: z.string().regex(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/, { message: 'Invalid card number (16 digits required)' }),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Invalid expiry date (MM/YY)' }),
  cvv: z.string().regex(/^\d{3,4}$/, { message: 'Invalid CVV (3-4 digits)' }),
});

// Book form validation schema
export const bookSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }).max(200, { message: 'Title must be less than 200 characters' }),
  author: z.string().trim().min(1, { message: 'Author is required' }).max(100, { message: 'Author must be less than 100 characters' }),
  isbn: z.string().trim().min(10, { message: 'ISBN must be at least 10 characters' }).max(20, { message: 'ISBN must be less than 20 characters' }),
  totalCopies: z.number().min(1, { message: 'Must have at least 1 copy' }),
  copiesAvailable: z.number().min(0, { message: 'Cannot be negative' }),
  category: z.string().optional(),
  description: z.string().optional(),
  pricing: z.array(z.object({
    days: z.number().min(1, { message: 'Days must be at least 1' }),
    price: z.number().min(0, { message: 'Price cannot be negative' }),
    label: z.string().min(1, { message: 'Label is required' }),
  })).min(1, { message: 'At least one pricing tier is required' }),
}).refine((data) => data.copiesAvailable <= data.totalCopies, {
  message: 'Available copies cannot exceed total copies',
  path: ['copiesAvailable'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type BookFormData = z.infer<typeof bookSchema>;
