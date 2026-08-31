
package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/ton-pay-router/core/internal/domain/gateway"
	"github.com/ton-pay-router/core/internal/port"
)

type GatewayRepository struct {
	pool *pgxpool.Pool
}

func NewGatewayRepository(pool *pgxpool.Pool) port.GatewayRepository {
	return &GatewayRepository{pool: pool}
}

func (r *GatewayRepository) Create(ctx context.Context, g *gateway.Gateway) error {
	query := `
		INSERT INTO gateways (id, merchant_id, name, api_key_hash, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.pool.Exec(ctx, query,
		g.ID, g.MerchantID, g.Name, g.APIKeyHash, g.IsActive, g.CreatedAt, g.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("insert gateway: %w", err)
	}
	return nil
}

func (r *GatewayRepository) GetByAPIKeyHash(ctx context.Context, hash string) (*gateway.Gateway, error) {
	query := `
		SELECT id, merchant_id, name, api_key_hash, is_active, created_at, updated_at
		FROM gateways WHERE api_key_hash = $1
	`
	var g gateway.Gateway
	err := r.pool.QueryRow(ctx, query, hash).Scan(
		&g.ID, &g.MerchantID, &g.Name, &g.APIKeyHash, &g.IsActive, &g.CreatedAt, &g.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("gateway not found")
		}
		return nil, err
	}
	return &g, nil
}

func (r *GatewayRepository) ListByMerchant(ctx context.Context, merchantID string) ([]*gateway.Gateway, error) {
	query := `
		SELECT id, merchant_id, name, api_key_hash, is_active, created_at, updated_at
		FROM gateways WHERE merchant_id = $1 ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, merchantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var gateways []*gateway.Gateway
	for rows.Next() {
		var g gateway.Gateway
		if err := rows.Scan(&g.ID, &g.MerchantID, &g.Name, &g.APIKeyHash, &g.IsActive, &g.CreatedAt, &g.UpdatedAt); err != nil {
			return nil, err
		}
		gateways = append(gateways, &g)
	}
	return gateways, nil
}

func (r *GatewayRepository) Update(ctx context.Context, g *gateway.Gateway) error {
	query := `
		UPDATE gateways SET name=$2, is_active=$3, updated_at=$4 WHERE id=$1
	`
	_, err := r.pool.Exec(ctx, query, g.ID, g.Name, g.IsActive, time.Now().UTC())
	return err
}

func (r *GatewayRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM gateways WHERE id=$1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}
