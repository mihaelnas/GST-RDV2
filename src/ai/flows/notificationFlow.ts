
'use server';
/**
 * @fileOverview Manages sending notifications (e.g., email for appointments).
 *
 * - sendPatientConfirmationEmail - Sends a confirmation email to the patient.
 * - sendDoctorAppointmentNotificationEmail - Sends a notification email to the doctor.
 * - AppointmentNotificationInput - The input type for notification functions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AppointmentNotificationInputSchema = z.object({
  patientName: z.string(),
  patientEmail: z.string().email(),
  doctorName: z.string(),
  doctorEmail: z.string().email(),
  appointmentDateTime: z.date(),
  appointmentId: z.string().optional(), // Optional: for reference
});
export type AppointmentNotificationInput = z.infer<typeof AppointmentNotificationInputSchema>;

const NotificationOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

const sendPatientConfirmationEmailFlow = ai.defineFlow(
  {
    name: 'sendPatientConfirmationEmailFlow',
    inputSchema: AppointmentNotificationInputSchema,
    outputSchema: NotificationOutputSchema,
  },
  async (input) => {
    const formattedDateTime = format(input.appointmentDateTime, "eeee d MMMM yyyy 'à' HH:mm", { locale: fr });
    // Simulate email sending
    console.log(`SIMULATION: Sending patient confirmation email to ${input.patientEmail}`);
    console.log(`Subject: Confirmation de votre rendez-vous le ${formattedDateTime}`);
    console.log(`Body: Bonjour ${input.patientName},\nVotre rendez-vous avec ${input.doctorName} le ${formattedDateTime} est confirmé.\nID du rendez-vous: ${input.appointmentId || 'N/A'}`);
    
    // In a real app, you would use an email service SDK here (e.g., SendGrid, Nodemailer)
    // For example:
    // try {
    //   await emailService.send({
    //     to: input.patientEmail,
    //     subject: `Confirmation de votre rendez-vous le ${formattedDateTime}`,
    //     html: `<p>Bonjour ${input.patientName},</p><p>Votre rendez-vous avec ${input.doctorName} le ${formattedDateTime} est confirmé.</p>`,
    //   });
    //   return { success: true, message: 'Patient confirmation email sent successfully.' };
    // } catch (error) {
    //   console.error("Failed to send patient email:", error);
    //   return { success: false, message: 'Failed to send patient confirmation email.' };
    // }
    return { success: true, message: `Simulated: Patient confirmation email for appointment ${input.appointmentId} sent to ${input.patientEmail}.` };
  }
);

export async function sendPatientConfirmationEmail(input: AppointmentNotificationInput): Promise<{ success: boolean, message: string }> {
  return sendPatientConfirmationEmailFlow(input);
}


const sendDoctorAppointmentNotificationEmailFlow = ai.defineFlow(
  {
    name: 'sendDoctorAppointmentNotificationEmailFlow',
    inputSchema: AppointmentNotificationInputSchema,
    outputSchema: NotificationOutputSchema,
  },
  async (input) => {
    const formattedDateTime = format(input.appointmentDateTime, "eeee d MMMM yyyy 'à' HH:mm", { locale: fr });
    // Simulate email sending
    console.log(`SIMULATION: Sending doctor notification email to ${input.doctorEmail}`);
    console.log(`Subject: Nouveau rendez-vous le ${formattedDateTime} avec ${input.patientName}`);
    console.log(`Body: Bonjour ${input.doctorName},\nVous avez un nouveau rendez-vous avec ${input.patientName} le ${formattedDateTime}.\nID du rendez-vous: ${input.appointmentId || 'N/A'}`);
    
    // Real implementation would be similar to patient email
    return { success: true, message: `Simulated: Doctor notification email for appointment ${input.appointmentId} sent to ${input.doctorEmail}.` };
  }
);

export async function sendDoctorAppointmentNotificationEmail(input: AppointmentNotificationInput): Promise<{ success: boolean, message: string }> {
  return sendDoctorAppointmentNotificationEmailFlow(input);
}
