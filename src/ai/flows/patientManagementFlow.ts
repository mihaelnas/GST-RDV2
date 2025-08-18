'use server';
/**
 * @fileOverview Manages CRUD operations for patients, acting as the API layer.
 *
 * - listPatients - Retrieves a list of all patients.
 * - addPatient - Adds a new patient.
 * - updatePatient - Updates an existing patient.
 * - deletePatient - Deletes a patient.
 * - Patient - The type for a patient object (without password).
 * - PatientCreateInput - The input type for creating a patient (with password).
 * - PatientUpdateInput - The input type for updating a patient.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as PatientService from '@/services/patientService'; // Import the service layer

// Schema for Patient data returned by flows (password excluded)
const PatientSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  dob: z.date(), // Date of Birth
});
export type Patient = z.infer<typeof PatientSchema>;

// Schema for creating a new patient (includes password)
const PatientCreateInputSchema = z.object({
  fullName: z.string().min(3, "Le nom complet est requis (min 3 caractères)."),
  email: z.string().email("Adresse e-mail invalide."),
  dob: z.date({ required_error: "La date de naissance est requise." }),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});
export type PatientCreateInput = z.infer<typeof PatientCreateInputSchema>;

// Schema for updating an existing patient
const PatientUpdateInputSchema = z.object({
  fullName: z.string().min(3, "Le nom complet est requis (min 3 caractères).").optional(),
  email: z.string().email("Adresse e-mail invalide.").optional(),
  dob: z.date().optional(),
});
export type PatientUpdateInput = z.infer<typeof PatientUpdateInputSchema>;


// --- Flows (Controller Layer) ---

const listPatientsFlowInternal = ai.defineFlow(
  {
    name: 'listPatientsFlowInternal',
    outputSchema: z.array(PatientSchema),
  },
  async () => {
    // Call the service to get the data
    return PatientService.getAllPatients();
  }
);
export async function listPatients(): Promise<Patient[]> {
  return listPatientsFlowInternal();
}

const addPatientFlowInternal = ai.defineFlow(
  {
    name: 'addPatientFlowInternal',
    inputSchema: PatientCreateInputSchema,
    outputSchema: PatientSchema,
  },
  async (input) => {
    // Call the service to create the patient
    return PatientService.createPatient(input);
  }
);
export async function addPatient(input: PatientCreateInput): Promise<Patient> {
  return addPatientFlowInternal(input);
}

const UpdatePatientFlowInputSchema = z.object({
    id: z.string(),
    data: PatientUpdateInputSchema,
});
const updatePatientFlowInternal = ai.defineFlow(
  {
    name: 'updatePatientFlowInternal',
    inputSchema: UpdatePatientFlowInputSchema,
    outputSchema: PatientSchema,
  },
  async ({ id, data }) => {
    // Call the service to update the patient
    return PatientService.updatePatientById(id, data);
  }
);
export async function updatePatient(id: string, data: PatientUpdateInput): Promise<Patient> {
  return updatePatientFlowInternal({ id, data });
}

const DeletePatientFlowInputSchema = z.object({ id: z.string() });
const deletePatientFlowInternal = ai.defineFlow(
  {
    name: 'deletePatientFlowInternal',
    inputSchema: DeletePatientFlowInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string().optional() }),
  },
  async ({ id }) => {
    // Call the service to delete the patient
    const success = await PatientService.deletePatientById(id);
    if (success) {
      return { success: true, message: 'Patient deleted successfully.' };
    }
    return { success: false, message: 'Patient not found or already deleted.' };
  }
);
export async function deletePatient(id: string): Promise<{ success: boolean, message?: string }> {
  return deletePatientFlowInternal({ id });
}

// Helper to get a patient by ID, used in AppointmentScheduler for email
const getPatientByIdFlowInternal = ai.defineFlow(
  {
    name: 'getPatientByIdFlowInternal',
    inputSchema: z.object({ id: z.string() }),
    outputSchema: PatientSchema.nullable(),
  },
  async ({ id }) => {
    // Call the service to get the patient
    return PatientService.getPatientById(id);
  }
);
export async function getPatientById(id: string): Promise<Patient | null> {
    return getPatientByIdFlowInternal({ id });
}
