
package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/ton-pay-router/core/internal/domain/support"
	"github.com/ton-pay-router/core/internal/port"
)

type SupportRepository struct {
	pool *pgxpool.Pool
}

func NewSupportRepository(pool *pgxpool.Pool) port.SupportRepository {
	return &SupportRepository{pool: pool}
}

func (r *SupportRepository) CreateTicket(ctx context.Context, t *support.Ticket) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO support_tickets (id, merchant_id, subject, category, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, t.ID, t.MerchantID, t.Subject, t.Category, t.Status, time.Now().UTC(), time.Now().UTC())
	if err != nil {
		return fmt.Errorf("create ticket: %w", err)
	}
	return nil
}

func (r *SupportRepository) GetTicketByID(ctx context.Context, id string) (*support.Ticket, error) {
	var t support.Ticket
	err := r.pool.QueryRow(ctx, `
		SELECT id, merchant_id, subject, category, status, created_at, updated_at
		FROM support_tickets WHERE id = $1
	`, id).Scan(&t.ID, &t.MerchantID, &t.Subject, &t.Category, &t.Status, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *SupportRepository) ListTicketsByMerchant(ctx context.Context, merchantID string) ([]*support.Ticket, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, merchant_id, subject, category, status, created_at, updated_at
		FROM support_tickets WHERE merchant_id = $1 ORDER BY created_at DESC
	`, merchantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tickets []*support.Ticket
	for rows.Next() {
		var t support.Ticket
		if err := rows.Scan(&t.ID, &t.MerchantID, &t.Subject, &t.Category, &t.Status, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		tickets = append(tickets, &t)
	}
	return tickets, nil
}

func (r *SupportRepository) AddMessage(ctx context.Context, m *support.Message) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO support_messages (id, ticket_id, sender_type, message, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`, m.ID, m.TicketID, m.SenderType, m.Message, time.Now().UTC())
	if err != nil {
		return fmt.Errorf("add message: %w", err)
	}
	return nil
}

func (r *SupportRepository) ListMessagesByTicket(ctx context.Context, ticketID string) ([]*support.Message, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, ticket_id, sender_type, message, created_at
		FROM support_messages WHERE ticket_id = $1 ORDER BY created_at ASC
	`, ticketID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*support.Message
	for rows.Next() {
		var m support.Message
		if err := rows.Scan(&m.ID, &m.TicketID, &m.SenderType, &m.Message, &m.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, &m)
	}
	return messages, nil
}

func (r *SupportRepository) GetFAQ(ctx context.Context) ([]map[string]interface{}, error) {
	rows, err := r.pool.Query(ctx, `SELECT question, answer FROM faq ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var faqs []map[string]interface{}
	for rows.Next() {
		var q, a string
		if err := rows.Scan(&q, &a); err != nil {
			return nil, err
		}
		faqs = append(faqs, map[string]interface{}{"question": q, "answer": a})
	}
	return faqs, nil
}
