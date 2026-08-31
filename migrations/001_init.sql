
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    api_key_hash TEXT NOT NULL UNIQUE,
    webhook_url TEXT,
    webhook_secret TEXT,
    ton_address TEXT NOT NULL,
    risk_level TEXT NOT NULL DEFAULT 'low',
    spread_override NUMERIC(5,2),
    allowed_networks TEXT[],
    settlement_policy TEXT NOT NULL DEFAULT 'immediate',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    amount NUMERIC(30,10) NOT NULL,
    source_currency TEXT NOT NULL,
    dest_currency TEXT NOT NULL,
    dest_amount NUMERIC(30,10) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    callback_url TEXT,
    quote_snapshot JSONB,
    metadata JSONB,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    tx_hash_src TEXT,
    tx_hash_dst TEXT,
    amount_src NUMERIC(30,10) NOT NULL,
    amount_dst NUMERIC(30,10) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    provider TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    tx_hash_src TEXT NOT NULL,
    tx_hash_dst TEXT NOT NULL,
    amount_src NUMERIC(30,10) NOT NULL,
    amount_dst NUMERIC(30,10) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    confirmations INTEGER NOT NULL DEFAULT 0,
    gas_used NUMERIC(30,10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    amount NUMERIC(30,10) NOT NULL,
    currency TEXT NOT NULL,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    account_type TEXT NOT NULL,
    debit NUMERIC(30,10) NOT NULL DEFAULT 0,
    credit NUMERIC(30,10) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    provider TEXT NOT NULL,
    quote_id TEXT NOT NULL,
    raw_rate NUMERIC(30,10) NOT NULL,
    applied_spread NUMERIC(5,2) NOT NULL,
    final_rate NUMERIC(30,10) NOT NULL,
    best_route TEXT,
    price_impact NUMERIC(5,2),
    valid_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_merchant_id ON invoices(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_ledger_invoice_id ON ledger_entries(invoice_id);
