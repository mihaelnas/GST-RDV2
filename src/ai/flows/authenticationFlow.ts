'use server';
/**
 * @fileOverview Manages user authentication.
 */
import {ai} from '@/ai/genkit';
import * as AuthService from '@/services/authService';
import { LoginInputSchema, LoginOutputSchema, type LoginInput, type LoginOutput } from '@/ai/schemas/authSchemas';

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
