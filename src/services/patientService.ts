
/**
 * @fileOverview Service layer for patient-related business logic.
 * This file encapsulates the logic for interacting with the patient data source.
 */

import pool from '@/lib/db';
import type { Patient, PatientCreateInput, PatientUpdateInput } from '@/ai/flows/patientManagementFlow';
import bcrypt from 'bcryptjs';

/**
 * Retrieves all patients from the database.
 * @returns {Promise<Patient[]>} A promise that resolves to an array of patients.
 */
export async function getAllPatients(): Promise<Patient[]> {
  try {
    const result = await pool.query('SELECT id, full_name, email FROM patients ORDER BY full_name ASC');
    return result.rows.map(row => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
    }));
  } catch (error) {
    console.error('Database Error in getAllPatients:', error);
    throw new Error('Failed to fetch patients.');
  }
}

/**
 * Creates a new patient in the database.
 * @param {PatientCreateInput} data - The data for the new patient.
 * @returns {Promise<Patient>} A promise that resolves to the newly created patient.
 */
export async function createPatient(data: PatientCreateInput): Promise<Patient> {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const query = {
    text: `INSERT INTO patients(full_name, email, password_hash)
           VALUES($1, $2, $3)
           RETURNING id, full_name, email`,
    values: [data.fullName, data.email, passwordHash],
  };

  try {
    const result = await pool.query(query);
    const row = result.rows[0];
    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
    };
  } catch (error) {
    console.error('Database Error in createPatient:', error);
    if ((error as any).code === '23505') {
      throw new Error('Un patient avec cet e-mail existe déjà.');
    }
    throw new Error('Failed to create patient.');
  }
}

/**
 * Updates an existing patient by their ID.
 * This function now dynamically builds the query to only update provided fields.
 * @param {string} id - The ID of the patient to update.
 * @param {PatientUpdateInput} data - The data to update.
 * @returns {Promise<Patient>} A promise that resolves to the updated patient.
 * @throws {Error} If the patient is not found.
 */
export async function updatePatientById(id: string, data: PatientUpdateInput): Promise<Patient> {
    const fields: string[] = [];
    const values: any[] = [];
    let queryIndex = 1;

    if (data.fullName) {
        fields.push(`full_name = $${queryIndex++}`);
        values.push(data.fullName);
    }
    if (data.email) {
        fields.push(`email = $${queryIndex++}`);
        values.push(data.email);
    }
    
    if (fields.length === 0) {
        const currentPatient = await getPatientById(id);
        if (!currentPatient) throw new Error('Patient not found with id: ' + id);
        return currentPatient;
    }

    values.push(id);

    const query = {
        text: `UPDATE patients
               SET ${fields.join(', ')}, updated_at = NOW()
               WHERE id = $${queryIndex}
               RETURNING id, full_name, email`,
        values: values,
    };

    try {
        const result = await pool.query(query);
        if (result.rowCount === 0) {
            throw new Error('Patient not found with id: ' + id);
        }
        const row = result.rows[0];
        return {
          id: row.id,
          fullName: row.full_name,
          email: row.email,
        };
    } catch (error) {
        console.error('Database Error in updatePatientById:', error);
        if ((error as any).code === '23505') {
            throw new Error('Un autre patient utilise déjà cet e-mail.');
        }
        throw new Error('Failed to update patient.');
    }
}


/**
 * Deletes a patient by their ID using a transaction to ensure data integrity.
 * It checks for future appointments and dissociates past appointments before deletion.
 * @param {string} id - The ID of the patient to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful.
 */
export async function deletePatientById(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Step 1: Verify the patient exists. If not, no need to proceed.
    const patientExistsResult = await client.query('SELECT 1 FROM patients WHERE id = $1', [id]);
    if (patientExistsResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return false; // Or throw new Error('Patient not found.') depending on desired behavior
    }

    // Step 2: Check for future appointments for this patient
    const appointmentCheck = await client.query(
        'SELECT 1 FROM appointments WHERE patient_id = $1 AND date_time >= NOW() LIMIT 1',
        [id]
    );

    if (appointmentCheck.rowCount > 0) {
      throw new Error('Impossible de supprimer le patient. Il a des rendez-vous futurs.');
    }

    // Step 3: Dissociate past appointments from the patient to preserve history
    await client.query(
        'UPDATE appointments SET patient_id = NULL WHERE patient_id = $1',
        [id]
    );

    // Step 4: Proceed with deletion of the patient
    const deleteResult = await client.query('DELETE FROM patients WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    
    return deleteResult.rowCount > 0;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database Error in deletePatientById:', error);
     if (error instanceof Error && error.message.includes('Impossible de supprimer')) {
        throw error;
    }
    throw new Error('Failed to delete patient.');
  } finally {
    client.release();
  }
}

/**
 * Finds a single patient by their ID.
 * @param {string} id - The ID of the patient to find.
 * @returns {Promise<Patient | null>} A promise that resolves to the patient or null if not found.
 */
export async function getPatientById(id: string): Promise<Patient | null> {
    const query = {
        text: 'SELECT id, full_name, email FROM patients WHERE id = $1',
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
          email: row.email,
        };
    } catch (error) {
        console.error('Database Error in getPatientById:', error);
        throw new Error('Failed to fetch patient.');
    }
}
