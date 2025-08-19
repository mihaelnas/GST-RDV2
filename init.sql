
-- Drop tables if they exist to ensure a clean slate on re-initialization
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS clinic_staff;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;

-- Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Doctors Table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Clinic Staff Table
CREATE TABLE clinic_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Appointments Table
-- ON DELETE SET NULL ensures that if a patient or doctor is deleted, the appointment record is kept
-- for historical purposes, but the link is severed.
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'En attente' NOT NULL -- e.g., 'En attente', 'Confirmé', 'Annulé', 'Payée'
);


-- Insert Sample Data

-- Patients (passwords are all 'password123' hashed)
-- password for all is: $2a$10$3Z.Y4g.O/9y.a.L7v.HnHe1H.Q3bZq1K2t6E.Yg.Z9s7z3.Z7eZ.e
INSERT INTO patients (full_name, email, password_hash) VALUES
('Jean Dupont', 'jean.dupont@example.com', '$2a$10$3Z.Y4g.O/9y.a.L7v.HnHe1H.Q3bZq1K2t6E.Yg.Z9s7z3.Z7eZ.e'),
('Marie Curie', 'marie.curie@example.com', '$2a$10$3Z.Y4g.O/9y.a.L7v.HnHe1H.Q3bZq1K2t6E.Yg.Z9s7z3.Z7eZ.e'),
('Pierre Martin', 'pierre.martin@example.com', '$2a$10$3Z.Y4g.O/9y.a.L7v.HnHe1H.Q3bZq1K2t6E.Yg.Z9s7z3.Z7eZ.e');

-- Doctors (passwords are all 'password123' hashed)
INSERT INTO doctors (full_name, specialty, email, password_hash) VALUES
('Alice Martin', 'Cardiologie', 'alice.martin@example.com', '$2a$10$3Z.Y4g.O/9y.a.L7v.HnHe1H.Q3bZq1K2t6E.Yg.Z9s7z3.Z7eZ.e'),
('Bernard Dubois', 'Dermatologie', 'bernard.dubois@example.com', '$2a$10$3Z.Y4g.O/9y.a.L7v.HnHe1H.Q3bZq1K2t6E.Yg.Z9s7z3.Z7eZ.e'),
('Chloé Lambert', 'Pédiatrie', 'chloe.lambert@example.com', '$2a$10$3Z.Y4g.O/9y.a.L7v.HnHe1H.Q3bZq1K2t6E.Yg.Z9s7z3.Z7eZ.e');

-- Clinic Staff (password is 'password123' hashed)
INSERT INTO clinic_staff (full_name, email, password_hash) VALUES
('Admin Sophie', 'sophie.admin@example.com', '$2a$10$3Z.Y4g.O/9y.a.L7v.HnHe1H.Q3bZq1K2t6E.Yg.Z9s7z3.Z7eZ.e');

-- Appointments
INSERT INTO appointments (date_time, patient_id, doctor_id, status) VALUES
-- Today's appointments
(NOW() + INTERVAL '2 hour', (SELECT id FROM patients WHERE email = 'jean.dupont@example.com'), (SELECT id FROM doctors WHERE email = 'alice.martin@example.com'), 'Confirmé'),
(NOW() + INTERVAL '4 hour', (SELECT id FROM patients WHERE email = 'marie.curie@example.com'), (SELECT id FROM doctors WHERE email = 'bernard.dubois@example.com'), 'En attente'),
-- Tomorrow's appointments
(NOW() + INTERVAL '1 day' + INTERVAL '3 hour', (SELECT id FROM patients WHERE email = 'pierre.martin@example.com'), (SELECT id FROM doctors WHERE email = 'alice.martin@example.com'), 'En attente'),
-- Past appointments
(NOW() - INTERVAL '3 day', (SELECT id FROM patients WHERE email = 'jean.dupont@example.com'), (SELECT id FROM doctors WHERE email = 'chloe.lambert@example.com'), 'Payée'),
(NOW() - INTERVAL '10 day', (SELECT id FROM patients WHERE email = 'marie.curie@example.com'), (SELECT id FROM doctors WHERE email = 'alice.martin@example.com'), 'Annulé');

