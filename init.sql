-- Drop tables if they exist to ensure a clean slate.
-- The order is important due to foreign key constraints.
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS clinic_staff;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;

-- Create Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Doctors Table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Clinic Staff Table
CREATE TABLE clinic_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'clinic_staff', -- e.g., 'admin', 'receptionist'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'En attente', -- e.g., 'En attente', 'Confirmé', 'Annulé', 'Payée'
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Seed Data

-- Patients (passwords are 'password123' hashed)
INSERT INTO patients (id, full_name, email, password_hash) VALUES
('a123b456-c789-d012-e345-f67890123456', 'Marie Curie', 'marie.curie@example.com', '$2a$10$w4B.g2YDBY.5rA.VpZzUe.CzQZG.a.1D.2F/w.p4g7I.g3R8E5pG.'),
('b238a1a3-6e3e-4e48-9f37-14e3e3e3e3e3', 'Jean Valjean', 'jean.valjean@example.com', '$2a$10$w4B.g2YDBY.5rA.VpZzUe.CzQZG.a.1D.2F/w.p4g7I.g3R8E5pG.');

-- Doctors (passwords are 'password123' hashed)
INSERT INTO doctors (id, full_name, specialty, email, password_hash) VALUES
('c85e28a9-4089-41a3-8f7d-249e1a8e1e33', 'Dr. Chloé Lambert', 'Cardiologie', 'chloe.lambert@clinique.fr', '$2a$10$w4B.g2YDBY.5rA.VpZzUe.CzQZG.a.1D.2F/w.p4g7I.g3R8E5pG.'),
('5915446d-9c3f-4d43-9a4c-530999581f14', 'Dr. Alice Martin', 'Pédiatrie', 'alice.martin@clinique.fr', '$2a$10$w4B.g2YDBY.5rA.VpZzUe.CzQZG.a.1D.2F/w.p4g7I.g3R8E5pG.');

-- Clinic Staff (password is 'password123' hashed)
INSERT INTO clinic_staff (id, full_name, email, password_hash, role) VALUES
('d456e789-f012-g345-h678-i90123456789', 'Sophie Bernard', 'sophie.bernard@clinique.fr', '$2a$10$w4B.g2YDBY.5rA.VpZzUe.CzQZG.a.1D.2F/w.p4g7I.g3R8E5pG.', 'clinic_staff');

-- Appointments
INSERT INTO appointments (date_time, patient_id, doctor_id, status, duration_minutes) VALUES
(NOW() + INTERVAL '1 day', (SELECT id from patients where email = 'marie.curie@example.com'), (SELECT id from doctors where email = 'chloe.lambert@clinique.fr'), 'Confirmé', 30),
(NOW() + INTERVAL '2 days', (SELECT id from patients where email = 'jean.valjean@example.com'), (SELECT id from doctors where email = 'alice.martin@clinique.fr'), 'En attente', 45);
