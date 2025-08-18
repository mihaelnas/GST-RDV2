/**
 * @fileOverview Zod schemas and TypeScript types for authentication.
 */
import { z } from 'zod';

// Schema for login input
export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

// Schema for the object returned on successful login
export const LoginOutputSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  role: z.enum(['doctor', 'patient', 'clinic_staff']),
});
export type LoginOutput = z.infer<typeof LoginOutputSchema>;
