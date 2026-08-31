
package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/ton-pay-router/core/internal/domain/gateway"
	"github.com/ton-pay-router/core/internal/port"
)

type GatewayService struct {
	repo port.GatewayRepository
}

func NewGatewayService(repo port.GatewayRepository) *GatewayService {
	return &GatewayService{repo: repo}
}

func (s *GatewayService) Create(ctx context.Context, merchantID, name string) (*gateway.Gateway, string, error) {
	apiKey := generateAPIKey()
	hash := hashAPIKey(apiKey)

	g := &gateway.Gateway{
		ID:         uuid.NewString(),
		MerchantID: merchantID,
		Name:       name,
		APIKeyHash: hash,
		IsActive:   true,
		CreatedAt:  time.Now().UTC(),
		UpdatedAt:  time.Now().UTC(),
	}
	if err := s.repo.Create(ctx, g); err != nil {
		return nil, "", err
	}
	return g, apiKey, nil
}

func (s *GatewayService) ListByMerchant(ctx context.Context, merchantID string) ([]*gateway.Gateway, error) {
	return s.repo.ListByMerchant(ctx, merchantID)
}

func (s *GatewayService) Revoke(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *GatewayService) Toggle(ctx context.Context, id string, merchantID string) (*gateway.Gateway, error) {
	// Fetch gateway by id from list (since GetByID not defined)
	gateways, err := s.repo.ListByMerchant(ctx, merchantID)
	if err != nil {
		return nil, err
	}
	for _, g := range gateways {
		if g.ID == id {
			g.IsActive = !g.IsActive
			g.UpdatedAt = time.Now().UTC()
			if err := s.repo.Update(ctx, g); err != nil {
				return nil, err
			}
			return g, nil
		}
	}
	return nil, fmt.Errorf("gateway not found")
}

func (s *GatewayService) GetMerchantByAPIKey(ctx context.Context, apiKey string) (string, error) {
	hash := hashAPIKey(apiKey)
	g, err := s.repo.GetByAPIKeyHash(ctx, hash)
	if err != nil {
		return "", err
	}
	if !g.IsActive {
		return "", fmt.Errorf("gateway inactive")
	}
	return g.MerchantID, nil
}
