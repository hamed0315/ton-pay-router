
package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/ton-pay-router/core/internal/domain/support"
	"github.com/ton-pay-router/core/internal/port"
)

type SupportService struct {
	repo port.SupportRepository
}

func NewSupportService(repo port.SupportRepository) *SupportService {
	return &SupportService{repo: repo}
}

func (s *SupportService) CreateTicket(ctx context.Context, merchantID, subject, category string) (*support.Ticket, error) {
	t := &support.Ticket{
		ID:         uuid.NewString(),
		MerchantID: merchantID,
		Subject:    subject,
		Category:   category,
		Status:     "open",
		CreatedAt:  time.Now().UTC(),
		UpdatedAt:  time.Now().UTC(),
	}
	if err := s.repo.CreateTicket(ctx, t); err != nil {
		return nil, err
	}
	return t, nil
}

func (s *SupportService) ListTicketsByMerchant(ctx context.Context, merchantID string) ([]*support.Ticket, error) {
	return s.repo.ListTicketsByMerchant(ctx, merchantID)
}

func (s *SupportService) AddMessage(ctx context.Context, ticketID, senderType, message string) error {
	m := &support.Message{
		ID:         uuid.NewString(),
		TicketID:   ticketID,
		SenderType: senderType,
		Message:    message,
		CreatedAt:  time.Now().UTC(),
	}
	return s.repo.AddMessage(ctx, m)
}

func (s *SupportService) ListMessages(ctx context.Context, ticketID string) ([]*support.Message, error) {
	return s.repo.ListMessagesByTicket(ctx, ticketID)
}

func (s *SupportService) GetFAQ(ctx context.Context) ([]map[string]interface{}, error) {
	return s.repo.GetFAQ(ctx)
}
