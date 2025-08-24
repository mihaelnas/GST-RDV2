-- Drop existing tables to ensure a clean slate.
-- The `IF EXISTS` clause prevents errors if the tables don't exist.
DROP TABLE IF EXISTS doctor_absences;
DROP TABLE IF EXISTS doctor_weekly_schedules;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS clinic_staff;


-- Table for clinic staff
CREATE TABLE clinic_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for doctors
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'En attente', -- e.g., 'En attente', 'Confirmé', 'Annulé', 'Payée'
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Doctor's weekly recurring schedule
CREATE TABLE doctor_weekly_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7), -- 1 for Monday, 7 for Sunday
    is_working_day BOOLEAN NOT NULL DEFAULT false,
    start_time TIME,
    end_time TIME,
    UNIQUE(doctor_id, day_of_week)
);

-- Table for Doctor's specific absences/days off
CREATE TABLE doctor_absences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    absence_date DATE NOT NULL,
    is_full_day BOOLEAN NOT NULL DEFAULT true,
    start_time TIME, -- For partial day absence
    end_time TIME,   -- For partial day absence
    reason VARCHAR(255)
);


-- Insert initial data
-- Password for all users is 'password', hashed with bcrypt.
-- Hash: $2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q
INSERT INTO clinic_staff (full_name, email, password_hash) VALUES
('Admin Clinique', 'staff@clinic.com', '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q');

INSERT INTO doctors (id, full_name, specialty, email, password_hash) VALUES
('52c3c9d1-0351-4ea6-970b-5ef0f212646c', 'Dr. Alice Martin', 'Cardiologie', 'alice.martin@clinic.com', '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q'),
('6ee53f10-f96a-4b53-b71b-c53f6fab3078', 'Dr. Bob Dupont', 'Pédiatrie', 'bob.dupont@clinic.com', '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q');

INSERT INTO patients (id, full_name, email, password_hash) VALUES
('4c64a6e2-199a-4af3-8f2a-60a050c251c5', 'Jean Patient', 'jean.patient@email.com', '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q'),
('2b13c8ff-b372-4a6d-8190-e03c4c701511', 'Marie Patiente', 'marie.patiente@email.com', '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q');

INSERT INTO appointments (date_time, patient_id, doctor_id, status, duration_minutes) VALUES
('2025-08-27 09:00:00+02', '4c64a6e2-199a-4af3-8f2a-60a050c251c5', '52c3c9d1-0351-4ea6-970b-5ef0f212646c', 'Confirmé', 30),
('2025-08-29 14:30:00+02', '2b13c8ff-b372-4a6d-8190-e03c4c701511', '6ee53f10-f96a-4b53-b71b-c53f6fab3078', 'En attente', 30);
