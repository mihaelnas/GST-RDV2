-- This script initializes the database for the Clinique Rendez-Vous app.
-- It creates the necessary tables and seeds them with initial data.

-- Enable the pgcrypto extension to generate UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS clinic_staff;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;

-- Create the doctors table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Create the patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Create the clinic_staff table
CREATE TABLE clinic_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'staff'
);

-- Create the appointments table with foreign key constraints
-- ON DELETE SET NULL ensures that if a doctor or patient is deleted,
-- the appointment record is kept for historical purposes, but the link is severed.
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'En attente' -- e.g., 'En attente', 'Confirmé', 'Annulé', 'Payée'
);

-- --- SEED DATA ---

-- Insert sample doctors
-- Passwords are all 'password123' hashed with bcrypt (cost factor 10)
INSERT INTO doctors (full_name, specialty, email, password_hash) VALUES
('Dr. Alice Martin', 'Cardiologie', 'alice.martin@clinic.com', '$2a$10$3zX.o.m4.hS.d7Y.z.jS9uA2wL9c6P.K9QyL.jE1kI3oN6I.oO/y'),
('Dr. Bernard Dubois', 'Pédiatrie', 'bernard.dubois@clinic.com', '$2a$10$3zX.o.m4.hS.d7Y.z.jS9uA2wL9c6P.K9QyL.jE1kI3oN6I.oO/y'),
('Dr. Chloé Lambert', 'Dermatologie', 'chloe.lambert@clinic.com', '$2a$10$3zX.o.m4.hS.d7Y.z.jS9uA2wL9c6P.K9QyL.jE1kI3oN6I.oO/y');

-- Insert sample patients
INSERT INTO patients (full_name, email, password_hash) VALUES
('Jean Dupont', 'jean.dupont@email.com', '$2a$10$3zX.o.m4.hS.d7Y.z.jS9uA2wL9c6P.K9QyL.jE1kI3oN6I.oO/y'),
('Marie Curie', 'marie.curie@email.com', '$2a$10$3zX.o.m4.hS.d7Y.z.jS9uA2wL9c6P.K9QyL.jE1kI3oN6I.oO/y'),
('Pierre Martin', 'pierre.martin@email.com', '$2a$10$3zX.o.m4.hS.d7Y.z.jS9uA2wL9c6P.K9QyL.jE1kI3oN6I.oO/y');

-- Insert sample clinic staff
INSERT INTO clinic_staff (full_name, email, password_hash, role) VALUES
('Admin Sophie', 'sophie.admin@clinic.com', '$2a$10$3zX.o.m4.hS.d7Y.z.jS9uA2wL9c6P.K9QyL.jE1kI3oN6I.oO/y', 'clinic_staff');

-- Insert sample appointments
-- We will fetch the IDs of the doctors and patients we just inserted to create valid appointments.
DO $$
DECLARE
    dr_martin_id UUID;
    dr_dubois_id UUID;
    patient_jean_id UUID;
    patient_marie_id UUID;
BEGIN
    -- Get IDs
    SELECT id INTO dr_martin_id FROM doctors WHERE email = 'alice.martin@clinic.com';
    SELECT id INTO dr_dubois_id FROM doctors WHERE email = 'bernard.dubois@clinic.com';
    SELECT id INTO patient_jean_id FROM patients WHERE email = 'jean.dupont@email.com';
    SELECT id INTO patient_marie_id FROM patients WHERE email = 'marie.curie@email.com';

    -- Insert appointments
    INSERT INTO appointments (doctor_id, patient_id, date_time, status) VALUES
    (dr_martin_id, patient_jean_id, NOW() + INTERVAL '3 days', 'Confirmé'),
    (dr_dubois_id, patient_marie_id, NOW() + INTERVAL '5 days', 'En attente'),
    (dr_martin_id, patient_marie_id, NOW() - INTERVAL '10 days', 'Payée');
END $$;


-- Add indexes for performance on foreign keys
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);

-- --- END OF SCRIPT ---
