
ALTER TABLE merchants ADD COLUMN telegram_user_id TEXT;
CREATE UNIQUE INDEX idx_merchants_telegram_user_id ON merchants(telegram_user_id) WHERE telegram_user_id IS NOT NULL;
