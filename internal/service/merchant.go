
package service

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/ton-pay-router/core/internal/domain/merchant"
	"github.com/ton-pay-router/core/internal/port"
)

type MerchantService struct {
	repo port.MerchantRepository
}

func NewMerchantService(repo port.MerchantRepository) *MerchantService {
	return &MerchantService{repo: repo}
}

type RegisterMerchantRequest struct {
	Name               string
	WebhookURL         string
	SettlementAddress  string
	SettlementCurrency string
	TelegramUserID     string
	Email              string
	Password           string
	FeePercent         *float64
}

func (s *MerchantService) Register(ctx context.Context, req RegisterMerchantRequest) (*merchant.Merchant, string, error) {
	apiKey := generateAPIKey()
	apiKeyHash := hashAPIKey(apiKey)

	m := &merchant.Merchant{
		ID:                 uuid.NewString(),
		Name:               req.Name,
		APIKeyHash:         apiKeyHash,
		WebhookURL:         req.WebhookURL,
		WebhookSecret:      generateSecret(),
		SettlementAddress:  req.SettlementAddress,
		SettlementCurrency: req.SettlementCurrency,
		TelegramUserID:     req.TelegramUserID,
		Email:              req.Email,
		Role:               "merchant",
		RiskLevel:          "low",
		SettlementPolicy:   "immediate",
		IsActive:           true,
		CreatedAt:          time.Now().UTC(),
		UpdatedAt:          time.Now().UTC(),
	}

	if req.FeePercent != nil {
		m.FeePercent = req.FeePercent
	} else {
		defaultFee := 0.5
		m.FeePercent = &defaultFee
	}

	if req.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, "", err
		}
		m.PasswordHash = string(hash)
	}

	if err := s.repo.Create(ctx, m); err != nil {
		return nil, "", err
	}
	return m, apiKey, nil
}

func (s *MerchantService) LoginWithEmail(ctx context.Context, email, password string) (*merchant.Merchant, error) {
	m, err := s.repo.GetByEmail(ctx, email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(m.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("invalid email or password")
	}
	if !m.IsActive {
		return nil, errors.New("merchant is inactive")
	}
	return m, nil
}

func (s *MerchantService) GetByAPIKey(ctx context.Context, apiKey string) (*merchant.Merchant, error) {
	hash := hashAPIKey(apiKey)
	return s.repo.GetByAPIKeyHash(ctx, hash)
}

func (s *MerchantService) GetByID(ctx context.Context, id string) (*merchant.Merchant, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *MerchantService) GetByTelegramID(ctx context.Context, telegramID string) (*merchant.Merchant, error) {
	return s.repo.GetByTelegramID(ctx, telegramID)
}

func (s *MerchantService) UpdateProfile(ctx context.Context, m *merchant.Merchant) error {
	m.UpdatedAt = time.Now().UTC()
	return s.repo.Update(ctx, m)
}

func generateAPIKey() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return hex.EncodeToString(b)
}

func generateSecret() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return hex.EncodeToString(b)
}

func hashAPIKey(apiKey string) string {
	h := hmac.New(sha256.New, []byte("ton-pay-router-secret"))
	h.Write([]byte(apiKey))
	return hex.EncodeToString(h.Sum(nil))
}
