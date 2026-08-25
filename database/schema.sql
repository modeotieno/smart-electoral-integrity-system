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
    party VARCHAR(100),
    position VARCHAR(100) NOT NULL,
    manifesto TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS polling_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    county VARCHAR(100),
    registered_voters INTEGER DEFAULT 0 CHECK (registered_voters >= 0),
    status VARCHAR(30) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    polling_station_id INTEGER NOT NULL REFERENCES polling_stations(id) ON DELETE CASCADE,
    votes INTEGER NOT NULL DEFAULT 0 CHECK (votes >= 0),
    submitted_by INTEGER REFERENCES users(id),
    verified BOOLEAN DEFAULT FALSE,
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(election_id, candidate_id, polling_station_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(150) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    polling_station_id INTEGER REFERENCES polling_stations(id),
    reported_by INTEGER REFERENCES users(id),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','dismissed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Biometric extension idempotent
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_type VARCHAR(30) DEFAULT 'none';
ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_enrolled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_enrolled_at TIMESTAMP;

-- Candidates enrichment
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS party VARCHAR(100);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS manifesto TEXT;

-- Polling stations enrichment
ALTER TABLE polling_stations ADD COLUMN IF NOT EXISTS county VARCHAR(100);
ALTER TABLE polling_stations ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'active';

-- Results enrichment
ALTER TABLE results ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES users(id);
ALTER TABLE results ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='results_votes_check') THEN
    ALTER TABLE results ADD CONSTRAINT results_votes_check CHECK (votes >= 0);
  END IF;
END $$;

-- Audit logs enrichment
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_candidates_election ON candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_results_election ON results(election_id);
CREATE INDEX IF NOT EXISTS idx_results_station ON results(polling_station_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status);

-- Seed demo elections / candidates (only if empty)
INSERT INTO elections (name, description, start_date, end_date, status)
SELECT 'General Election 2026', 'National demonstration election — showcases transparent, verifiable workflows', NOW(), NOW() + INTERVAL '30 days', 'active'
WHERE NOT EXISTS (SELECT 1 FROM elections);

INSERT INTO elections (name, description, start_date, end_date, status)
SELECT 'County Governors Election 2026', 'County-level demonstration election', NOW() + INTERVAL '60 days', NOW() + INTERVAL '90 days', 'planned'
WHERE NOT EXISTS (SELECT 1 FROM elections WHERE name='County Governors Election 2026');

INSERT INTO polling_stations (name, location, county, registered_voters, status)
SELECT 'Nairobi Central', 'Nairobi County', 'Nairobi', 450000, 'active' WHERE NOT EXISTS (SELECT 1 FROM polling_stations WHERE name='Nairobi Central');
INSERT INTO polling_stations (name, location, county, registered_voters, status)
SELECT 'Mombasa Coastal', 'Mombasa County', 'Mombasa', 320000, 'active' WHERE NOT EXISTS (SELECT 1 FROM polling_stations WHERE name='Mombasa Coastal');
INSERT INTO polling_stations (name, location, county, registered_voters, status)
SELECT 'Kisumu Lakeside', 'Kisumu County', 'Kisumu', 280000, 'active' WHERE NOT EXISTS (SELECT 1 FROM polling_stations WHERE name='Kisumu Lakeside');
INSERT INTO polling_stations (name, location, county, registered_voters, status)
SELECT 'Nakuru Rift', 'Nakuru County', 'Nakuru', 210000, 'active' WHERE NOT EXISTS (SELECT 1 FROM polling_stations WHERE name='Nakuru Rift');
INSERT INTO polling_stations (name, location, county, registered_voters, status)
SELECT 'Eldoret North', 'Uasin Gishu County', 'Uasin Gishu', 180000, 'active' WHERE NOT EXISTS (SELECT 1 FROM polling_stations WHERE name='Eldoret North');

-- Demo candidates
INSERT INTO candidates (election_id, full_name, party, position, manifesto)
SELECT (SELECT id FROM elections WHERE name='General Election 2026' LIMIT 1), 'Amina Otieno', 'Unity Party', 'President', 'Transparency, accountability and verifiable elections for all.' WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE full_name='Amina Otieno');
INSERT INTO candidates (election_id, full_name, party, position, manifesto)
SELECT (SELECT id FROM elections WHERE name='General Election 2026' LIMIT 1), 'James Mwangi', 'Progress Alliance', 'President', 'Secure, modern and citizen-centric electoral infrastructure.' WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE full_name='James Mwangi');
INSERT INTO candidates (election_id, full_name, party, position, manifesto)
SELECT (SELECT id FROM elections WHERE name='General Election 2026' LIMIT 1), 'Fatma Hassan', 'Green Future', 'President', 'Sustainable governance and electoral integrity.' WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE full_name='Fatma Hassan');
INSERT INTO candidates (election_id, full_name, party, position, manifesto)
SELECT (SELECT id FROM elections WHERE name='General Election 2026' LIMIT 1), 'Peter Ochieng', 'National Vision', 'President', 'Inclusive democracy and civic participation.' WHERE NOT EXISTS (SELECT 1 FROM candidates WHERE full_name='Peter Ochieng');

-- Demo results (only if no results yet)
INSERT INTO results (election_id, candidate_id, polling_station_id, votes, verified)
SELECT (SELECT id FROM elections WHERE name='General Election 2026' LIMIT 1),
       (SELECT id FROM candidates WHERE full_name='Amina Otieno' LIMIT 1),
       (SELECT id FROM polling_stations WHERE name='Nairobi Central' LIMIT 1), 182450, true
WHERE NOT EXISTS (SELECT 1 FROM results);
INSERT INTO results (election_id, candidate_id, polling_station_id, votes, verified)
SELECT (SELECT id FROM elections WHERE name='General Election 2026' LIMIT 1),
       (SELECT id FROM candidates WHERE full_name='James Mwangi' LIMIT 1),
       (SELECT id FROM polling_stations WHERE name='Nairobi Central' LIMIT 1), 165320, true
WHERE NOT EXISTS (SELECT 1 FROM results WHERE candidate_id=(SELECT id FROM candidates WHERE full_name='James Mwangi' LIMIT 1) AND polling_station_id=(SELECT id FROM polling_stations WHERE name='Nairobi Central' LIMIT 1));
