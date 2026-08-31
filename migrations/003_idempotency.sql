
ALTER TABLE invoices ADD COLUMN idempotency_key TEXT;
CREATE UNIQUE INDEX idx_invoices_idempotency_key ON invoices(idempotency_key) WHERE idempotency_key IS NOT NULL;
