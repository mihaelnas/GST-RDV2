/**
 * @fileOverview Service layer for patient-related business logic.
 * This file encapsulates the logic for interacting with the patient data source.
 */

import { patientsDB, type PatientInternal } from '@/lib/data/mockDatabase';
import type { Patient, PatientCreateInput, PatientUpdateInput } from '@/ai/flows/patientManagementFlow';

/**
 * Retrieves all patients from the data source.
 * Excludes sensitive information like password hashes.
 * @returns {Promise<Patient[]>} A promise that resolves to an array of patients.
 */
export async function getAllPatients(): Promise<Patient[]> {
  // DB call simulation
  return patientsDB.map(({ passwordHash, ...patient }) => ({
      ...patient,
      dob: new Date(patient.dob) // Ensure dob is a Date object
  }));
}

/**
 * Creates a new patient in the data source.
 * @param {PatientCreateInput} data - The data for the new patient.
 * @returns {Promise<Patient>} A promise that resolves to the newly created patient.
 */
export async function createPatient(data: PatientCreateInput): Promise<Patient> {
  const newPatientInternal: PatientInternal = {
    id: `pat${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fullName: data.fullName,
    email: data.email,
    dob: data.dob,
    passwordHash: `sim_hashed_${data.password}`, // Simulate hashing
  };

  patientsDB.push(newPatientInternal);

  const { passwordHash, ...patientData } = newPatientInternal;
  return patientData;
}

/**
 * Updates an existing patient by their ID.
 * @param {string} id - The ID of the patient to update.
 * @param {PatientUpdateInput} data - The data to update.
 * @returns {Promise<Patient>} A promise that resolves to the updated patient.
 * @throws {Error} If the patient is not found.
 */
export async function updatePatientById(id: string, data: PatientUpdateInput): Promise<Patient> {
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

/**
 * Deletes a patient by their ID.
 * @param {string} id - The ID of the patient to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful, false otherwise.
 */
export async function deletePatientById(id: string): Promise<boolean> {
  const initialLength = patientsDB.length;
  const newPatientsDB = patientsDB.filter(pat => pat.id !== id);
  const wasDeleted = newPatientsDB.length < initialLength;
  if(wasDeleted) {
     patientsDB.length = 0;
     Array.prototype.push.apply(patientsDB, newPatientsDB);
  }
  return wasDeleted;
}

/**
 * Finds a single patient by their ID.
 * @param {string} id - The ID of the patient to find.
 * @returns {Promise<Patient | null>} A promise that resolves to the patient or null if not found.
 */
export async function getPatientById(id: string): Promise<Patient | null> {
    const patient = patientsDB.find(pat => pat.id === id);
    if (!patient) return null;
    const { passwordHash, ...patientData } = patient;
    return patientData;
}
