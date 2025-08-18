
/**
 * @fileOverview Service layer for doctor-related business logic.
 * This file encapsulates the logic for interacting with the doctor data source.
 */

import pool from '@/lib/db';
import type { Doctor, DoctorCreateInput, DoctorUpdateInput } from '@/ai/flows/doctorManagementFlow';
import bcrypt from 'bcryptjs';

/**
 * Retrieves all doctors from the database.
 * @returns {Promise<Doctor[]>} A promise that resolves to an array of doctors.
 */
export async function getAllDoctors(): Promise<Doctor[]> {
  try {
    const result = await pool.query('SELECT id, full_name, specialty, email FROM doctors ORDER BY full_name ASC');
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
    if ((error as any).code === '23505') {
      throw new Error('A doctor with this email already exists.');
    }
    throw new Error('Failed to create doctor.');
  }
}

/**
 * Updates an existing doctor by their ID.
 * This function now dynamically builds the query to only update provided fields.
 * @param {string} id - The ID of the doctor to update.
 * @param {DoctorUpdateInput} data - The data to update.
 * @returns {Promise<Doctor>} A promise that resolves to the updated doctor.
 * @throws {Error} If the doctor is not found or no data is provided.
 */
export async function updateDoctorById(id: string, data: DoctorUpdateInput): Promise<Doctor> {
    const fields: string[] = [];
    const values: any[] = [];
    let queryIndex = 1;

    if (data.fullName) {
        fields.push(`full_name = $${queryIndex++}`);
        values.push(data.fullName);
    }
    if (data.specialty) {
        fields.push(`specialty = $${queryIndex++}`);
        values.push(data.specialty);
    }
    if (data.email) {
        fields.push(`email = $${queryIndex++}`);
        values.push(data.email);
    }
    
    if (fields.length === 0) {
        // If no fields to update, fetch and return the current doctor data
        const currentDoctor = await getDoctorById(id);
        if (!currentDoctor) throw new Error('Doctor not found with id: ' + id);
        return currentDoctor;
    }

    values.push(id); // Add the id for the WHERE clause

    const query = {
        text: `UPDATE doctors
               SET ${fields.join(', ')}, updated_at = NOW()
               WHERE id = $${queryIndex}
               RETURNING id, full_name, specialty, email`,
        values: values,
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
 * Deletes a doctor by their ID, after checking for future appointments.
 * @param {string} id - The ID of the doctor to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful.
 */
export async function deleteDoctorById(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check for future appointments
    const appointmentCheck = await client.query(
        'SELECT 1 FROM appointments WHERE doctor_id = $1 AND date_time >= NOW() LIMIT 1',
        [id]
    );

    if (appointmentCheck.rowCount > 0) {
        throw new Error('Cannot delete doctor with future appointments. Please reassign or cancel them first.');
    }

    // Proceed with deletion if no future appointments
    const deleteResult = await client.query('DELETE FROM doctors WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    
    return deleteResult.rowCount > 0;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database Error in deleteDoctorById:', error);
    // Re-throw custom error messages or a generic one
    if (error instanceof Error && error.message.includes('Cannot delete doctor')) {
        throw error;
    }
    throw new Error('Failed to delete doctor.');
  } finally {
    client.release();
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
