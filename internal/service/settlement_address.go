
package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/ton-pay-router/core/internal/domain/settlementaddress"
	"github.com/ton-pay-router/core/internal/port"
)

type SettlementAddressService struct {
	repo port.SettlementAddressRepository
}

func NewSettlementAddressService(repo port.SettlementAddressRepository) *SettlementAddressService {
	return &SettlementAddressService{repo: repo}
}

func (s *SettlementAddressService) Create(ctx context.Context, merchantID, address, currency string) (*settlementaddress.SettlementAddress, error) {
	sa := &settlementaddress.SettlementAddress{
		ID:         uuid.NewString(),
		MerchantID: merchantID,
		Address:    address,
		Currency:   currency,
		IsActive:   true,
		CreatedAt:  time.Now().UTC(),
		UpdatedAt:  time.Now().UTC(),
	}
	if err := s.repo.Create(ctx, sa); err != nil {
		return nil, err
	}
	return sa, nil
}

func (s *SettlementAddressService) ListByMerchant(ctx context.Context, merchantID string) ([]*settlementaddress.SettlementAddress, error) {
	return s.repo.ListByMerchant(ctx, merchantID)
}

func (s *SettlementAddressService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
