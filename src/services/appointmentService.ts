/**
 * @fileOverview Service layer for appointment-related business logic.
 */
import pool from '@/lib/db';
import type { AppointmentDetails, AppointmentCreateInput, BookedAppointment } from '@/ai/flows/appointmentManagementFlow';

/**
 * Retrieves all appointments with patient and doctor details.
 * @returns {Promise<AppointmentDetails[]>} A promise that resolves to an array of appointments.
 */
export async function getAllAppointmentsDetails(): Promise<AppointmentDetails[]> {
  const query = `
    SELECT
      a.id,
      a.date_time,
      a.patient_id,
      p.full_name AS patient_name,
      a.doctor_id,
      d.full_name AS doctor_name,
      a.status,
      a.duration_minutes
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    ORDER BY a.date_time ASC;
  `;
  try {
    const result = await pool.query(query);
    return result.rows.map(row => ({
      id: row.id,
      dateTime: row.date_time.toISOString(),
      patientId: row.patient_id,
      patientName: row.patient_name,
      doctorId: row.doctor_id,
      doctorName: row.doctor_name,
      status: row.status,
      durationMinutes: row.duration_minutes,
    }));
  } catch (error) {
    console.error('Database Error in getAllAppointmentsDetails:', error);
    throw new Error('Failed to fetch appointment details.');
  }
}

/**
 * Retrieves all appointments for a given doctor.
 * @param {string} doctorId - The ID of the doctor.
 * @returns {Promise<BookedAppointment[]>}
 */
export async function getAppointmentsByDoctorId(doctorId: string): Promise<BookedAppointment[]> {
    const query = {
        text: `SELECT a.id, a.date_time, a.patient_id, d.full_name as doctor_name, a.status 
               FROM appointments a
               JOIN doctors d on a.doctor_id = d.id
               WHERE a.doctor_id = $1 AND a.status = 'Confirmé'
               ORDER BY a.date_time ASC`,
        values: [doctorId],
    };
    try {
        const result = await pool.query(query);
        return result.rows.map(row => ({
            id: row.id,
            dateTime: row.date_time.toISOString(),
            patientId: row.patient_id,
            doctorName: row.doctor_name,
            status: row.status,
        }));
    } catch (error) {
        console.error('Database Error in getAppointmentsByDoctorId:', error);
        throw new Error('Failed to fetch appointments for doctor.');
    }
}


/**
 * Creates a new appointment.
 * @param {AppointmentCreateInput} data
 * @returns {Promise<AppointmentDetails>}
 */
export async function createAppointment(data: AppointmentCreateInput): Promise<AppointmentDetails> {
  const query = {
    text: `
      INSERT INTO appointments(date_time, patient_id, doctor_id)
      VALUES($1, $2, $3)
      RETURNING id, date_time, patient_id, doctor_id, status, duration_minutes;
    `,
    values: [data.dateTime, data.patientId, data.doctorId],
  };

  try {
    const result = await pool.query(query);
    const newAppointment = result.rows[0];

    // We need to fetch patient and doctor names for the return value
    const detailsQuery = {
        text: `SELECT p.full_name as patient_name, d.full_name as doctor_name
               FROM patients p, doctors d
               WHERE p.id = $1 AND d.id = $2`,
        values: [newAppointment.patient_id, newAppointment.doctor_id]
    };
    const detailsResult = await pool.query(detailsQuery);
    const names = detailsResult.rows[0];

    return {
      id: newAppointment.id,
      dateTime: newAppointment.date_time.toISOString(),
      patientId: newAppointment.patient_id,
      patientName: names.patient_name,
      doctorId: newAppointment.doctor_id,
      doctorName: names.doctor_name,
      status: newAppointment.status,
      durationMinutes: newAppointment.duration_minutes,
    };
  } catch (error) {
    console.error('Database Error in createAppointment:', error);
    throw new Error('Failed to create appointment.');
  }
}

/**
 * Updates the status of an appointment.
 * @param {string} appointmentId - The ID of the appointment to update.
 * @param {string} status - The new status.
 * @returns {Promise<boolean>}
 */
export async function updateAppointmentStatus(appointmentId: string, status: string): Promise<boolean> {
  const query = {
    text: 'UPDATE appointments SET status = $1 WHERE id = $2',
    values: [status, appointmentId],
  };
  try {
    const result = await pool.query(query);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Database Error in updateAppointmentStatus:', error);
    throw new Error('Failed to update appointment status.');
  }
}

/**
 * Deletes an appointment by its ID.
 * @param {string} appointmentId
 * @returns {Promise<boolean>}
 */
export async function deleteAppointmentById(appointmentId: string): Promise<boolean> {
    const query = {
        text: 'DELETE FROM appointments WHERE id = $1',
        values: [appointmentId],
    };
    try {
        const result = await pool.query(query);
        return result.rowCount > 0;
    } catch (error) {
        console.error('Database Error in deleteAppointmentById:', error);
        throw new Error('Failed to delete appointment.');
    }
}
