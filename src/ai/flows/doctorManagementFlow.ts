'use server';
/**
 * @fileOverview Manages CRUD operations for doctors, acting as the API layer.
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
import * as DoctorService from '@/services/doctorService'; // Import the service layer

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


// --- Flows (Controller Layer) ---

const listDoctorsFlowInternal = ai.defineFlow(
  {
    name: 'listDoctorsFlowInternal',
    outputSchema: z.array(DoctorSchema),
  },
  async () => {
    // Call the service to get the data
    return DoctorService.getAllDoctors();
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
    // Call the service to create the doctor
    return DoctorService.createDoctor(input);
  }
);
export async function addDoctor(input: DoctorCreateInput): Promise<Doctor> {
  return addDoctorFlowInternal(input);
}

const UpdateDoctorFlowInputSchema = z.object({
    id: z.string(),
    data: DoctorUpdateInputSchema,
});
const updateDoctorFlowInternal = ai.defineFlow(
  {
    name: 'updateDoctorFlowInternal',
    inputSchema: UpdateDoctorFlowInputSchema,
    outputSchema: DoctorSchema,
  },
  async ({ id, data }) => {
    // Call the service to update the doctor
    return DoctorService.updateDoctorById(id, data);
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
    // Call the service to delete the doctor
    const success = await DoctorService.deleteDoctorById(id);
    if (success) {
      return { success: true, message: 'Doctor deleted successfully.' };
    }
    return { success: false, message: 'Doctor not found or already deleted.' };
  }
);
export async function deleteDoctor(id: string): Promise<{ success: boolean, message?: string }> {
  return deleteDoctorFlowInternal({ id });
}
