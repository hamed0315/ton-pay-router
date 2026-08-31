
package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/ton-pay-router/core/internal/domain/invoice"
	"github.com/ton-pay-router/core/internal/port"
)

type InvoiceRepository struct {
	pool *pgxpool.Pool
}

func NewInvoiceRepository(pool *pgxpool.Pool) port.InvoiceRepository {
	return &InvoiceRepository{pool: pool}
}

func (r *InvoiceRepository) Create(ctx context.Context, inv *invoice.Invoice) error {
	query := `
		INSERT INTO invoices (id, merchant_id, amount, source_currency, dest_currency, dest_amount, dest_address, status, callback_url, idempotency_key, quote_snapshot, metadata, expires_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULLIF($10, ''), $11, $12, $13, $14, $15)
	`
	_, err := r.pool.Exec(ctx, query,
		inv.ID, inv.MerchantID, inv.Amount, inv.SourceCurrency, inv.DestCurrency, inv.DestAmount, inv.DestAddress,
		string(inv.Status), inv.CallbackURL, inv.IdempotencyKey, inv.QuoteSnapshot, inv.Metadata, inv.ExpiresAt, inv.CreatedAt, inv.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("insert invoice: %w", err)
	}
	return nil
}

func (r *InvoiceRepository) GetByID(ctx context.Context, id string) (*invoice.Invoice, error) {
	query := `
		SELECT id, merchant_id, amount, source_currency, dest_currency, dest_amount, dest_address, status, callback_url, idempotency_key, quote_snapshot, metadata, expires_at, created_at, updated_at
		FROM invoices WHERE id = $1
	`
	var inv invoice.Invoice
	var quoteSnapshot []byte
	var metadata []byte
	var idempotencyKey sql.NullString
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&inv.ID, &inv.MerchantID, &inv.Amount, &inv.SourceCurrency, &inv.DestCurrency, &inv.DestAmount, &inv.DestAddress,
		&inv.Status, &inv.CallbackURL, &idempotencyKey, &quoteSnapshot, &metadata, &inv.ExpiresAt, &inv.CreatedAt, &inv.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("invoice not found: %s", id)
		}
		return nil, fmt.Errorf("select invoice by id: %w", err)
	}
	inv.IdempotencyKey = idempotencyKey.String
	inv.QuoteSnapshot = json.RawMessage(quoteSnapshot)
	inv.Metadata = json.RawMessage(metadata)
	return &inv, nil
}

func (r *InvoiceRepository) GetByIdempotencyKey(ctx context.Context, merchantID, idempotencyKey string) (*invoice.Invoice, error) {
	query := `
		SELECT id, merchant_id, amount, source_currency, dest_currency, dest_amount, dest_address, status, callback_url, idempotency_key, quote_snapshot, metadata, expires_at, created_at, updated_at
		FROM invoices WHERE merchant_id = $1 AND idempotency_key = $2
	`
	var inv invoice.Invoice
	var quoteSnapshot []byte
	var metadata []byte
	var idempotencyKeyFromDB sql.NullString
	err := r.pool.QueryRow(ctx, query, merchantID, idempotencyKey).Scan(
		&inv.ID, &inv.MerchantID, &inv.Amount, &inv.SourceCurrency, &inv.DestCurrency, &inv.DestAmount, &inv.DestAddress,
		&inv.Status, &inv.CallbackURL, &idempotencyKeyFromDB, &quoteSnapshot, &metadata, &inv.ExpiresAt, &inv.CreatedAt, &inv.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("select invoice by idempotency key: %w", err)
	}
	inv.IdempotencyKey = idempotencyKeyFromDB.String
	inv.QuoteSnapshot = json.RawMessage(quoteSnapshot)
	inv.Metadata = json.RawMessage(metadata)
	return &inv, nil
}

func (r *InvoiceRepository) UpdateStatus(ctx context.Context, id string, status invoice.Status) error {
	query := `UPDATE invoices SET status=$2, updated_at=now() WHERE id=$1`
	_, err := r.pool.Exec(ctx, query, id, string(status))
	if err != nil {
		return fmt.Errorf("update invoice status: %w", err)
	}
	return nil
}

func (r *InvoiceRepository) UpdateDestAmount(ctx context.Context, id string, destAmount string) error {
	query := `UPDATE invoices SET dest_amount = $2, updated_at = now() WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id, destAmount)
	if err != nil {
		return fmt.Errorf("update invoice dest amount: %w", err)
	}
	return nil
}

func (r *InvoiceRepository) ListByMerchant(ctx context.Context, merchantID string, limit, offset int) ([]*invoice.Invoice, error) {
	query := `
		SELECT id, merchant_id, amount, source_currency, dest_currency, dest_amount, dest_address, status, callback_url, idempotency_key, quote_snapshot, metadata, expires_at, created_at, updated_at
		FROM invoices WHERE merchant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3
	`
	rows, err := r.pool.Query(ctx, query, merchantID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("list invoices: %w", err)
	}
	defer rows.Close()

	var invoices []*invoice.Invoice
	for rows.Next() {
		var inv invoice.Invoice
		var quoteSnapshot []byte
		var metadata []byte
		var idempotencyKey sql.NullString
		if err := rows.Scan(
			&inv.ID, &inv.MerchantID, &inv.Amount, &inv.SourceCurrency, &inv.DestCurrency, &inv.DestAmount, &inv.DestAddress,
			&inv.Status, &inv.CallbackURL, &idempotencyKey, &quoteSnapshot, &metadata, &inv.ExpiresAt, &inv.CreatedAt, &inv.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan invoice row: %w", err)
		}
		inv.IdempotencyKey = idempotencyKey.String
		inv.QuoteSnapshot = json.RawMessage(quoteSnapshot)
		inv.Metadata = json.RawMessage(metadata)
		invoices = append(invoices, &inv)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate invoice rows: %w", err)
	}
	return invoices, nil
}
