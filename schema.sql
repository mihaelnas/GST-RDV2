-- Clinique Rendez-Vous Database Schema for PostgreSQL

-- It's a good practice to wrap schema creation in a transaction
BEGIN;

-- Extension for using UUID as primary keys (optional but recommended)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for Doctors
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Always store hashed passwords!
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    dob DATE NOT NULL, -- Date of Birth
    password_hash VARCHAR(255) NOT NULL, -- Always store hashed passwords!
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for Appointment Statuses (optional, for standardization)
CREATE TABLE appointment_statuses (
    status_name VARCHAR(50) PRIMARY KEY
);

-- Pre-populate statuses
INSERT INTO appointment_statuses (status_name) VALUES
('Confirmé'),
('Annulé par patient'),
('Annulé par clinique'),
('En attente'),
('Terminé');

-- Table for Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_time TIMESTAMPTZ NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL REFERENCES appointment_statuses(status_name) DEFAULT 'En attente',
    duration_minutes INTEGER NOT NULL DEFAULT 30, -- Appointment duration in minutes
    notes TEXT, -- Notes for the appointment, by patient or staff
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for Doctor's Weekly Recurring Availability Rules
CREATE TABLE doctor_weekly_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    -- 0 for Sunday, 1 for Monday, ..., 6 for Saturday (JS getDay() convention)
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME, -- Start time (e.g., '09:00:00')
    end_time TIME,   -- End time (e.g., '17:00:00')
    is_working_day BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (doctor_id, day_of_week), -- A doctor can only have one rule per day of the week
    CONSTRAINT check_times CHECK (
        (NOT is_working_day AND start_time IS NULL AND end_time IS NULL) OR
        (is_working_day AND start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
    )
);

-- Table for Doctor's Absences/Exceptional Availabilities
CREATE TABLE doctor_absences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    absence_date DATE NOT NULL,
    is_full_day BOOLEAN NOT NULL DEFAULT TRUE,
    start_time TIME, -- Null if full day
    end_time TIME,   -- Null if full day
    reason TEXT,     -- Reason for absence (optional)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_absence_times CHECK (
        (is_full_day AND start_time IS NULL AND end_time IS NULL) OR
        (NOT is_full_day AND start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
    )
);

-- Function to automatically update `updated_at` timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update `updated_at` on each table
CREATE TRIGGER set_timestamp_doctors
BEFORE UPDATE ON doctors
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_patients
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_appointments
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_doctor_weekly_schedules
BEFORE UPDATE ON doctor_weekly_schedules
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_doctor_absences
BEFORE UPDATE ON doctor_absences
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Indexes to improve performance of common queries
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date_time ON appointments(date_time);
CREATE INDEX idx_doctor_weekly_schedules_doctor_id ON doctor_weekly_schedules(doctor_id);
CREATE INDEX idx_doctor_absences_doctor_id_date ON doctor_absences(doctor_id, absence_date);


-- Add some sample data for testing purposes

-- Doctors
-- Note: In a real app, password hashes would be generated by a library like bcrypt
INSERT INTO doctors (full_name, specialty, email, password_hash) VALUES
('Dr. Alice Martin', 'Cardiologie', 'alice.martin@example.com', '$2b$10$fakedoctorhash1...'),
('Dr. Bernard Dubois', 'Pédiatrie', 'bernard.dubois@example.com', '$2b$10$fakedoctorhash2...'),
('Dr. Chloé Lambert', 'Dermatologie', 'chloe.lambert@example.com', '$2b$10$fakedoctorhash3...');

-- Patients
INSERT INTO patients (full_name, email, dob, password_hash) VALUES
('Laura Durand', 'laura.durand@example.com', '1990-06-15', '$2b$10$fakepatienthash1...'),
('Paul Lefevre', 'paul.lefevre@example.com', '1985-09-22', '$2b$10$fakepatienthash2...'),
('Sophie Petit', 'sophie.petit@example.com', '2001-02-10', '$2b$10$fakepatienthash3...');


COMMIT;
