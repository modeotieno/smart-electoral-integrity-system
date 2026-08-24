CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    biometric_type VARCHAR(30) DEFAULT 'none',
    biometric_hash TEXT,
    biometric_enrolled BOOLEAN DEFAULT FALSE,
    biometric_enrolled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS elections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    position VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS polling_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    registered_voters INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    polling_station_id INTEGER NOT NULL REFERENCES polling_stations(id) ON DELETE CASCADE,
    votes INTEGER NOT NULL DEFAULT 0,
    submitted_by INTEGER REFERENCES users(id),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Biometric extension idempotent
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_type VARCHAR(30) DEFAULT 'none';
ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_enrolled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_enrolled_at TIMESTAMP;

-- Seed demo elections / candidates (only if empty)
INSERT INTO elections (name, description, start_date, end_date, status)
SELECT 'General Election 2026', 'National demonstration election', NOW(), NOW() + INTERVAL '30 days', 'active'
WHERE NOT EXISTS (SELECT 1 FROM elections);

INSERT INTO polling_stations (name, location, registered_voters)
SELECT 'Nairobi Central', 'Nairobi County', 450000 WHERE NOT EXISTS (SELECT 1 FROM polling_stations WHERE name='Nairobi Central');
INSERT INTO polling_stations (name, location, registered_voters)
SELECT 'Mombasa Coastal', 'Mombasa County', 320000 WHERE NOT EXISTS (SELECT 1 FROM polling_stations WHERE name='Mombasa Coastal');
INSERT INTO polling_stations (name, location, registered_voters)
SELECT 'Kisumu Lakeside', 'Kisumu County', 280000 WHERE NOT EXISTS (SELECT 1 FROM polling_stations WHERE name='Kisumu Lakeside');

-- Demo candidates
INSERT INTO candidates (election_id, full_name, position)
SELECT (SELECT id FROM elections LIMIT 1), 'Amina Otieno', 'President' WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE full_name='Amina Otieno');
INSERT INTO candidates (election_id, full_name, position)
SELECT (SELECT id FROM elections LIMIT 1), 'James Mwangi', 'President' WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE full_name='James Mwangi');
