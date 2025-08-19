
/**
 * @fileOverview Service layer for health checks, like database connectivity.
 */
import pool from '@/lib/db';
import type { HealthCheckOutput } from '@/ai/flows/healthCheckFlow';

/**
 * Checks the database connection by attempting to run a simple query.
 * @returns {Promise<HealthCheckOutput>} An object indicating success or failure.
 */
export async function checkDbConnection(): Promise<HealthCheckOutput> {
  try {
    // Get a client from the pool and immediately release it.
    // This is the most reliable way to check if the database is reachable.
    const client = await pool.connect();
    await client.query('SELECT 1'); // A simple, fast query to test the connection
    client.release();
    return { success: true };
  } catch (error: any) {
    // If pool.connect() or client.query() fails, the connection is down.
    console.error('Database connection failed:', error.message);
    return {
      success: false,
      error: error.message || 'An unknown error occurred during database connection check.',
    };
  }
}
