/**
 * @fileOverview Service layer for authentication logic.
 */
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import type { LoginOutput } from '@/ai/flows/authenticationFlow';

/**
 * Authenticates a user by checking their email and password against the database.
 * It first checks for a doctor, then for a patient.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<LoginOutput>} The user's data and role.
 * @throws {Error} If authentication fails.
 */
export async function authenticateUser(email: string, password: string): Promise<LoginOutput> {
  const client = await pool.connect();
  try {
    // 1. Check for a doctor
    let query = {
      text: 'SELECT id, full_name, email, password_hash FROM doctors WHERE email = $1',
      values: [email],
    };
    let result = await client.query(query);
    if (result.rowCount > 0) {
      const doctor = result.rows[0];
      const passwordIsValid = await bcrypt.compare(password, doctor.password_hash);
      if (passwordIsValid) {
        return {
          id: doctor.id,
          fullName: doctor.full_name,
          email: doctor.email,
          // For now, we assume any doctor email can also be clinic staff.
          // In a real app, this would be a separate role check.
          role: email.toLowerCase().includes('personnel@') || email.toLowerCase().includes('staff@') ? 'clinic_staff' : 'doctor',
        };
      }
    }

    // 2. If not a doctor, check for a patient
    query = {
      text: 'SELECT id, full_name, email, password_hash FROM patients WHERE email = $1',
      values: [email],
    };
    result = await client.query(query);
    if (result.rowCount > 0) {
      const patient = result.rows[0];
      const passwordIsValid = await bcrypt.compare(password, patient.password_hash);
      if (passwordIsValid) {
        return {
          id: patient.id,
          fullName: patient.full_name,
          email: patient.email,
          role: 'patient',
        };
      }
    }

    // 3. If no user is found or password doesn't match
    throw new Error('Email ou mot de passe incorrect.');

  } catch (error) {
    console.error('Authentication Error:', error);
    if (error instanceof Error && error.message.includes('incorrect')) {
        throw error;
    }
    throw new Error('Une erreur est survenue lors de la tentative de connexion.');
  } finally {
    client.release();
  }
}
