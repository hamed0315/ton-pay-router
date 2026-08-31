
package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/ton-pay-router/core/internal/domain/settlement"
	"github.com/ton-pay-router/core/internal/port"
)

type SettlementService struct {
	repo port.SettlementRepository
}

func NewSettlementService(repo port.SettlementRepository) *SettlementService {
	return &SettlementService{repo: repo}
}

func (s *SettlementService) Create(ctx context.Context, invoiceID, txHashSrc, txHashDst, amountSrc, amountDst, gasUsed string, confirmations int, status settlement.Status) (*settlement.Settlement, error) {
	st := &settlement.Settlement{
		ID:            uuid.NewString(),
		InvoiceID:     invoiceID,
		TxHashSrc:     txHashSrc,
		TxHashDst:     txHashDst,
		AmountSrc:     amountSrc,
		AmountDst:     amountDst,
		Status:        status,
		Confirmations: confirmations,
		GasUsed:       gasUsed,
		CreatedAt:     time.Now().UTC(),
		UpdatedAt:     time.Now().UTC(),
	}
	if err := s.repo.Create(ctx, st); err != nil {
		return nil, err
	}
	return st, nil
}

func (s *SettlementService) UpdateStatus(ctx context.Context, id string, status settlement.Status) error {
	st, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	st.Status = status
	st.UpdatedAt = time.Now().UTC()
	return s.repo.Update(ctx, st)
}

func (s *SettlementService) GetByID(ctx context.Context, id string) (*settlement.Settlement, error) {
	return s.repo.GetByID(ctx, id)
}
