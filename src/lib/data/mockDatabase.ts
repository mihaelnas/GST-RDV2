/**
 * @fileOverview Mock database for in-memory data storage.
 * In a real application, this would be replaced by a proper database connection setup.
 */

// --- DOCTOR DATA ---

export interface DoctorInternal {
  id: string;
  fullName: string;
  specialty: string;
  email: string;
  passwordHash?: string; // Simulate password storage
}

// In-memory store to simulate a database for Doctors
export let doctorsDB: DoctorInternal[] = [
  { id: 'doc1', fullName: 'Dr. Alice Martin', specialty: 'Cardiologie', email: 'alice.martin@example.com', passwordHash: 'hashed_password1_simulated' },
  { id: 'doc2', fullName: 'Dr. Bernard Dubois', specialty: 'Pédiatrie', email: 'bernard.dubois@example.com', passwordHash: 'hashed_password2_simulated' },
  { id: 'doc3', fullName: 'Dr. Chloé Lambert', specialty: 'Dermatologie', email: 'chloe.lambert@example.com', passwordHash: 'hashed_password3_simulated' },
];


// --- PATIENT DATA ---

export interface PatientInternal {
  id: string;
  fullName: string;
  email: string;
  dob: Date;
  passwordHash?: string; // Simulate password storage
}

// In-memory store to simulate a database for Patients
export let patientsDB: PatientInternal[] = [
  { id: 'pat1', fullName: 'Laura Durand', email: 'laura.durand@example.com', dob: new Date(1990, 5, 15), passwordHash: 'hashed_password_pat1' },
  { id: 'pat2', fullName: 'Paul Lefevre', email: 'paul.lefevre@example.com', dob: new Date(1985, 8, 22), passwordHash: 'hashed_password_pat2' },
  { id: 'pat3', fullName: 'Sophie Petit', email: 'sophie.petit@example.com', dob: new Date(2001, 1, 10), passwordHash: 'hashed_password_pat3' },
];
