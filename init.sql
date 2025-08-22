-- Drop existing tables in reverse order of creation to avoid foreign key constraints
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctor_absences;
DROP TABLE IF EXISTS doctor_weekly_schedules;
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
    role VARCHAR(50) NOT NULL DEFAULT 'clinic_staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Appointments Table
-- ON DELETE SET NULL: If a patient or doctor is deleted, their ID in the appointments table will be set to NULL,
-- preserving the appointment record without linking to a non-existent entity.
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'En attente', -- e.g., 'En attente', 'Confirmé', 'Annulé', 'Payée'
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Doctor Weekly Schedules Table
-- Stores the recurring weekly availability for each doctor.
-- day_of_week: 1 for Monday, 7 for Sunday, following ISO 8601 standard.
CREATE TABLE doctor_weekly_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
    is_working_day BOOLEAN NOT NULL DEFAULT false,
    start_time TIME,
    end_time TIME,
    UNIQUE(doctor_id, day_of_week) -- Ensures only one schedule entry per doctor per day
);

-- Create Doctor Absences Table
-- Stores specific dates or times when a doctor is not available, overriding the weekly schedule.
CREATE TABLE doctor_absences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    absence_date DATE NOT NULL,
    is_full_day BOOLEAN NOT NULL DEFAULT true,
    start_time TIME,
    end_time TIME,
    reason TEXT
);


-- Hashed password for 'password' -> $2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q
-- Insert Sample Data
INSERT INTO clinic_staff (full_name, email, password_hash) VALUES
('Admin Clinique', 'admin@clinique.com', '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q');

INSERT INTO doctors (full_name, specialty, email, password_hash) VALUES
('Dr. Alice Martin', 'Cardiologie', 'alice.martin@clinique.com', '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q'),
('Dr. Bob Dupont', 'Pédiatrie', 'bob.dupont@clinique.com', '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q');

INSERT INTO patients (full_name, email, password_hash) VALUES
('Jean Patient', 'jean.patient@email.com', '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q'),
('Marie Patiente', 'marie.patiente@email.com', '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q');

-- Insert default weekly schedules for doctors
DO $$
DECLARE
    alice_id UUID;
    bob_id UUID;
BEGIN
    SELECT id INTO alice_id FROM doctors WHERE email = 'alice.martin@clinique.com';
    SELECT id INTO bob_id FROM doctors WHERE email = 'bob.dupont@clinique.com';

    -- Dr. Alice Martin's Schedule
    INSERT INTO doctor_weekly_schedules (doctor_id, day_of_week, is_working_day, start_time, end_time) VALUES
    (alice_id, 1, true, '09:00', '17:00'), -- Monday
    (alice_id, 2, true, '09:00', '17:00'), -- Tuesday
    (alice_id, 3, false, NULL, NULL),     -- Wednesday
    (alice_id, 4, true, '10:00', '18:00'), -- Thursday
    (alice_id, 5, true, '09:00', '13:00'), -- Friday
    (alice_id, 6, false, NULL, NULL),     -- Saturday
    (alice_id, 7, false, NULL, NULL);     -- Sunday

    -- Dr. Bob Dupont's Schedule
    INSERT INTO doctor_weekly_schedules (doctor_id, day_of_week, is_working_day, start_time, end_time) VALUES
    (bob_id, 1, true, '08:30', '16:30'), -- Monday
    (bob_id, 2, true, '08:30', '16:30'), -- Tuesday
    (bob_id, 3, true, '08:30', '12:30'), -- Wednesday
    (bob_id, 4, true, '08:30', '16:30'), -- Thursday
    (bob_id, 5, false, NULL, NULL),     -- Friday
    (bob_id, 6, false, NULL, NULL),     -- Saturday
    (bob_id, 7, false, NULL, NULL);     -- Sunday
END $$;


-- Insert sample appointments
DO $$
DECLARE
    alice_id UUID;
    bob_id UUID;
    jean_id UUID;
    marie_id UUID;
BEGIN
    SELECT id INTO alice_id FROM doctors WHERE email = 'alice.martin@clinique.com';
    SELECT id INTO bob_id FROM doctors WHERE email = 'bob.dupont@clinique.com';
    SELECT id INTO jean_id FROM patients WHERE email = 'jean.patient@email.com';
    SELECT id INTO marie_id FROM patients WHERE email = 'marie.patiente@email.com';

    INSERT INTO appointments (date_time, patient_id, doctor_id, status) VALUES
    (NOW() + INTERVAL '3 day', jean_id, alice_id, 'Confirmé'),
    (NOW() + INTERVAL '5 day', marie_id, bob_id, 'En attente');
END $$;
