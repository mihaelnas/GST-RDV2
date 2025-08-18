
'use server';
/**
 * @fileOverview Manages CRUD operations for appointments.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as AppointmentService from '@/services/appointmentService';

// Schema for detailed appointment info, including patient and doctor names
const AppointmentDetailsSchema = z.object({
  id: z.string(),
  dateTime: z.string(), // Using string for ISO date format
  patientId: z.string(),
  patientName: z.string(),
  doctorId: z.string(),
  doctorName: z.string(),
  status: z.string(),
  durationMinutes: z.number(),
});
export type AppointmentDetails = z.infer<typeof AppointmentDetailsSchema>;

// Schema for appointments booked by a specific patient or for a doctor
const BookedAppointmentSchema = z.object({
    id: z.string(),
    dateTime: z.string(), // ISO date string
    patientId: z.string(),
    patientName: z.string(),
    doctorId: z.string(),
    doctorName: z.string(),
    status: z.string(),
});
export type BookedAppointment = z.infer<typeof BookedAppointmentSchema>;

const AppointmentCreateInputSchema = z.object({
  dateTime: z.date(),
  patientId: z.string(),
  doctorId: z.string(),
});
export type AppointmentCreateInput = z.infer<typeof AppointmentCreateInputSchema>;

// --- Flows ---

// List all appointments with full details (for clinic staff)
const listAppointmentsFlow = ai.defineFlow(
  {
    name: 'listAppointmentsFlow',
    outputSchema: z.array(AppointmentDetailsSchema),
  },
  async () => {
    return AppointmentService.getAllAppointmentsDetails();
  }
);
export async function listAppointments(): Promise<AppointmentDetails[]> {
  return listAppointmentsFlow();
}

// List appointments for a specific doctor
const listAppointmentsByDoctorFlow = ai.defineFlow(
  {
    name: 'listAppointmentsByDoctorFlow',
    inputSchema: z.string(), // doctorId
    outputSchema: z.array(BookedAppointmentSchema),
  },
  async (doctorId) => {
    return AppointmentService.getAppointmentsByDoctorId(doctorId);
  }
);
export async function listAppointmentsByDoctor(doctorId: string): Promise<BookedAppointment[]> {
    return listAppointmentsByDoctorFlow(doctorId);
}

// List appointments for a specific patient
const listAppointmentsByPatientFlow = ai.defineFlow(
  {
    name: 'listAppointmentsByPatientFlow',
    inputSchema: z.string(), // patientId
    outputSchema: z.array(BookedAppointmentSchema),
  },
  async (patientId) => {
    return AppointmentService.getAppointmentsByPatientId(patientId);
  }
);
export async function listAppointmentsByPatient(patientId: string): Promise<BookedAppointment[]> {
    return listAppointmentsByPatientFlow(patientId);
}


// Create a new appointment
const createAppointmentFlow = ai.defineFlow(
  {
    name: 'createAppointmentFlow',
    inputSchema: AppointmentCreateInputSchema,
    outputSchema: AppointmentDetailsSchema,
  },
  async (input) => {
    return AppointmentService.createAppointment(input);
  }
);
export async function createAppointment(input: AppointmentCreateInput): Promise<AppointmentDetails> {
  return createAppointmentFlow(input);
}

// Update an appointment's status
const updateAppointmentStatusFlow = ai.defineFlow(
  {
    name: 'updateAppointmentStatusFlow',
    inputSchema: z.object({ appointmentId: z.string(), status: z.string() }),
    outputSchema: z.boolean(),
  },
  async ({ appointmentId, status }) => {
    return AppointmentService.updateAppointmentStatus(appointmentId, status);
  }
);
export async function updateAppointmentStatus(appointmentId: string, status: string): Promise<boolean> {
  return updateAppointmentStatusFlow({ appointmentId, status });
}

// Delete an appointment
const deleteAppointmentFlow = ai.defineFlow(
    {
        name: 'deleteAppointmentFlow',
        inputSchema: z.string(), // appointmentId
        outputSchema: z.object({ success: z.boolean(), message: z.string().optional() }),
    },
    async (appointmentId) => {
        const success = await AppointmentService.deleteAppointmentById(appointmentId);
        if (success) {
            return { success: true, message: 'Appointment deleted successfully.' };
        }
        return { success: false, message: 'Appointment not found or already deleted.' };
    }
);
export async function deleteAppointment(appointmentId: string): Promise<{ success: boolean, message?: string }> {
    return deleteAppointmentFlow(appointmentId);
}
