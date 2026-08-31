
package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/ton-pay-router/core/internal/port"
)

type StatsRepository struct {
	pool *pgxpool.Pool
}

func NewStatsRepository(pool *pgxpool.Pool) port.StatsRepository {
	return &StatsRepository{pool: pool}
}

func (r *StatsRepository) GetDashboardStats(ctx context.Context, merchantID string) (map[string]interface{}, error) {
	var totalInvoices, totalVolume, totalSettled, totalPending int

	err := r.pool.QueryRow(ctx, `
		SELECT
			COUNT(*) FILTER (WHERE merchant_id = $1) AS total_invoices,
			COALESCE(SUM(amount) FILTER (WHERE merchant_id = $1), 0) AS total_volume,
			COUNT(*) FILTER (WHERE merchant_id = $1 AND status = 'settled') AS total_settled,
			COUNT(*) FILTER (WHERE merchant_id = $1 AND status = 'pending') AS total_pending
		FROM invoices
	`, merchantID).Scan(&totalInvoices, &totalVolume, &totalSettled, &totalPending)

	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"total_invoices":  totalInvoices,
		"total_volume":    totalVolume,
		"total_settled":   totalSettled,
		"total_pending":   totalPending,
	}, nil
}

func (r *StatsRepository) GetRecentTransactions(ctx context.Context, merchantID string, limit int) ([]map[string]interface{}, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, invoice_id, tx_hash_src, amount_src, amount_dst, status, created_at
		FROM settlements
		WHERE invoice_id IN (SELECT id FROM invoices WHERE merchant_id = $1)
		ORDER BY created_at DESC
		LIMIT $2
	`, merchantID, limit)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	transactions := make([]map[string]interface{}, 0)
	for rows.Next() {
		var id, invoiceID, txHash, amountSrc, amountDst, status, createdAt string
		if err := rows.Scan(&id, &invoiceID, &txHash, &amountSrc, &amountDst, &status, &createdAt); err != nil {
			return nil, err
		}
		transactions = append(transactions, map[string]interface{}{
			"id":         id,
			"invoice_id": invoiceID,
			"tx_hash":    txHash,
			"amount_src": amountSrc,
			"amount_dst": amountDst,
			"status":     status,
			"created_at": createdAt,
		})
	}

	return transactions, nil
}
