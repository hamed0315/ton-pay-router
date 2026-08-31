
package service

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/ton-pay-router/core/internal/domain/invoice"
	"github.com/ton-pay-router/core/internal/port"
)

type InvoiceService struct {
	repo port.InvoiceRepository
}

func NewInvoiceService(repo port.InvoiceRepository) *InvoiceService {
	return &InvoiceService{repo: repo}
}

type CreateInvoiceRequest struct {
	MerchantID     string
	Amount         string
	SourceCurrency string
	DestCurrency   string
	DestAddress    string
	CallbackURL    string
	IdempotencyKey string
	ExpiresIn      time.Duration
	Metadata       map[string]interface{}
}

func (s *InvoiceService) Create(ctx context.Context, req CreateInvoiceRequest) (*invoice.Invoice, error) {
	if req.IdempotencyKey != "" {
		existing, err := s.repo.GetByIdempotencyKey(ctx, req.MerchantID, req.IdempotencyKey)
		if err != nil {
			return nil, err
		}
		if existing != nil {
			return existing, nil
		}
	}

	expiresAt := time.Now().UTC().Add(req.ExpiresIn)
	metadataJSON, _ := json.Marshal(req.Metadata)

	inv := &invoice.Invoice{
		ID:             uuid.NewString(),
		MerchantID:     req.MerchantID,
		Amount:         req.Amount,
		SourceCurrency: req.SourceCurrency,
		DestCurrency:   req.DestCurrency,
		DestAmount:     "0",
		DestAddress:    req.DestAddress,
		Status:         invoice.StatusPending,
		CallbackURL:    req.CallbackURL,
		IdempotencyKey: req.IdempotencyKey,
		Metadata:       metadataJSON,
		ExpiresAt:      expiresAt,
		CreatedAt:      time.Now().UTC(),
		UpdatedAt:      time.Now().UTC(),
	}

	if err := s.repo.Create(ctx, inv); err != nil {
		return nil, err
	}
	return inv, nil
}

func (s *InvoiceService) GetByID(ctx context.Context, id string) (*invoice.Invoice, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *InvoiceService) UpdateStatus(ctx context.Context, id string, status invoice.Status) error {
	return s.repo.UpdateStatus(ctx, id, status)
}

func (s *InvoiceService) UpdateDestAmount(ctx context.Context, id string, destAmount string) error {
	return s.repo.UpdateDestAmount(ctx, id, destAmount)
}

func (s *InvoiceService) ListByMerchant(ctx context.Context, merchantID string, limit, offset int) ([]*invoice.Invoice, error) {
	return s.repo.ListByMerchant(ctx, merchantID, limit, offset)
}
