-- Ce script est conçu pour être exécuté sur une base de données PostgreSQL.
-- Il crée les tables nécessaires pour l'application de clinique et insère des données d'exemple.
--
-- Pour exécuter ce script :
-- 1. Assurez-vous que PostgreSQL est installé et en cours d'exécution.
-- 2. Créez un utilisateur et une base de données, par exemple via psql :
--    CREATE USER clinic_user WITH PASSWORD 'clinic_password';
--    CREATE DATABASE clinic_db OWNER clinic_user;
-- 3. Connectez-vous à votre base de données et exécutez ce script, par exemple :
--    psql -U clinic_user -d clinic_db -f init.sql

-- Active l'extension pour générer des UUIDs si elle n'est pas déjà activée.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Supprime les anciennes tables si elles existent pour garantir un démarrage propre.
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS clinic_staff;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;

-- Table des Médecins
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Table des Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Table du Personnel de la Clinique
CREATE TABLE clinic_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Table des Rendez-vous
-- ON DELETE SET NULL : Si un médecin ou un patient est supprimé,
-- la référence dans le rendez-vous devient NULL, préservant ainsi l'historique des rendez-vous.
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'En attente'
);

-- Insertion des données d'exemple

-- Note sur les mots de passe :
-- Tous les utilisateurs (médecins, patients, personnel) partagent le même mot de passe
-- pour la simplicité de la démonstration : "password123".
-- Le hash a été généré avec bcrypt (cost factor 10).
-- Hash: '$2a$10$w4B.g5hY2L9igVTTCEQkReNnSfxoqkMHYXwTPA9m9KDCcw2aSkwD.'

-- Insertion des médecins
INSERT INTO doctors (id, full_name, specialty, email, password_hash) VALUES
('5915446d-9c3f-4d43-9a4c-530999581f14', 'Dr. Alice Martin', 'Cardiologie', 'alice.martin@clinic.com', '$2a$10$w4B.g5hY2L9igVTTCEQkReNnSfxoqkMHYXwTPA9m9KDCcw2aSkwD.'),
('ef1d8e6a-7f6c-4b59-9b43-69016913e2e8', 'Dr. Bernard Dubois', 'Pédiatrie', 'bernard.dubois@clinic.com', '$2a$10$w4B.g5hY2L9igVTTCEQkReNnSfxoqkMHYXwTPA9m9KDCcw2aSkwD.'),
('c85e28a9-4089-41a3-8f7d-249e1a8e1e33', 'Dr. Chloé Lambert', 'Dermatologie', 'chloe.lambert@clinic.com', '$2a$10$w4B.g5hY2L9igVTTCEQkReNnSfxoqkMHYXwTPA9m9KDCcw2aSkwD.');

-- Insertion des patients
INSERT INTO patients (id, full_name, email, password_hash) VALUES
('b238a1a3-6e3e-4e48-9f37-14e3e3e3e3e3', 'Jean Valjean', 'jean.valjean@example.com', '$2a$10$w4B.g5hY2L9igVTTCEQkReNnSfxoqkMHYXwTPA9m9KDCcw2aSkwD.'),
('a123b456-c789-d012-e345-f67890123456', 'Marie Curie', 'marie.curie@example.com', '$2a$10$w4B.g5hY2L9igVTTCEQkReNnSfxoqkMHYXwTPA9m9KDCcw2aSkwD.');

-- Insertion du personnel de la clinique
INSERT INTO clinic_staff (id, full_name, email, password_hash) VALUES
('d47a6157-ba79-4509-b655-e7f0b8e61280', 'Admin Clinique', 'admin@clinic.com', '$2a$10$w4B.g5hY2L9igVTTCEQkReNnSfxoqkMHYXwTPA9m9KDCcw2aSkwD.');

-- Insertion des rendez-vous
-- Les dates sont définies pour être dans le futur pour les tests.
INSERT INTO appointments (date_time, patient_id, doctor_id, status) VALUES
(NOW() + INTERVAL '3 day', 'b238a1a3-6e3e-4e48-9f37-14e3e3e3e3e3', '5915446d-9c3f-4d43-9a4c-530999581f14', 'Confirmé'),
(NOW() + INTERVAL '5 day', 'a123b456-c789-d012-e345-f67890123456', 'c85e28a9-4089-41a3-8f7d-249e1a8e1e33', 'En attente'),
(NOW() - INTERVAL '10 day', 'b238a1a3-6e3e-4e48-9f37-14e3e3e3e3e3', '5915446d-9c3f-4d43-9a4c-530999581f14', 'Payée');

-- Affiche un message de succès
\echo "Toutes les tables ont été créées et les données d'exemple ont été insérées avec succès."
