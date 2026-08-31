
package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/ton-pay-router/core/internal/domain/payment"
	"github.com/ton-pay-router/core/internal/port"
)

type PaymentRepository struct {
	pool *pgxpool.Pool
}

func NewPaymentRepository(pool *pgxpool.Pool) port.PaymentRepository {
	return &PaymentRepository{pool: pool}
}

func (r *PaymentRepository) Create(ctx context.Context, p *payment.Payment) error {
	query := `
		INSERT INTO payments (id, invoice_id, tx_hash_src, tx_hash_dst, amount_src, amount_dst, status, provider, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.pool.Exec(ctx, query,
		p.ID, p.InvoiceID, p.TxHashSrc, p.TxHashDst, p.AmountSrc, p.AmountDst,
		string(p.Status), p.Provider, p.CreatedAt, p.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("insert payment: %w", err)
	}
	return nil
}

func (r *PaymentRepository) GetByID(ctx context.Context, id string) (*payment.Payment, error) {
	query := `
		SELECT id, invoice_id, tx_hash_src, tx_hash_dst, amount_src, amount_dst, status, provider, created_at, updated_at
		FROM payments WHERE id = $1
	`
	var p payment.Payment
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&p.ID, &p.InvoiceID, &p.TxHashSrc, &p.TxHashDst, &p.AmountSrc, &p.AmountDst,
		&p.Status, &p.Provider, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("select payment: %w", err)
	}
	return &p, nil
}

func (r *PaymentRepository) Update(ctx context.Context, p *payment.Payment) error {
	query := `
		UPDATE payments SET tx_hash_src=$2, tx_hash_dst=$3, amount_src=$4, amount_dst=$5, status=$6, provider=$7, updated_at=$8
		WHERE id=$1
	`
	_, err := r.pool.Exec(ctx, query,
		p.ID, p.TxHashSrc, p.TxHashDst, p.AmountSrc, p.AmountDst, string(p.Status), p.Provider, p.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("update payment: %w", err)
	}
	return nil
}
