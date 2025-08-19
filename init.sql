-- This script is executed once when the database container is first created.
-- It sets up the necessary tables and populates them with some initial data.

CREATE TABLE clinic_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    patient_id UUID,
    doctor_id UUID,
    status VARCHAR(50) DEFAULT 'En attente',
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

-- Note: Passwords are encrypted using bcrypt. Below are the plain-text versions for reference.
-- clinic_staff, doctor, patient passwords are all: "password123"

-- Initial Data
INSERT INTO clinic_staff (id, full_name, email, password_hash) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin Person', 'admin@clinic.com', '$2a$10$wGrw3w9aY/gGvjFnL2SMieKMybA2w2UgoLgY9v5bolyXvjPxtw4.C');

INSERT INTO doctors (id, full_name, specialty, email, password_hash) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Dr. Alice Martin', 'Cardiologie', 'alice.martin@clinic.com', '$2a$10$wGrw3w9aY/gGvjFnL2SMieKMybA2w2UgoLgY9v5bolyXvjPxtw4.C'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Dr. Bernard Dubois', 'Neurologie', 'bernard.dubois@clinic.com', '$2a$10$wGrw3w9aY/gGvjFnL2SMieKMybA2w2UgoLgY9v5bolyXvjPxtw4.C'),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Dr. Chloé Lambert', 'Pédiatrie', 'chloe.lambert@clinic.com', '$2a$10$wGrw3w9aY/gGvjFnL2SMieKMybA2w2UgoLgY9v5bolyXvjPxtw4.C');

INSERT INTO patients (id, full_name, email, password_hash) VALUES
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Yannick Noah', 'yannick.noah@example.com', '$2a$10$wGrw3w9aY/gGvjFnL2SMieKMybA2w2UgoLgY9v5bolyXvjPxtw4.C'),
('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Zinedine Zidane', 'zinedine.zidane@example.com', '$2a$10$wGrw3w9aY/gGvjFnL2SMieKMybA2w2UgoLgY9v5bolyXvjPxtw4.C');

-- Sample appointments
INSERT INTO appointments (date_time, patient_id, doctor_id, status) VALUES
(NOW() + INTERVAL '1 day', (SELECT id FROM patients WHERE email = 'yannick.noah@example.com'), (SELECT id FROM doctors WHERE email = 'alice.martin@clinic.com'), 'Confirmé'),
(NOW() + INTERVAL '2 day', (SELECT id FROM patients WHERE email = 'zinedine.zidane@example.com'), (SELECT id FROM doctors WHERE email = 'bernard.dubois@clinic.com'), 'En attente'),
(NOW() - INTERVAL '3 day', (SELECT id FROM patients WHERE email = 'yannick.noah@example.com'), (SELECT id FROM doctors WHERE email = 'alice.martin@clinic.com'), 'Payée');
