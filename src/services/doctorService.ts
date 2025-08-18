/**
 * @fileOverview Service layer for doctor-related business logic.
 * This file encapsulates the logic for interacting with the doctor data source.
 * In a real application, this is where you would use an ORM like Prisma or a database client.
 */

import { doctorsDB, type DoctorInternal } from '@/lib/data/mockDatabase';
import type { Doctor, DoctorCreateInput, DoctorUpdateInput } from '@/ai/flows/doctorManagementFlow';

/**
 * Retrieves all doctors from the data source.
 * Excludes sensitive information like password hashes.
 * @returns {Promise<Doctor[]>} A promise that resolves to an array of doctors.
 */
export async function getAllDoctors(): Promise<Doctor[]> {
  // In a real app, this would be: await prisma.doctor.findMany();
  // Here, we simulate by mapping over the in-memory array.
  return doctorsDB.map(({ passwordHash, ...doctor }) => doctor);
}

/**
 * Creates a new doctor in the data source.
 * @param {DoctorCreateInput} data - The data for the new doctor.
 * @returns {Promise<Doctor>} A promise that resolves to the newly created doctor.
 */
export async function createDoctor(data: DoctorCreateInput): Promise<Doctor> {
  const newDoctorInternal: DoctorInternal = {
    id: `doc${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fullName: data.fullName,
    specialty: data.specialty,
    email: data.email,
    passwordHash: `sim_hashed_${data.password}`, // Simulate hashing
  };

  // In a real app: await prisma.doctor.create({ data: newDoctorInternal });
  doctorsDB.push(newDoctorInternal);

  const { passwordHash, ...doctorData } = newDoctorInternal;
  return doctorData;
}

/**
 * Updates an existing doctor by their ID.
 * @param {string} id - The ID of the doctor to update.
 * @param {DoctorUpdateInput} data - The data to update.
 * @returns {Promise<Doctor>} A promise that resolves to the updated doctor.
 * @throws {Error} If the doctor is not found.
 */
export async function updateDoctorById(id: string, data: DoctorUpdateInput): Promise<Doctor> {
  const doctorIndex = doctorsDB.findIndex(doc => doc.id === id);
  if (doctorIndex === -1) {
    throw new Error('Doctor not found with id: ' + id);
  }

  // In a real app: await prisma.doctor.update({ where: { id }, data });
  doctorsDB[doctorIndex] = {
    ...doctorsDB[doctorIndex],
    ...data
  };

  const { passwordHash, ...updatedDoctorData } = doctorsDB[doctorIndex];
  return updatedDoctorData;
}

/**
 * Deletes a doctor by their ID.
 * @param {string} id - The ID of the doctor to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful, false otherwise.
 */
export async function deleteDoctorById(id: string): Promise<boolean> {
  const initialLength = doctorsDB.length;
  // In a real app: await prisma.doctor.delete({ where: { id } });
  const newDoctorsDB = doctorsDB.filter(doc => doc.id !== id);
  const wasDeleted = newDoctorsDB.length < initialLength;
  // This is a bit of a hack for in-memory, a DB would return a count or throw an error
  if(wasDeleted) {
     // Reassign the main DB array
     doctorsDB.length = 0;
     Array.prototype.push.apply(doctorsDB, newDoctorsDB);
  }
  return wasDeleted;
}

/**
 * Finds a single doctor by their ID.
 * @param {string} id - The ID of the doctor to find.
 * @returns {Promise<Doctor | null>} A promise that resolves to the doctor or null if not found.
 */
export async function getDoctorById(id: string): Promise<Doctor | null> {
    // In a real app: await prisma.doctor.findUnique({ where: { id } });
    const doctor = doctorsDB.find(doc => doc.id === id);
    if (!doctor) return null;
    const { passwordHash, ...doctorData } = doctor;
    return doctorData;
}
