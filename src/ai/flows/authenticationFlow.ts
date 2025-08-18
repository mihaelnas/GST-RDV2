'use server';
/**
 * @fileOverview Manages user authentication.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as AuthService from '@/services/authService';

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

// --- Flow ---
const loginFlow = ai.defineFlow(
  {
    name: 'loginFlow',
    inputSchema: LoginInputSchema,
    outputSchema: LoginOutputSchema,
  },
  async (input) => {
    return AuthService.authenticateUser(input.email, input.password);
  }
);

/**
 * Authenticates a user and returns their data and role if successful.
 * @param {LoginInput} input - The user's login credentials.
 * @returns {Promise<LoginOutput>} A promise that resolves to the user's data and role.
 * @throws {Error} If authentication fails.
 */
export async function login(input: LoginInput): Promise<LoginOutput> {
  return loginFlow(input);
}
