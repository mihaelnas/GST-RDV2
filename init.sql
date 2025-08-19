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
    password_hash VARCHAR(255) NOT NULL
);

-- Create Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'En attente'
);

-- Insert sample data
-- Passwords for all users are 'password123'
-- Patient passwords
INSERT INTO patients (full_name, email, password_hash) VALUES
('Jean Dupont', 'jean.dupont@email.com', '$2a$10$9c3.mN/DB5CG2E7GEz5JsezRkXn22uG0iNlqgqgqGj2l.9j2.Jj2S'),
('Marie Dubois', 'marie.dubois@email.com', '$2a$10$9c3.mN/DB5CG2E7GEz5JsezRkXn22uG0iNlqgqgqGj2l.9j2.Jj2S');

-- Doctor passwords
INSERT INTO doctors (full_name, specialty, email, password_hash) VALUES
('Dr. Alice Martin', 'Cardiologie', 'alice.martin@clinic.com', '$2a$10$9c3.mN/DB5CG2E7GEz5JsezRkXn22uG0iNlqgqgqGj2l.9j2.Jj2S'),
('Dr. Bernard Dubois', 'Pédiatrie', 'bernard.dubois@clinic.com', '$2a$10$9c3.mN/DB5CG2E7GEz5JsezRkXn22uG0iNlqgqgqGj2l.9j2.Jj2S'),
('Dr. Chloé Lambert', 'Dermatologie', 'chloe.lambert@clinic.com', '$2a$10$9c3.mN/DB5CG2E7GEz5JsezRkXn22uG0iNlqgqgqGj2l.9j2.Jj2S');

-- Clinic Staff passwords
INSERT INTO clinic_staff (full_name, email, password_hash) VALUES
('Admin Clinique', 'admin@clinic.com', '$2a$10$9c3.mN/DB5CG2E7GEz5JsezRkXn22uG0iNlqgqgqGj2l.9j2.Jj2S');

-- Sample appointments
INSERT INTO appointments (date_time, patient_id, doctor_id, status)
SELECT
    now() + '2 days'::interval,
    p.id,
    d.id,
    'Confirmé'
FROM patients p, doctors d WHERE p.email = 'jean.dupont@email.com' AND d.email = 'alice.martin@clinic.com';

INSERT INTO appointments (date_time, patient_id, doctor_id, status)
SELECT
    now() + '3 days'::interval,
    p.id,
    d.id,
    'En attente'
FROM patients p, doctors d WHERE p.email = 'marie.dubois@email.com' AND d.email = 'bernard.dubois@clinic.com';
