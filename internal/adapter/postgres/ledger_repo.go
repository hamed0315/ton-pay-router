
package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/ton-pay-router/core/internal/domain/ledger"
	"github.com/ton-pay-router/core/internal/port"
)

type LedgerRepository struct {
	pool *pgxpool.Pool
}

func NewLedgerRepository(pool *pgxpool.Pool) port.LedgerRepository {
	return &LedgerRepository{pool: pool}
}

func (r *LedgerRepository) Create(ctx context.Context, entry *ledger.LedgerEntry) error {
	query := `
		INSERT INTO ledger_entries (id, type, amount, currency, invoice_id, account_type, debit, credit, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.pool.Exec(ctx, query,
		entry.ID, entry.Type, entry.Amount, entry.Currency, entry.InvoiceID,
		string(entry.AccountType), entry.Debit, entry.Credit, entry.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("insert ledger entry: %w", err)
	}
	return nil
}

func (r *LedgerRepository) ListByInvoice(ctx context.Context, invoiceID string) ([]*ledger.LedgerEntry, error) {
	query := `
		SELECT id, type, amount, currency, invoice_id, account_type, debit, credit, created_at
		FROM ledger_entries WHERE invoice_id = $1 ORDER BY created_at ASC
	`
	rows, err := r.pool.Query(ctx, query, invoiceID)
	if err != nil {
		return nil, fmt.Errorf("list ledger entries: %w", err)
	}
	defer rows.Close()

	var entries []*ledger.LedgerEntry
	for rows.Next() {
		var e ledger.LedgerEntry
		if err := rows.Scan(
			&e.ID, &e.Type, &e.Amount, &e.Currency, &e.InvoiceID,
			&e.AccountType, &e.Debit, &e.Credit, &e.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan ledger entry: %w", err)
		}
		entries = append(entries, &e)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate ledger entries: %w", err)
	}
	return entries, nil
}
