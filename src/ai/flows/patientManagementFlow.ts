
'use server';
/**
 * @fileOverview Manages CRUD operations for patients.
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

// Internal representation, might include sensitive data like password hash
interface PatientInternal extends Patient {
  passwordHash?: string; // Simulate password storage
}

// In-memory store to simulate a database
let patientsDB: PatientInternal[] = [
  { id: 'pat1', fullName: 'Laura Durand', email: 'laura.durand@example.com', dob: new Date(1990, 5, 15), passwordHash: 'hashed_password_pat1' },
  { id: 'pat2', fullName: 'Paul Lefevre', email: 'paul.lefevre@example.com', dob: new Date(1985, 8, 22), passwordHash: 'hashed_password_pat2' },
  { id: 'pat3', fullName: 'Sophie Petit', email: 'sophie.petit@example.com', dob: new Date(2001, 1, 10), passwordHash: 'hashed_password_pat3' },
];

// --- Flows ---

const listPatientsFlowInternal = ai.defineFlow(
  {
    name: 'listPatientsFlowInternal',
    outputSchema: z.array(PatientSchema),
  },
  async () => {
    // Exclude passwordHash when returning the list
    return patientsDB.map(({ passwordHash, ...patient }) => patient);
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
    const newPatientInternal: PatientInternal = {
      id: `pat${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: input.fullName,
      email: input.email,
      dob: input.dob,
      passwordHash: `sim_hashed_${input.password}`, // Simulate hashing
    };
    patientsDB.push(newPatientInternal);
    const { passwordHash, ...patientData } = newPatientInternal;
    return patientData;
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
    const patientIndex = patientsDB.findIndex(pat => pat.id === id);
    if (patientIndex === -1) {
      throw new Error('Patient not found with id: ' + id);
    }
    patientsDB[patientIndex] = {
        ...patientsDB[patientIndex],
        ...data
    };
    const { passwordHash, ...updatedPatientData } = patientsDB[patientIndex];
    return updatedPatientData;
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
    const initialLength = patientsDB.length;
    patientsDB = patientsDB.filter(pat => pat.id !== id);
    if (patientsDB.length < initialLength) {
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
    const patient = patientsDB.find(pat => pat.id === id);
    if (!patient) return null;
    const { passwordHash, ...patientData } = patient;
    return patientData;
  }
);
export async function getPatientById(id: string): Promise<Patient | null> {
    return getPatientByIdFlowInternal({ id });
}
