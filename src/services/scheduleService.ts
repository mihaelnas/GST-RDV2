
/**
 * @fileOverview Service layer for managing doctor schedules and absences.
 */
import pool from '@/lib/db';
import { DaySchedule, Absence, DoctorAvailability, AbsenceCreateInput } from '@/ai/flows/availabilityFlow';
import { format } from 'date-fns';

const dayNames = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

/**
 * Retrieves a doctor's complete availability, including weekly schedule and absences.
 * If no schedule exists, it creates and returns a default one.
 * @param {string} doctorId - The ID of the doctor.
 * @returns {Promise<DoctorAvailability>}
 */
export async function getDoctorAvailability(doctorId: string): Promise<DoctorAvailability> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Fetch weekly schedule
        let scheduleResult = await client.query(
            'SELECT day_of_week, is_working_day, start_time, end_time FROM doctor_weekly_schedules WHERE doctor_id = $1 ORDER BY day_of_week',
            [doctorId]
        );

        // If no schedule exists, create a default one
        if (scheduleResult.rows.length === 0) {
            const defaultSchedule: DaySchedule[] = [];
            for (let i = 1; i <= 7; i++) {
                const isWorking = i >= 1 && i <= 5; // Mon-Fri default
                const newDay = {
                    dayOfWeek: i,
                    dayName: dayNames[i-1],
                    isWorkingDay: isWorking,
                    startTime: isWorking ? '09:00:00' : null,
                    endTime: isWorking ? '17:00:00' : null,
                };
                defaultSchedule.push(newDay);
                await client.query(
                    'INSERT INTO doctor_weekly_schedules (doctor_id, day_of_week, is_working_day, start_time, end_time) VALUES ($1, $2, $3, $4, $5)',
                    [doctorId, newDay.dayOfWeek, newDay.isWorkingDay, newDay.startTime, newDay.endTime]
                );
            }
             scheduleResult = await client.query(
                'SELECT day_of_week, is_working_day, start_time, end_time FROM doctor_weekly_schedules WHERE doctor_id = $1 ORDER BY day_of_week',
                [doctorId]
            );
        }

        const weeklySchedule: DaySchedule[] = scheduleResult.rows.map(r => ({
            dayOfWeek: r.day_of_week,
            dayName: dayNames[r.day_of_week - 1],
            isWorkingDay: r.is_working_day,
            startTime: r.start_time,
            endTime: r.end_time,
        }));

        // Fetch absences
        const absencesResult = await client.query(
            'SELECT id, doctor_id, absence_date, is_full_day, start_time, end_time, reason FROM doctor_absences WHERE doctor_id = $1 ORDER BY absence_date ASC',
            [doctorId]
        );

        const absences: Absence[] = absencesResult.rows.map(r => ({
            id: r.id,
            doctorId: r.doctor_id,
            date: format(new Date(r.absence_date), 'yyyy-MM-dd'),
            isFullDay: r.is_full_day,
            startTime: r.start_time,
            endTime: r.end_time,
            reason: r.reason,
        }));

        await client.query('COMMIT');
        return { weeklySchedule, absences };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database Error in getDoctorAvailability:', error);
        throw new Error('Failed to fetch doctor availability.');
    } finally {
        client.release();
    }
}

/**
 * Updates the entire weekly schedule for a doctor.
 * @param {string} doctorId - The ID of the doctor.
 * @param {DaySchedule[]} scheduleData - The array of 7 day schedules.
 * @returns {Promise<boolean>}
 */
export async function updateWeeklySchedule(doctorId: string, scheduleData: DaySchedule[]): Promise<boolean> {
    if (scheduleData.length !== 7) {
        throw new Error("Schedule data must contain exactly 7 days.");
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const day of scheduleData) {
            await client.query(
                `UPDATE doctor_weekly_schedules 
                 SET is_working_day = $1, start_time = $2, end_time = $3
                 WHERE doctor_id = $4 AND day_of_week = $5`,
                [day.isWorkingDay, day.startTime, day.endTime, doctorId, day.dayOfWeek]
            );
        }
        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database Error in updateWeeklySchedule:', error);
        throw new Error('Failed to update weekly schedule.');
    } finally {
        client.release();
    }
}

/**
 * Adds a new absence for a doctor.
 * @param {AbsenceCreateInput} absenceData - The details of the absence.
 * @returns {Promise<Absence>}
 */
export async function addAbsence(absenceData: AbsenceCreateInput): Promise<Absence> {
    const query = {
        text: `INSERT INTO doctor_absences (doctor_id, absence_date, is_full_day, start_time, end_time, reason)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING id, doctor_id, absence_date, is_full_day, start_time, end_time, reason`,
        values: [
            absenceData.doctorId,
            absenceData.date,
            absenceData.isFullDay,
            absenceData.startTime || null,
            absenceData.endTime || null,
            absenceData.reason || null
        ],
    };
    try {
        const result = await pool.query(query);
        const r = result.rows[0];
        return {
            id: r.id,
            doctorId: r.doctor_id,
            date: format(new Date(r.absence_date), 'yyyy-MM-dd'),
            isFullDay: r.is_full_day,
            startTime: r.start_time,
            endTime: r.end_time,
            reason: r.reason,
        };
    } catch (error) {
        console.error('Database Error in addAbsence:', error);
        throw new Error('Failed to add absence.');
    }
}

/**
 * Deletes an absence by its ID.
 * @param {string} absenceId - The ID of the absence to delete.
 * @returns {Promise<boolean>}
 */
export async function deleteAbsence(absenceId: string): Promise<boolean> {
    try {
        const result = await pool.query('DELETE FROM doctor_absences WHERE id = $1', [absenceId]);
        return result.rowCount > 0;
    } catch (error) {
        console.error('Database Error in deleteAbsence:', error);
        throw new Error('Failed to delete absence.');
    }
}
