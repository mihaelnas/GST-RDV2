-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS clinic_staff;

-- Create the doctors table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the clinic_staff table
CREATE TABLE clinic_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'clinic_staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Create the appointments table with foreign keys
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'En attente', -- e.g., 'En attente', 'Confirmé', 'Annulé', 'Payée'
    duration_minutes INT NOT NULL DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_status CHECK (status IN ('En attente', 'Confirmé', 'Annulé', 'Payée'))
);

-- Indexes for performance
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date_time ON appointments(date_time);

-- Mock Data Insertion

-- Password for all mock users is 'password123'
-- The hash was generated using:
-- const bcrypt = require('bcryptjs');
-- const salt = bcrypt.genSaltSync(10);
-- const hash = bcrypt.hashSync('password123', salt);
-- console.log(hash);
-- Using a fixed hash for predictability in tests: $2a$10$wOD...
-- Note: A real app should generate unique salts for each user.
-- For this schema, we use different "fake" hashes for clarity.

-- Clinic Staff
-- Use this to log in as clinic staff
INSERT INTO clinic_staff (id, full_name, email, password_hash) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Admin Personnel', 'admin.staff@clinique.fr', '$2a$10$a1s2d3f4g5h6j7k8l9o0pue/Q9Zp8x7y6V5w4T3r2b1N0c9X8v7uG');

-- Doctors
INSERT INTO doctors (id, full_name, specialty, email, password_hash) VALUES
('c1d2e3f4-a5b6-7890-1234-567890abcdef', 'Dr. Alice Martin', 'Cardiologie', 'alice.martin@clinique.fr', '$2a$10$b1c2d3e4f5g6h7i8j9k0lup/Q9Zp8x7y6V5w4T3r2b1N0c9X8v7uH'),
('e5f6a1b2-c3d4-5e8f-6a7b-8c9d0e1f2a3b', 'Dr. Bernard Dubois', 'Pédiatrie', 'bernard.dubois@clinique.fr', '$2a$10$c1d2e3f4g5h6j7k8l9o0pup/Q9Zp8x7y6V5w4T3r2b1N0c9X8v7uI'),
('f6a1b2c3-d4e5-8f6a-7b8c-9d0e1f2a3b4c', 'Dr. Chloé Lambert', 'Dermatologie', 'chloe.lambert@clinique.fr', '$2a$10$d1e2f3g4h5j6k7l8m9n0qvp/Q9Zp8x7y6V5w4T3r2b1N0c9X8v7uJ');

-- Patients
INSERT INTO patients (id, full_name, email, password_hash) VALUES
('3a5c1e8f-7b6d-4a9c-8e2f-1a3b5d7c9e0a', 'Jean Dupont', 'jean.dupont@example.com', '$2a$10$e1f2g3h4j5k6l7m8n9o0pwp/Q9Zp8x7y6V5w4T3r2b1N0c9X8v7uK'),
('1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', 'Marie Curie', 'marie.curie@example.com', '$2a$10$f1g2h3j4k5l6m7n8o9p0qxp/Q9Zp8x7y6V5w4T3r2b1N0c9X8v7uL');

-- Appointments
INSERT INTO appointments (patient_id, doctor_id, date_time, status) VALUES
('3a5c1e8f-7b6d-4a9c-8e2f-1a3b5d7c9e0a', 'c1d2e3f4-a5b6-7890-1234-567890abcdef', NOW() + INTERVAL '3 day', 'Confirmé'),
('1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', 'c1d2e3f4-a5b6-7890-1234-567890abcdef', NOW() + INTERVAL '5 day', 'En attente'),
('3a5c1e8f-7b6d-4a9c-8e2f-1a3b5d7c9e0a', 'e5f6a1b2-c3d4-5e8f-6a7b-8c9d0e1f2a3b', NOW() - INTERVAL '10 day', 'Payée');
