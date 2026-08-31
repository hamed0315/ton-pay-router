
ALTER TABLE merchants ADD COLUMN email TEXT;
ALTER TABLE merchants ADD COLUMN password_hash TEXT;
ALTER TABLE merchants ADD COLUMN google_id TEXT;
ALTER TABLE merchants ADD COLUMN qr_session TEXT;
ALTER TABLE merchants ADD COLUMN qr_expires_at TIMESTAMPTZ;
ALTER TABLE merchants ADD COLUMN role TEXT NOT NULL DEFAULT 'merchant';
CREATE UNIQUE INDEX idx_merchants_email ON merchants(email) WHERE email IS NOT NULL;
