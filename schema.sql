-- PostgreSQL schema for Clinique Rendez-Vous

-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- Create Patients Table
-- Patients can register themselves.
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Doctors Table
-- Doctors are added by clinic staff.
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Appointments Table
-- This table links patients and doctors for a specific time slot.
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_time TIMESTAMPTZ NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'En attente', -- e.g., 'En attente', 'Confirmé', 'Annulé', 'Payée'
    duration_minutes INT NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(doctor_id, date_time) -- A doctor can't have two appointments at the same time
);


-- Indexes for performance
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date_time ON appointments(date_time);

-- Insert sample data
-- Passwords for all users are 'password123'

-- Patients
-- Password for jean.dupont@example.com: password123
INSERT INTO patients (id, full_name, email, password_hash) VALUES
('3a5c1e8f-7b6d-4a9c-8e2f-1a3b5d7c9e0a', 'Jean Dupont', 'jean.dupont@example.com', '$2a$10$w4B.p2.mAnJ8i9xM7oJZ..MhNq0JvVUT5xBYxM6aN0CfeALHns/8G'),
-- Password for laura.durand@example.com: password123
('b8f4c1e0-9a3d-4b7c-8e1f-2a5b7d9c1e3a', 'Laura Durand', 'laura.durand@example.com', '$2a$10$w4B.p2.mAnJ8i9xM7oJZ..MhNq0JvVUT5xBYxM6aN0CfeALHns/8G');


-- Doctors
-- Password for alice.martin@clinique.fr: password123
INSERT INTO doctors (id, full_name, specialty, email, password_hash) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Dr. Alice Martin', 'Cardiologie', 'alice.martin@clinique.fr', '$2a$10$w4B.p2.mAnJ8i9xM7oJZ..MhNq0JvVUT5xBYxM6aN0CfeALHns/8G'),
-- Password for bernard.dubois@clinique.fr: password123
('b1c2d3e4-f5a6-7890-1234-567890abcdef', 'Dr. Bernard Dubois', 'Pédiatrie', 'bernard.dubois@clinique.fr', '$2a$10$w4B.p2.mAnJ8i9xM7oJZ..MhNq0JvVUT5xBYxM6aN0CfeALHns/8G'),
-- Password for chloe.lambert@clinique.fr: password123
('c1d2e3f4-a5b6-7890-1234-567890abcdef', 'Dr. Chloé Lambert', 'Dermatologie', 'chloe.lambert@clinique.fr', '$2a$10$w4B.p2.mAnJ8i9xM7oJZ..MhNq0JvVUT5xBYxM6aN0CfeALHns/8G');

-- Clinic Staff (using a doctor's account with a specific email pattern for role detection)
-- Password for staff.personnel@clinique.fr: password123
INSERT INTO doctors (id, full_name, specialty, email, password_hash) VALUES
('d1e2f3a4-b5c6-7890-1234-567890abcdef', 'Personnel Clinique', 'Administration', 'staff.personnel@clinique.fr', '$2a$10$w4B.p2.mAnJ8i9xM7oJZ..MhNq0JvVUT5xBYxM6aN0CfeALHns/8G');


-- Sample Appointments
-- Note: Adjust date_time to be in the future relative to when you run this script for testing.
-- The example dates are set for a specific date for consistency.
INSERT INTO appointments (date_time, patient_id, doctor_id, status) VALUES
-- Past appointment
(NOW() - INTERVAL '3 day', '3a5c1e8f-7b6d-4a9c-8e2f-1a3b5d7c9e0a', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Payée'),
-- Future appointments for testing
(CAST(CURRENT_DATE AS timestamptz) + interval '1 day' + '10:00:00', '3a5c1e8f-7b6d-4a9c-8e2f-1a3b5d7c9e0a', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Confirmé'),
(CAST(CURRENT_DATE AS timestamptz) + interval '2 day' + '14:30:00', 'b8f4c1e0-9a3d-4b7c-8e1f-2a5b7d9c1e3a', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'En attente'),
(CAST(CURRENT_DATE AS timestamptz) + interval '2 day' + '11:00:00', 'b8f4c1e0-9a3d-4b7c-8e1f-2a5b7d9c1e3a', 'b1c2d3e4-f5a6-7890-1234-567890abcdef', 'Confirmé');

-- Function to automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update 'updated_at' on row modification
CREATE TRIGGER set_patients_timestamp
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_doctors_timestamp
BEFORE UPDATE ON doctors
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_appointments_timestamp
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Grant privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;


-- End of schema
