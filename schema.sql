-- Ce fichier contient le schéma complet de la base de données PostgreSQL pour le projet.
-- Vous pouvez l'exécuter sur une base de données PostgreSQL vide pour créer toutes les tables,
-- fonctions et triggers nécessaires au fonctionnement de l'application.

-- Extension pour utiliser UUID comme clés primaires (optionnel mais recommandé)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table pour les Médecins
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Stocker toujours les mots de passe hachés !
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table pour les Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    dob DATE NOT NULL, -- Date de naissance
    password_hash VARCHAR(255) NOT NULL, -- Stocker toujours les mots de passe hachés !
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table pour les Statuts des rendez-vous (pour standardiser)
CREATE TABLE appointment_statuses (
    status_name VARCHAR(50) PRIMARY KEY
);

-- Insérer les statuts de base
INSERT INTO appointment_statuses (status_name) VALUES
('Confirmé'),
('Annulé'),
('En attente'),
('Terminé');

-- Table pour les Rendez-vous
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_time TIMESTAMPTZ NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL REFERENCES appointment_statuses(status_name) DEFAULT 'Confirmé',
    duration_minutes INTEGER NOT NULL DEFAULT 30, -- Durée du rendez-vous en minutes
    notes TEXT, -- Notes pour le rendez-vous, par le patient ou le personnel
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table pour les Règles de Disponibilité Hebdomadaire des Médecins (Horaire Récurrent)
-- NOTE : Cette table n'est pas encore utilisée par la logique de l'application mais est prête pour une future implémentation.
CREATE TABLE doctor_weekly_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    -- 0 pour Dimanche, 1 pour Lundi, ..., 6 pour Samedi (convention de getDay() en JS)
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME, -- Heure de début (ex: '09:00:00')
    end_time TIME,   -- Heure de fin (ex: '17:00:00')
    is_working_day BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (doctor_id, day_of_week), -- Un médecin ne peut avoir qu'une règle par jour de la semaine
    CONSTRAINT check_times CHECK (
        (NOT is_working_day AND start_time IS NULL AND end_time IS NULL) OR
        (is_working_day AND start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
    )
);

-- Table pour les Absences/Disponibilités Exceptionnelles des Médecins
-- NOTE : Cette table n'est pas encore utilisée par la logique de l'application mais est prête pour une future implémentation.
CREATE TABLE doctor_absences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    absence_date DATE NOT NULL,
    is_full_day BOOLEAN NOT NULL DEFAULT TRUE,
    start_time TIME, -- Null si journée entière
    end_time TIME,   -- Null si journée entière
    reason TEXT,     -- Motif de l'absence (optionnel)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_absence_times CHECK (
        (is_full_day AND start_time IS NULL AND end_time IS NULL) OR
        (NOT is_full_day AND start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
    )
);

-- Fonction pour mettre à jour automatiquement `updated_at`
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

CREATE TRIGGER set_timestamp_doctor_weekly_schedules
BEFORE UPDATE ON doctor_weekly_schedules
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_doctor_absences
BEFORE UPDATE ON doctor_absences
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();


-- Index pour améliorer les performances des requêtes courantes
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date_time ON appointments(date_time);
CREATE INDEX idx_doctor_weekly_schedules_doctor_id ON doctor_weekly_schedules(doctor_id);
CREATE INDEX idx_doctor_absences_doctor_id_date ON doctor_absences(doctor_id, absence_date);
