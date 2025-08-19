
/**
 * @fileOverview Service layer for authentication logic.
 */
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import type { LoginOutput } from '@/ai/schemas/authSchemas';

type UserRecord = {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: 'doctor' | 'patient' | 'clinic_staff';
};

/**
 * Authenticates a user by checking their email and password against the database.
 * It searches for the user across all relevant tables and then validates the password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<LoginOutput>} The user's data and role.
 * @throws {Error} If authentication fails.
 */
export async function authenticateUser(email: string, password: string): Promise<LoginOutput> {
  const client = await pool.connect();
  try {
    // Find the user in any of the three tables
    const query = {
      text: `
        SELECT id, full_name, email, password_hash, 'clinic_staff' as role FROM clinic_staff WHERE email = $1
        UNION ALL
        SELECT id, full_name, email, password_hash, 'doctor' as role FROM doctors WHERE email = $1
        UNION ALL
        SELECT id, full_name, email, password_hash, 'patient' as role FROM patients WHERE email = $1
      `,
      values: [email],
    };

    const result = await client.query<UserRecord>(query);

    if (result.rowCount === 0) {
      // User with this email does not exist in any table
      throw new Error('Email ou mot de passe incorrect.');
    }

    const user = result.rows[0];
    
    // Now that we found the user, compare the provided password with the stored hash
    const passwordIsValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordIsValid) {
      // Password does not match
      throw new Error('Email ou mot de passe incorrect.');
    }

    // Authentication successful, return the user data
    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    };

  } catch (error) {
    console.error('Authentication Error:', error);
    // Re-throw specific, user-friendly error messages or a generic one
    if (error instanceof Error && error.message.includes('incorrect')) {
        throw error;
    }
    // For any other unexpected errors (e.g., database connection issue)
    throw new Error('Une erreur est survenue lors de la tentative de connexion.');
  } finally {
    client.release();
  }
}
