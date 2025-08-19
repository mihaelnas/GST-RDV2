-- This script initializes the database schema and populates it with sample data.

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS clinic_staff;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;

-- Create a function to generate random UUIDs if the extension isn't already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table for Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Table for Doctors
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Table for Clinic Staff (e.g., receptionists, administrators)
CREATE TABLE clinic_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'receptionist' -- e.g., 'receptionist', 'admin'
);

-- Table for Appointments
-- ON DELETE SET NULL ensures that if a doctor or patient is deleted, the appointment record is kept for historical purposes
-- without a dangling foreign key reference.
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'En attente' NOT NULL -- e.g., 'En attente', 'Confirmé', 'Annulé', 'Payée'
);

-- Indexes for performance
CREATE INDEX ON appointments (patient_id);
CREATE INDEX ON appointments (doctor_id);
CREATE INDEX ON appointments (date_time);

-- Insert Sample Data

-- Passwords for all sample users are 'password123'
-- The hash was generated using: bcrypt.hash('password123', 10)
-- This avoids needing bcrypt in the SQL script itself.
-- Hashed password: $2a$10$3b/tC.aPZ3cW1b.g6A/ZJu.Gz0v0g.Xf.Has/9jPjB88TjP2E3mO.

-- Sample Patients
INSERT INTO patients (id, full_name, email, password_hash) VALUES
('1d44c844-3257-4148-8422-411394a85a4a', 'Jean Dupont', 'jean.dupont@example.com', '$2a$10$3b/tC.aPZ3cW1b.g6A/ZJu.Gz0v0g.Xf.Has/9jPjB88TjP2E3mO.'),
('2e55d955-4368-5259-9533-5224a5b96b5b', 'Marie Martin', 'marie.martin@example.com', '$2a$10$3b/tC.aPZ3cW1b.g6A/ZJu.Gz0v0g.Xf.Has/9jPjB88TjP2E3mO.');

-- Sample Doctors
INSERT INTO doctors (id, full_name, specialty, email, password_hash) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Dr. Alice Martin', 'Cardiologie', 'alice.martin@clinic.com', '$2a$10$3b/tC.aPZ3cW1b.g6A/ZJu.Gz0v0g.Xf.Has/9jPjB88TjP2E3mO.'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Dr. Bernard Dubois', 'Pédiatrie', 'bernard.dubois@clinic.com', '$2a$10$3b/tC.aPZ3cW1b.g6A/ZJu.Gz0v0g.Xf.Has/9jPjB88TjP2E3mO.'),
('c3d4e5f6-a7b8-9012-3456-7890abcdef12', 'Dr. Chloé Lambert', 'Dermatologie', 'chloe.lambert@clinic.com', '$2a$10$3b/tC.aPZ3cW1b.g6A/ZJu.Gz0v0g.Xf.Has/9jPjB88TjP2E3mO.');


-- Sample Clinic Staff
INSERT INTO clinic_staff (id, full_name, email, password_hash, role) VALUES
('3f66e066-5479-636a-a644-6335b6c07c6c', 'Admin Staff', 'admin@clinic.com', '$2a$10$3b/tC.aPZ3cW1b.g6A/ZJu.Gz0v0g.Xf.Has/9jPjB88TjP2E3mO.', 'admin');

-- Sample Appointments
-- Using the IDs from the sample data above
INSERT INTO appointments (date_time, patient_id, doctor_id, status) VALUES
(NOW() + INTERVAL '3 day', '1d44c844-3257-4148-8422-411394a85a4a', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Confirmé'),
(NOW() + INTERVAL '5 day', '2e55d955-4368-5259-9533-5224a5b96b5b', 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'En attente'),
(NOW() - INTERVAL '10 day', '1d44c844-3257-4148-8422-411394a85a4a', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Payée');

-- Log to confirm the script ran
\echo 'Database schema created and sample data inserted.'
