-- Extension pour utiliser UUID comme clés primaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table pour les Médecins
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table pour les Patients (sans date de naissance)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table pour les Rendez-vous
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_time TIMESTAMPTZ NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'Confirmé',
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Fonctions pour mettre à jour automatiquement `updated_at`
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour `updated_at` sur chaque table
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


-- Index pour améliorer les performances des requêtes courantes
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date_time ON appointments(date_time);

-- Insertion de données de test (optionnel, mais utile pour démarrer)
-- Médecins
INSERT INTO doctors (id, full_name, specialty, email, password_hash) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Dr. Alice Martin', 'Cardiologie', 'medecin@example.com', '$2a$10$NotRealHashForExample123...'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Dr. Bernard Dubois', 'Pédiatrie', 'doctor@example.com', '$2a$10$NotRealHashForExample456...'),
('c3d4e5f6-a7b8-9012-3456-7890abcdef12', 'Dr. Chloé Lambert', 'Dermatologie', 'chloe.lambert@example.com', '$2a$10$NotRealHashForExample789...');

-- Personnel (à créer si une table 'staff' est ajoutée)
-- INSERT INTO staff (email, password_hash, role) VALUES ('staff@example.com', '...', 'clinic_staff');

-- Patients
INSERT INTO patients (id, full_name, email, password_hash) VALUES
('3a5c1e8f-7b6d-4a9c-8e2f-1a3b5d7c9e0a', 'Patient Connecté', 'patient.connecte@example.com', '$2a$10$PatientHashForExample...');

