
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Status enum type for appointments
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
        CREATE TYPE appointment_status AS ENUM ('En attente', 'Confirmé', 'Annulé', 'Payée');
    END IF;
END$$;


-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clinic Staff Table
CREATE TABLE IF NOT EXISTS clinic_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TIMESTAMPTZ NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL, -- Keep history if patient is deleted
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,   -- Keep history if doctor is deleted
    status appointment_status DEFAULT 'En attente' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update the updated_at column automatically
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for tables to auto-update updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_doctors') THEN
        CREATE TRIGGER set_timestamp_doctors
        BEFORE UPDATE ON doctors
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_patients') THEN
        CREATE TRIGGER set_timestamp_patients
        BEFORE UPDATE ON patients
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp();
    END IF;
     IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_clinic_staff') THEN
        CREATE TRIGGER set_timestamp_clinic_staff
        BEFORE UPDATE ON clinic_staff
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_appointments') THEN
        CREATE TRIGGER set_timestamp_appointments
        BEFORE UPDATE ON appointments
        FOR EACH ROW
        EXECUTE PROCEDURE trigger_set_timestamp();
    END IF;
END;
$$;


-- Insert some dummy data for testing, avoiding conflicts
INSERT INTO doctors (id, full_name, specialty, email, password_hash) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Dr. Alice Martin', 'Cardiologie', 'alice.martin@clinic.com', '$2a$10$8.gL9.N8.L9.N8.gL9.N8.u/y/Y/g/L9.N8.gL9.N8.gL9'),
('b1c2d3e4-f5a6-7890-1234-567890abcdef', 'Dr. Bernard Dubois', 'Pédiatrie', 'bernard.dubois@clinic.com', '$2a$10$8.gL9.N8.L9.N8.gL9.N8.u/y/Y/g/L9.N8.gL9.N8.gL9'),
('c1d2e3f4-a5b6-7890-1234-567890abcdef', 'Dr. Chloé Lambert', 'Dermatologie', 'chloe.lambert@clinic.com', '$2a$10$8.gL9.N8.L9.N8.gL9.N8.u/y/Y/g/L9.N8.gL9.N8.gL9')
ON CONFLICT (email) DO NOTHING;

INSERT INTO patients (id, full_name, email, password_hash) VALUES
('3a5c1e8f-7b6d-4a9c-8e2f-1a3b5d7c9e0a', 'Jean Dupont', 'jean.dupont@email.com', '$2a$10$8.gL9.N8.L9.N8.gL9.N8.u/y/Y/g/L9.N8.gL9.N8.gL9'),
('b8f4c1e0-9a3d-4b7c-8e1f-2a5b7d9c1e3a', 'Laura Durand', 'laura.durand@email.com', '$2a$10$8.gL9.N8.L9.N8.gL9.N8.u/y/Y/g/L9.N8.gL9.N8.gL9'),
('17f69214-ac22-4424-b631-397d5a32f92d', 'Rajo', 'rajo@email.com', '$2a$10$8.gL9.N8.L9.N8.gL9.N8.u/y/Y/g/L9.N8.gL9.N8.gL9')
ON CONFLICT (email) DO NOTHING;

INSERT INTO clinic_staff (full_name, email, password_hash) VALUES
('Admin Clinique', 'admin@clinic.com', '$2a$10$8.gL9.N8.L9.N8.gL9.N8.u/y/Y/g/L9.N8.gL9.N8.gL9')
ON CONFLICT (email) DO NOTHING;
    