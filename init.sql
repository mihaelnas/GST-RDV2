-- Drop existing tables to start fresh
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS clinic_staff;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;

-- Create Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Create Doctors Table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Create Clinic Staff Table
CREATE TABLE clinic_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff'
);

-- Create Appointments Table
-- ON DELETE SET NULL ensures that if a patient or doctor is deleted,
-- the appointment record is kept for historical purposes without a link to the deleted entity.
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'En attente',
    duration_minutes INTEGER DEFAULT 30
);

-- Indexes for performance
CREATE INDEX ON appointments (patient_id);
CREATE INDEX ON appointments (doctor_id);
CREATE INDEX ON appointments (date_time);

-- Seed Patients
-- Passwords for all are "password123"
INSERT INTO patients (id, full_name, email, password_hash) VALUES
('1d8e1c21-9952-4a48-a14f-83b663b6a7d6', 'Alice Dupont', 'alice.dupont@example.com', '$2a$10$7/OC.1d5iV5t.g5g4XhO/OSOs.g8Jm23gqF.zY3x5t.J5Oq6aY3rS'),
('8f2e784a-4e23-4b6f-8c3a-9e1b2c1d3b2a', 'Bob Martin', 'bob.martin@example.com', '$2a$10$7/OC.1d5iV5t.g5g4XhO/OSOs.g8Jm23gqF.zY3x5t.J5Oq6aY3rS');

-- Seed Doctors
-- Passwords for all are "password123"
INSERT INTO doctors (id, full_name, specialty, email, password_hash) VALUES
('c7a8d9e0-3b2c-4d1a-a8f9-e1b2c3d4e5f6', 'Dr. Alice Martin', 'Cardiologie', 'dr.martin@clinic.com', '$2a$10$7/OC.1d5iV5t.g5g4XhO/OSOs.g8Jm23gqF.zY3x5t.J5Oq6aY3rS'),
('f4b3c2a1-9e8d-7c6b-5a4d-3e2f1a9b8c7d', 'Dr. Bernard Dubois', 'Pédiatrie', 'dr.dubois@clinic.com', '$2a$10$7/OC.1d5iV5t.g5g4XhO/OSOs.g8Jm23gqF.zY3x5t.J5Oq6aY3rS'),
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Dr. Chloé Lambert', 'Dermatologie', 'dr.lambert@clinic.com', '$2a$10$7/OC.1d5iV5t.g5g4XhO/OSOs.g8Jm23gqF.zY3x5t.J5Oq6aY3rS');


-- Seed Clinic Staff
-- Password is "password123"
INSERT INTO clinic_staff (id, full_name, email, password_hash, role) VALUES
('a0b1c2d3-e4f5-a6b7-c8d9-e0f1a2b3c4d5', 'Carole Richard', 'staff@clinic.com', '$2a$10$7/OC.1d5iV5t.g5g4XhO/OSOs.g8Jm23gqF.zY3x5t.J5Oq6aY3rS', 'admin');

-- Seed Appointments
-- Note: Timestamps are in UTC (timezone 'Z')
INSERT INTO appointments (date_time, patient_id, doctor_id, status) VALUES
(NOW() + INTERVAL '2 day', '1d8e1c21-9952-4a48-a14f-83b663b6a7d6', 'c7a8d9e0-3b2c-4d1a-a8f9-e1b2c3d4e5f6', 'Confirmé'),
(NOW() + INTERVAL '3 day', '8f2e784a-4e23-4b6f-8c3a-9e1b2c1d3b2a', 'f4b3c2a1-9e8d-7c6b-5a4d-3e2f1a9b8c7d', 'En attente'),
(NOW() - INTERVAL '10 day', '1d8e1c21-9952-4a48-a14f-83b663b6a7d6', 'c7a8d9e0-3b2c-4d1a-a8f9-e1b2c3d4e5f6', 'Payée');
