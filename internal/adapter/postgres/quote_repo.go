

package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/ton-pay-router/core/internal/domain/quote"
	"github.com/ton-pay-router/core/internal/port"
)

type QuoteRepository struct {
	pool *pgxpool.Pool
}

func NewQuoteRepository(pool *pgxpool.Pool) port.QuoteRepository {
	return &QuoteRepository{pool: pool}
}

func (r *QuoteRepository) Create(ctx context.Context, q *quote.Quote) error {
	query := `
		INSERT INTO quotes (id, invoice_id, provider, quote_id, raw_rate, applied_spread, final_rate, best_route, price_impact, raw_quote, valid_until, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`
	_, err := r.pool.Exec(ctx, query,
		q.ID, q.InvoiceID, q.Provider, q.QuoteID, q.RawRate, q.AppliedSpread, q.FinalRate,
		q.BestRoute, q.PriceImpact, q.RawQuote, q.ValidUntil, q.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("insert quote: %w", err)
	}
	return nil
}

func (r *QuoteRepository) GetByID(ctx context.Context, id string) (*quote.Quote, error) {
	query := `
		SELECT id, invoice_id, provider, quote_id, raw_rate, applied_spread, final_rate, best_route, price_impact, raw_quote, valid_until, created_at
		FROM quotes WHERE id = $1
	`
	var q quote.Quote
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&q.ID, &q.InvoiceID, &q.Provider, &q.QuoteID, &q.RawRate, &q.AppliedSpread, &q.FinalRate,
		&q.BestRoute, &q.PriceImpact, &q.RawQuote, &q.ValidUntil, &q.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("select quote: %w", err)
	}
	return &q, nil
}

func (r *QuoteRepository) GetByInvoice(ctx context.Context, invoiceID string) (*quote.Quote, error) {
	query := `
		SELECT id, invoice_id, provider, quote_id, raw_rate, applied_spread, final_rate, best_route, price_impact, raw_quote, valid_until, created_at
		FROM quotes WHERE invoice_id = $1 ORDER BY created_at DESC LIMIT 1
	`
	var q quote.Quote
	err := r.pool.QueryRow(ctx, query, invoiceID).Scan(
		&q.ID, &q.InvoiceID, &q.Provider, &q.QuoteID, &q.RawRate, &q.AppliedSpread, &q.FinalRate,
		&q.BestRoute, &q.PriceImpact, &q.RawQuote, &q.ValidUntil, &q.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("select quote by invoice: %w", err)
	}
	return &q, nil
}
