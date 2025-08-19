
'use server';
/**
 * @fileOverview Manages CRUD operations for appointments.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as AppointmentService from '@/services/appointmentService';

const ValidStatusSchema = z.enum(['En attente', 'Confirmé', 'Annulé', 'Payée']);
export type AppointmentStatus = z.infer<typeof ValidStatusSchema>;

// Schema for detailed appointment info, including patient and doctor names
const AppointmentDetailsSchema = z.object({
  id: z.string(),
  dateTime: z.string(), // Using string for ISO date format
  patientId: z.string(),
  patientName: z.string(),
  doctorId: z.string(),
  doctorName: z.string(),
  status: ValidStatusSchema,
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
    status: ValidStatusSchema,
});
export type BookedAppointment = z.infer<typeof BookedAppointmentSchema>;

const AppointmentCreateInputSchema = z.object({
  dateTime: z.string().datetime(),
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
    // The service layer already expects a string or Date that can be converted.
    return AppointmentService.createAppointment({
        ...input,
        dateTime: new Date(input.dateTime), // Ensure it's a Date object for the service layer
    });
  }
);
export async function createAppointment(input: AppointmentCreateInput): Promise<AppointmentDetails> {
  return createAppointmentFlow(input);
}

// Update an appointment's status
const updateAppointmentStatusFlow = ai.defineFlow(
  {
    name: 'updateAppointmentStatusFlow',
    inputSchema: z.object({ 
        appointmentId: z.string(), 
        status: ValidStatusSchema 
    }),
    outputSchema: z.boolean(),
  },
  async ({ appointmentId, status }) => {
    return AppointmentService.updateAppointmentStatus(appointmentId, status);
  }
);
export async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<boolean> {
  return updateAppointmentStatusFlow({ appointmentId, status });
}

// Cancel an appointment (sets status to 'Annulé')
const cancelAppointmentFlow = ai.defineFlow(
    {
        name: 'cancelAppointmentFlow',
        inputSchema: z.string(), // appointmentId
        outputSchema: z.object({ success: z.boolean(), message: z.string().optional() }),
    },
    async (appointmentId) => {
        const success = await AppointmentService.updateAppointmentStatus(appointmentId, 'Annulé');
        if (success) {
            return { success: true, message: 'Appointment cancelled successfully.' };
        }
        return { success: false, message: 'Appointment not found or could not be cancelled.' };
    }
);
export async function cancelAppointment(appointmentId: string): Promise<{ success: boolean, message?: string }> {
    return cancelAppointmentFlow(appointmentId);
}
