
package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/ton-pay-router/core/internal/domain/ledger"
	"github.com/ton-pay-router/core/internal/port"
)

type LedgerService struct {
	repo port.LedgerRepository
}

func NewLedgerService(repo port.LedgerRepository) *LedgerService {
	return &LedgerService{repo: repo}
}

func (s *LedgerService) Record(ctx context.Context, invoiceID, amount, currency string, accountType ledger.AccountType, debit, credit string) error {
	entry := &ledger.LedgerEntry{
		ID:          uuid.NewString(),
		Type:        string(accountType),
		Amount:      amount,
		Currency:    currency,
		InvoiceID:   invoiceID,
		AccountType: accountType,
		Debit:       debit,
		Credit:      credit,
		CreatedAt:   time.Now().UTC(),
	}
	return s.repo.Create(ctx, entry)
}

func (s *LedgerService) ListByInvoice(ctx context.Context, invoiceID string) ([]*ledger.LedgerEntry, error) {
	return s.repo.ListByInvoice(ctx, invoiceID)
}
