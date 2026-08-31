
package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/ton-pay-router/core/internal/domain/settlement"
	"github.com/ton-pay-router/core/internal/port"
)

type SettlementRepository struct {
	pool *pgxpool.Pool
}

func NewSettlementRepository(pool *pgxpool.Pool) port.SettlementRepository {
	return &SettlementRepository{pool: pool}
}

func (r *SettlementRepository) Create(ctx context.Context, s *settlement.Settlement) error {
	query := `
		INSERT INTO settlements (id, invoice_id, tx_hash_src, tx_hash_dst, amount_src, amount_dst, status, confirmations, gas_used, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := r.pool.Exec(ctx, query,
		s.ID, s.InvoiceID, s.TxHashSrc, s.TxHashDst, s.AmountSrc, s.AmountDst,
		string(s.Status), s.Confirmations, s.GasUsed, s.CreatedAt, s.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("insert settlement: %w", err)
	}
	return nil
}

func (r *SettlementRepository) GetByID(ctx context.Context, id string) (*settlement.Settlement, error) {
	query := `
		SELECT id, invoice_id, tx_hash_src, tx_hash_dst, amount_src, amount_dst, status, confirmations, gas_used, created_at, updated_at
		FROM settlements WHERE id = $1
	`
	var s settlement.Settlement
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&s.ID, &s.InvoiceID, &s.TxHashSrc, &s.TxHashDst, &s.AmountSrc, &s.AmountDst,
		&s.Status, &s.Confirmations, &s.GasUsed, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("select settlement: %w", err)
	}
	return &s, nil
}

func (r *SettlementRepository) Update(ctx context.Context, s *settlement.Settlement) error {
	query := `
		UPDATE settlements SET tx_hash_src=$2, tx_hash_dst=$3, amount_src=$4, amount_dst=$5, status=$6, confirmations=$7, gas_used=$8, updated_at=$9
		WHERE id=$1
	`
	_, err := r.pool.Exec(ctx, query,
		s.ID, s.TxHashSrc, s.TxHashDst, s.AmountSrc, s.AmountDst,
		string(s.Status), s.Confirmations, s.GasUsed, s.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("update settlement: %w", err)
	}
	return nil
}
