-- Ce script initialise la base de données, supprime les anciennes tables et en crée de nouvelles.
-- Il insère également des données de démarrage pour les tests et la démonstration.

-- Supprimer les anciennes tables si elles existent pour garantir un démarrage propre
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS clinic_staff;

-- Activer l'extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Création de la table pour le personnel de la clinique
CREATE TABLE clinic_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table pour les médecins
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table pour les patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table pour les rendez-vous
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'En attente', -- Ex: 'En attente', 'Confirmé', 'Annulé', 'Payée'
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- --- Insertion des données de démarrage ---

-- Mot de passe unique pour tous les utilisateurs de test: "password"
-- Le hash bcrypt correspondant est: '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q'
-- Vous pouvez le générer avec: const hash = await bcrypt.hash('password', 10);
-- Note: les IDs sont générés aléatoirement par la base de données.

BEGIN;

DO $$
DECLARE
    staff_pass_hash VARCHAR := '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q';

    -- Déclaration des variables pour les médecins
    doctor_alice_id UUID;
    doctor_chloe_id UUID;
    doctor_name_alice VARCHAR := 'Dr. Alice Martin';
    doctor_specialty_alice VARCHAR := 'Cardiologie';
    doctor_email_alice VARCHAR := 'alice.martin@clinique.dev';

    doctor_name_chloe VARCHAR := 'Dr. Chloé Lambert';
    doctor_specialty_chloe VARCHAR := 'Pédiatrie';
    doctor_email_chloe VARCHAR := 'chloe.lambert@clinique.dev';
    
    -- Déclaration des variables pour les patients
    patient_marie_id UUID;
    patient_jean_id UUID;
    patient_name_marie VARCHAR := 'Marie Curie';
    patient_email_marie VARCHAR := 'marie.curie@email.dev';

    patient_name_jean VARCHAR := 'Jean Valjean';
    patient_email_jean VARCHAR := 'jean.valjean@email.dev';

BEGIN
    -- Insertion du personnel de la clinique
    INSERT INTO clinic_staff (full_name, email, password_hash) VALUES
    ('Admin Clinique', 'admin@clinique.dev', staff_pass_hash);

    -- Insertion des médecins et récupération de leurs IDs
    INSERT INTO doctors (full_name, specialty, email, password_hash) VALUES
    (doctor_name_alice, doctor_specialty_alice, doctor_email_alice, staff_pass_hash) RETURNING id INTO doctor_alice_id;

    INSERT INTO doctors (full_name, specialty, email, password_hash) VALUES
    (doctor_name_chloe, doctor_specialty_chloe, doctor_email_chloe, staff_pass_hash) RETURNING id INTO doctor_chloe_id;

    -- Insertion des patients et récupération de leurs IDs
    INSERT INTO patients (full_name, email, password_hash) VALUES
    (patient_name_marie, patient_email_marie, staff_pass_hash) RETURNING id INTO patient_marie_id;
    
    INSERT INTO patients (full_name, email, password_hash) VALUES
    (patient_name_jean, patient_email_jean, staff_pass_hash) RETURNING id INTO patient_jean_id;

    -- Insertion des rendez-vous en utilisant les IDs récupérés
    INSERT INTO appointments (doctor_id, patient_id, date_time, status, duration_minutes) VALUES
    (doctor_alice_id, patient_jean_id, NOW() + INTERVAL '7 days', 'Payée', 30),
    (doctor_alice_id, patient_jean_id, NOW() + INTERVAL '20 days', 'Confirmé', 30),
    (doctor_chloe_id, patient_marie_id, NOW() + INTERVAL '22 days', 'En attente', 30);
END $$;

COMMIT;

-- Afficher les tables pour vérifier (optionnel)
\echo 'Table clinic_staff:'
SELECT * FROM clinic_staff;
\echo 'Table doctors:'
SELECT * FROM doctors;
\echo 'Table patients:'
SELECT * FROM patients;
\echo 'Table appointments:'
SELECT * FROM appointments;
