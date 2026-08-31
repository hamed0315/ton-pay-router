
package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/ton-pay-router/core/internal/domain/payment"
	"github.com/ton-pay-router/core/internal/port"
)

type PaymentService struct {
	repo port.PaymentRepository
}

func NewPaymentService(repo port.PaymentRepository) *PaymentService {
	return &PaymentService{repo: repo}
}

func (s *PaymentService) Create(ctx context.Context, invoiceID, txHashSrc, txHashDst, amountSrc, amountDst, provider string, status payment.Status) (*payment.Payment, error) {
	p := &payment.Payment{
		ID:        uuid.NewString(),
		InvoiceID: invoiceID,
		TxHashSrc: txHashSrc,
		TxHashDst: txHashDst,
		AmountSrc: amountSrc,
		AmountDst: amountDst,
		Status:    status,
		Provider:  provider,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}
	if err := s.repo.Create(ctx, p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *PaymentService) UpdateStatus(ctx context.Context, id string, status payment.Status) error {
	p, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	p.Status = status
	p.UpdatedAt = time.Now().UTC()
	return s.repo.Update(ctx, p)
}

func (s *PaymentService) GetByID(ctx context.Context, id string) (*payment.Payment, error) {
	return s.repo.GetByID(ctx, id)
}
