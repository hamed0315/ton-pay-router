
package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/ton-pay-router/core/internal/domain/settlementaddress"
	"github.com/ton-pay-router/core/internal/port"
)

type SettlementAddressRepository struct {
	pool *pgxpool.Pool
}

func NewSettlementAddressRepository(pool *pgxpool.Pool) port.SettlementAddressRepository {
	return &SettlementAddressRepository{pool: pool}
}

func (r *SettlementAddressRepository) Create(ctx context.Context, sa *settlementaddress.SettlementAddress) error {
	query := `
		INSERT INTO settlement_addresses (id, merchant_id, address, currency, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.pool.Exec(ctx, query, sa.ID, sa.MerchantID, sa.Address, sa.Currency, sa.IsActive, time.Now().UTC(), time.Now().UTC())
	if err != nil {
		return fmt.Errorf("insert settlement address: %w", err)
	}
	return nil
}

func (r *SettlementAddressRepository) ListByMerchant(ctx context.Context, merchantID string) ([]*settlementaddress.SettlementAddress, error) {
	query := `
		SELECT id, merchant_id, address, currency, is_active, created_at, updated_at
		FROM settlement_addresses WHERE merchant_id = $1 ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, merchantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*settlementaddress.SettlementAddress
	for rows.Next() {
		var sa settlementaddress.SettlementAddress
		if err := rows.Scan(&sa.ID, &sa.MerchantID, &sa.Address, &sa.Currency, &sa.IsActive, &sa.CreatedAt, &sa.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, &sa)
	}
	return list, nil
}

func (r *SettlementAddressRepository) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM settlement_addresses WHERE id=$1`, id)
	return err
}
