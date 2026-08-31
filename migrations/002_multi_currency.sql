
ALTER TABLE merchants ADD COLUMN settlement_currency TEXT NOT NULL DEFAULT 'TON';
ALTER TABLE merchants ADD COLUMN settlement_address TEXT;
UPDATE merchants SET settlement_address = ton_address;
ALTER TABLE merchants DROP COLUMN ton_address;

ALTER TABLE invoices ADD COLUMN dest_address TEXT;
