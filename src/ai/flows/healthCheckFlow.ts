
'use server';
/**
 * @fileOverview A flow to check the health of the database connection.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { checkDbConnection } from '@/services/healthService';

const HealthCheckOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
export type HealthCheckOutput = z.infer<typeof HealthCheckOutputSchema>;

const checkDatabaseConnectionFlow = ai.defineFlow(
  {
    name: 'checkDatabaseConnectionFlow',
    outputSchema: HealthCheckOutputSchema,
  },
  async () => {
    return checkDbConnection();
  }
);

/**
 * Checks the database connection status.
 * @returns {Promise<HealthCheckOutput>} An object indicating if the connection was successful.
 */
export async function checkDatabaseConnection(): Promise<HealthCheckOutput> {
  return checkDatabaseConnectionFlow();
}
