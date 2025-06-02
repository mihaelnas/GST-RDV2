
'use server';
/**
 * @fileOverview Manages CRUD operations for doctors.
 *
 * - listDoctors - Retrieves a list of all doctors.
 * - addDoctor - Adds a new doctor.
 * - updateDoctor - Updates an existing doctor.
 * - deleteDoctor - Deletes a doctor.
 * - Doctor - The type for a doctor object (without password).
 * - DoctorCreateInput - The input type for creating a doctor (with password).
 * - DoctorUpdateInput - The input type for updating a doctor.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema for Doctor data returned by flows (password excluded)
const DoctorSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  specialty: z.string(),
  email: z.string().email(),
});
export type Doctor = z.infer<typeof DoctorSchema>;

// Schema for creating a new doctor (includes password)
const DoctorCreateInputSchema = z.object({
  fullName: z.string().min(3, "Le nom complet est requis (min 3 caractères)."),
  specialty: z.string().min(3, "La spécialité est requise (min 3 caractères)."),
  email: z.string().email("Adresse e-mail invalide."),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});
export type DoctorCreateInput = z.infer<typeof DoctorCreateInputSchema>;

// Schema for updating an existing doctor (password changes are typically handled separately)
const DoctorUpdateInputSchema = z.object({
  fullName: z.string().min(3, "Le nom complet est requis (min 3 caractères).").optional(),
  specialty: z.string().min(3, "La spécialité est requise (min 3 caractères).").optional(),
  email: z.string().email("Adresse e-mail invalide.").optional(),
});
export type DoctorUpdateInput = z.infer<typeof DoctorUpdateInputSchema>;

// Internal representation, might include sensitive data like password hash
interface DoctorInternal extends Doctor {
  passwordHash?: string; // Simulate password storage
}

// In-memory store to simulate a database
let doctorsDB: DoctorInternal[] = [
  { id: 'doc1', fullName: 'Dr. Alice Martin', specialty: 'Cardiologie', email: 'alice.martin@example.com', passwordHash: 'hashed_password1_simulated' },
  { id: 'doc2', fullName: 'Dr. Bernard Dubois', specialty: 'Pédiatrie', email: 'bernard.dubois@example.com', passwordHash: 'hashed_password2_simulated' },
  { id: 'doc3', fullName: 'Dr. Chloé Lambert', specialty: 'Dermatologie', email: 'chloe.lambert@example.com', passwordHash: 'hashed_password3_simulated' },
];

// --- Flows ---

const listDoctorsFlowInternal = ai.defineFlow(
  {
    name: 'listDoctorsFlowInternal',
    outputSchema: z.array(DoctorSchema),
  },
  async () => {
    // Exclude passwordHash when returning the list
    return doctorsDB.map(({ passwordHash, ...doctor }) => doctor);
  }
);
export async function listDoctors(): Promise<Doctor[]> {
  return listDoctorsFlowInternal();
}

const addDoctorFlowInternal = ai.defineFlow(
  {
    name: 'addDoctorFlowInternal',
    inputSchema: DoctorCreateInputSchema,
    outputSchema: DoctorSchema,
  },
  async (input) => {
    const newDoctorInternal: DoctorInternal = {
      id: `doc${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, // More unique ID
      fullName: input.fullName,
      specialty: input.specialty,
      email: input.email,
      passwordHash: `sim_hashed_${input.password}`, // Simulate hashing
    };
    doctorsDB.push(newDoctorInternal);
    const { passwordHash, ...doctorData } = newDoctorInternal;
    return doctorData;
  }
);
export async function addDoctor(input: DoctorCreateInput): Promise<Doctor> {
  return addDoctorFlowInternal(input);
}

const UpdateDoctorFlowInputSchema = z.object({
    id: z.string(),
    data: DoctorUpdateInputSchema, // Use the schema that excludes password
});
const updateDoctorFlowInternal = ai.defineFlow(
  {
    name: 'updateDoctorFlowInternal',
    inputSchema: UpdateDoctorFlowInputSchema,
    outputSchema: DoctorSchema,
  },
  async ({ id, data }) => {
    const doctorIndex = doctorsDB.findIndex(doc => doc.id === id);
    if (doctorIndex === -1) {
      throw new Error('Doctor not found with id: ' + id);
    }
    // Merge existing data with new data, ensuring passwordHash is preserved if not explicitly changed
    doctorsDB[doctorIndex] = { 
        ...doctorsDB[doctorIndex], 
        ...data 
    };
    const { passwordHash, ...updatedDoctorData } = doctorsDB[doctorIndex];
    return updatedDoctorData;
  }
);
export async function updateDoctor(id: string, data: DoctorUpdateInput): Promise<Doctor> {
  return updateDoctorFlowInternal({ id, data });
}

const DeleteDoctorFlowInputSchema = z.object({ id: z.string() });
const deleteDoctorFlowInternal = ai.defineFlow(
  {
    name: 'deleteDoctorFlowInternal',
    inputSchema: DeleteDoctorFlowInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string().optional() }),
  },
  async ({ id }) => {
    const initialLength = doctorsDB.length;
    doctorsDB = doctorsDB.filter(doc => doc.id !== id);
    if (doctorsDB.length < initialLength) {
      return { success: true, message: 'Doctor deleted successfully.' };
    }
    return { success: false, message: 'Doctor not found or already deleted.' };
  }
);
export async function deleteDoctor(id: string): Promise<{ success: boolean, message?: string }> {
  return deleteDoctorFlowInternal({ id });
}
