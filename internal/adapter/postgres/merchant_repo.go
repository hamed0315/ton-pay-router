
package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/ton-pay-router/core/internal/domain/merchant"
	"github.com/ton-pay-router/core/internal/port"
)

type MerchantRepository struct {
	pool *pgxpool.Pool
}

func NewMerchantRepository(pool *pgxpool.Pool) port.MerchantRepository {
	return &MerchantRepository{pool: pool}
}

func (r *MerchantRepository) Create(ctx context.Context, m *merchant.Merchant) error {
	query := `
		INSERT INTO merchants (id, name, api_key_hash, webhook_url, webhook_secret, settlement_address, settlement_currency, telegram_user_id, email, password_hash, google_id, qr_session, qr_expires_at, role, risk_level, spread_override, fee_percent, allowed_networks, settlement_policy, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NULLIF($8, ''), $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
	`
	_, err := r.pool.Exec(ctx, query,
		m.ID, m.Name, m.APIKeyHash, m.WebhookURL, m.WebhookSecret, m.SettlementAddress, m.SettlementCurrency, m.TelegramUserID, m.Email, m.PasswordHash, m.GoogleID, m.QRSession, m.QRExpiresAt, m.Role, m.RiskLevel,
		m.SpreadOverride, m.FeePercent, m.AllowedNetworks, m.SettlementPolicy, m.IsActive, m.CreatedAt, m.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("insert merchant: %w", err)
	}
	return nil
}

func scanMerchant(row pgx.Row) (*merchant.Merchant, error) {
	var m merchant.Merchant
	err := row.Scan(
		&m.ID, &m.Name, &m.APIKeyHash, &m.WebhookURL, &m.WebhookSecret, &m.SettlementAddress, &m.SettlementCurrency, &m.TelegramUserID, &m.Email, &m.PasswordHash, &m.GoogleID, &m.QRSession, &m.QRExpiresAt, &m.Role, &m.RiskLevel,
		&m.SpreadOverride, &m.FeePercent, &m.AllowedNetworks, &m.SettlementPolicy, &m.IsActive, &m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("merchant not found")
		}
		return nil, err
	}
	return &m, nil
}

func (r *MerchantRepository) GetByID(ctx context.Context, id string) (*merchant.Merchant, error) {
	query := `
		SELECT id, name, api_key_hash, webhook_url, webhook_secret, settlement_address, settlement_currency, telegram_user_id, email, password_hash, google_id, qr_session, qr_expires_at, role, risk_level, spread_override, fee_percent, allowed_networks, settlement_policy, is_active, created_at, updated_at
		FROM merchants WHERE id = $1
	`
	row := r.pool.QueryRow(ctx, query, id)
	return scanMerchant(row)
}

func (r *MerchantRepository) GetByAPIKeyHash(ctx context.Context, hash string) (*merchant.Merchant, error) {
	query := `
		SELECT id, name, api_key_hash, webhook_url, webhook_secret, settlement_address, settlement_currency, telegram_user_id, email, password_hash, google_id, qr_session, qr_expires_at, role, risk_level, spread_override, fee_percent, allowed_networks, settlement_policy, is_active, created_at, updated_at
		FROM merchants WHERE api_key_hash = $1
	`
	row := r.pool.QueryRow(ctx, query, hash)
	return scanMerchant(row)
}

func (r *MerchantRepository) GetByTelegramID(ctx context.Context, telegramID string) (*merchant.Merchant, error) {
	query := `
		SELECT id, name, api_key_hash, webhook_url, webhook_secret, settlement_address, settlement_currency, telegram_user_id, email, password_hash, google_id, qr_session, qr_expires_at, role, risk_level, spread_override, fee_percent, allowed_networks, settlement_policy, is_active, created_at, updated_at
		FROM merchants WHERE telegram_user_id = $1
	`
	row := r.pool.QueryRow(ctx, query, telegramID)
	return scanMerchant(row)
}

func (r *MerchantRepository) GetByEmail(ctx context.Context, email string) (*merchant.Merchant, error) {
	query := `
		SELECT id, name, api_key_hash, webhook_url, webhook_secret, settlement_address, settlement_currency, telegram_user_id, email, password_hash, google_id, qr_session, qr_expires_at, role, risk_level, spread_override, fee_percent, allowed_networks, settlement_policy, is_active, created_at, updated_at
		FROM merchants WHERE email = $1
	`
	row := r.pool.QueryRow(ctx, query, email)
	return scanMerchant(row)
}

func (r *MerchantRepository) GetByGoogleID(ctx context.Context, googleID string) (*merchant.Merchant, error) {
	query := `
		SELECT id, name, api_key_hash, webhook_url, webhook_secret, settlement_address, settlement_currency, telegram_user_id, email, password_hash, google_id, qr_session, qr_expires_at, role, risk_level, spread_override, fee_percent, allowed_networks, settlement_policy, is_active, created_at, updated_at
		FROM merchants WHERE google_id = $1
	`
	row := r.pool.QueryRow(ctx, query, googleID)
	return scanMerchant(row)
}

func (r *MerchantRepository) Update(ctx context.Context, m *merchant.Merchant) error {
	query := `
		UPDATE merchants SET name=$2, webhook_url=$3, webhook_secret=$4, settlement_address=$5, settlement_currency=$6, telegram_user_id=$7, email=$8, password_hash=$9, google_id=$10, qr_session=$11, qr_expires_at=$12, role=$13, risk_level=$14,
			spread_override=$15, fee_percent=$16, allowed_networks=$17, settlement_policy=$18, is_active=$19, updated_at=$20
		WHERE id=$1
	`
	_, err := r.pool.Exec(ctx, query,
		m.ID, m.Name, m.WebhookURL, m.WebhookSecret, m.SettlementAddress, m.SettlementCurrency, m.TelegramUserID, m.Email, m.PasswordHash, m.GoogleID, m.QRSession, m.QRExpiresAt, m.Role, m.RiskLevel,
		m.SpreadOverride, m.FeePercent, m.AllowedNetworks, m.SettlementPolicy, m.IsActive, m.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("update merchant: %w", err)
	}
	return nil
}
