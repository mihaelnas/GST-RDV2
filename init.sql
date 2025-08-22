-- Ce script initialise la base de données pour la clinique.
-- Il supprime les anciennes tables si elles existent et les recrée avec des données de départ.

-- Supprimer les tables existantes dans le bon ordre pour éviter les erreurs de contrainte de clé étrangère.
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS clinic_staff;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;

-- Création de la table des Médecins
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table du Personnel de la Clinique
CREATE TABLE clinic_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'clinic_staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des Rendez-vous
-- ON DELETE SET NULL: si un patient ou un médecin est supprimé, le rendez-vous est conservé mais la référence est supprimée.
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'En attente', -- Ex: 'En attente', 'Confirmé', 'Annulé', 'Payée'
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des données initiales

-- Mot de passe pour tous les utilisateurs : "password"
-- Hash (bcrypt, coût 10): $2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q

-- Insertion du personnel de la clinique
INSERT INTO clinic_staff (id, full_name, email, password_hash) VALUES
('00000000-0000-0000-0000-000000000001', 'Admin Clinique', 'staff@clinic.com', '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q');

-- Insertion des médecins
INSERT INTO doctors (id, full_name, specialty, email, password_hash) VALUES
('c85e28a9-4089-41a3-8f7d-249e1a8e1e33', 'Dr. Chloé Lambert', 'Cardiologie', 'chloe.lambert@clinic.com', '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q'),
('5915446d-9c3f-4d43-9a4c-530999581f14', 'Dr. Alice Martin', 'Dermatologie', 'alice.martin@clinic.com', '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q');

-- Insertion des patients
INSERT INTO patients (id, full_name, email, password_hash) VALUES
('a123b456-c789-d012-e345-f67890123456', 'Marie Curie', 'marie.curie@email.com', '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q'),
('b238a1a3-6e3e-4e48-9f37-14e3e3e3e3e3', 'Jean Valjean', 'jean.valjean@email.com', '$2a$10$3g0.iY33Tz6a.V5F/D0bUO7N6sJAPtM2/jZJghIuCElUWzdoYzz.q');

-- Insertion des rendez-vous
-- Assurez-vous que les UUIDs correspondent à ceux des médecins et patients ci-dessus.
INSERT INTO appointments (date_time, patient_id, doctor_id, status, duration_minutes) VALUES
-- Rendez-vous Passé et Payé
(NOW() - INTERVAL '3 day', 'b238a1a3-6e3e-4e48-9f37-14e3e3e3e3e3', '5915446d-9c3f-4d43-9a4c-530999581f14', 'Payée', 30),
-- Rendez-vous à venir Confirmé
(NOW() + INTERVAL '2 day', 'b238a1a3-6e3e-4e48-9f37-14e3e3e3e3e3', '5915446d-9c3f-4d43-9a4c-530999581f14', 'Confirmé', 30),
-- Rendez-vous à venir En attente
(NOW() + INTERVAL '4 day', 'a123b456-c789-d012-e345-f67890123456', 'c85e28a9-4089-41a3-8f7d-249e1a8e1e33', 'En attente', 30);
