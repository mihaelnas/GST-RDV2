/**
 * @fileOverview Service layer for doctor-related business logic.
 * This file encapsulates the logic for interacting with the doctor data source.
 */

import pool from '@/lib/db';
import type { Doctor, DoctorCreateInput, DoctorUpdateInput } from '@/ai/flows/doctorManagementFlow';
import bcrypt from 'bcryptjs'; // We'll need a password hashing library

/**
 * Retrieves all doctors from the database.
 * @returns {Promise<Doctor[]>} A promise that resolves to an array of doctors.
 */
export async function getAllDoctors(): Promise<Doctor[]> {
  try {
    // Exclude password_hash from the SELECT statement for security
    const result = await pool.query('SELECT id, full_name, specialty, email FROM doctors ORDER BY full_name ASC');
    // The pg driver returns snake_case, so we map to camelCase for our application objects.
    return result.rows.map(row => ({
      id: row.id,
      fullName: row.full_name,
      specialty: row.specialty,
      email: row.email,
    }));
  } catch (error) {
    console.error('Database Error in getAllDoctors:', error);
    throw new Error('Failed to fetch doctors.');
  }
}

/**
 * Creates a new doctor in the database.
 * @param {DoctorCreateInput} data - The data for the new doctor.
 * @returns {Promise<Doctor>} A promise that resolves to the newly created doctor.
 */
export async function createDoctor(data: DoctorCreateInput): Promise<Doctor> {
  // Hash the password before storing it
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const query = {
    text: `INSERT INTO doctors(full_name, specialty, email, password_hash)
           VALUES($1, $2, $3, $4)
           RETURNING id, full_name, specialty, email`,
    values: [data.fullName, data.specialty, data.email, passwordHash],
  };

  try {
    const result = await pool.query(query);
    const row = result.rows[0];
    return {
      id: row.id,
      fullName: row.full_name,
      specialty: row.specialty,
      email: row.email,
    };
  } catch (error) {
    console.error('Database Error in createDoctor:', error);
    // Check for unique constraint violation (e.g., email already exists)
    if ((error as any).code === '23505') {
        throw new Error('A doctor with this email already exists.');
    }
    throw new Error('Failed to create doctor.');
  }
}

/**
 * Updates an existing doctor by their ID.
 * @param {string} id - The ID of the doctor to update.
 * @param {DoctorUpdateInput} data - The data to update.
 * @returns {Promise<Doctor>} A promise that resolves to the updated doctor.
 * @throws {Error} If the doctor is not found.
 */
export async function updateDoctorById(id: string, data: DoctorUpdateInput): Promise<Doctor> {
  const query = {
    text: `UPDATE doctors
           SET full_name = $1, specialty = $2, email = $3, updated_at = NOW()
           WHERE id = $4
           RETURNING id, full_name, specialty, email`,
    values: [data.fullName, data.specialty, data.email, id],
  };

  try {
    const result = await pool.query(query);
    if (result.rowCount === 0) {
      throw new Error('Doctor not found with id: ' + id);
    }
    const row = result.rows[0];
    return {
      id: row.id,
      fullName: row.full_name,
      specialty: row.specialty,
      email: row.email,
    };
  } catch (error) {
    console.error('Database Error in updateDoctorById:', error);
    if ((error as any).code === '23505') {
        throw new Error('A doctor with this email already exists.');
    }
    throw new Error('Failed to update doctor.');
  }
}

/**
 * Deletes a doctor by their ID.
 * @param {string} id - The ID of the doctor to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful, false otherwise.
 */
export async function deleteDoctorById(id: string): Promise<boolean> {
  const query = {
    text: 'DELETE FROM doctors WHERE id = $1',
    values: [id],
  };
  try {
    const result = await pool.query(query);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Database Error in deleteDoctorById:', error);
    throw new Error('Failed to delete doctor.');
  }
}

/**
 * Finds a single doctor by their ID.
 * @param {string} id - The ID of the doctor to find.
 * @returns {Promise<Doctor | null>} A promise that resolves to the doctor or null if not found.
 */
export async function getDoctorById(id: string): Promise<Doctor | null> {
    const query = {
        text: 'SELECT id, full_name, specialty, email FROM doctors WHERE id = $1',
        values: [id],
    };
    try {
        const result = await pool.query(query);
        if (result.rowCount === 0) {
            return null;
        }
        const row = result.rows[0];
        return {
          id: row.id,
          fullName: row.full_name,
          specialty: row.specialty,
          email: row.email,
        };
    } catch (error) {
        console.error('Database Error in getDoctorById:', error);
        throw new Error('Failed to fetch doctor.');
    }
}
