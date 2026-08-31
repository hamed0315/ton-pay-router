
package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"fmt"

	"github.com/ton-pay-router/core/internal/adapter/omniston"
	"github.com/ton-pay-router/core/internal/port"
	common "github.com/ton-pay-router/core/proto/stonfi/common/v1/types"
	omniTypes "github.com/ton-pay-router/core/proto/stonfi/omni/v1beta8/types"
	"github.com/ton-pay-router/core/proto/stonfi/omni/v1beta8/trader/chains"
)

type EscrowService struct {
	omnistonClient *omniston.Client
	quoteRepo      port.QuoteRepository
}

func NewEscrowService(client *omniston.Client, quoteRepo port.QuoteRepository) *EscrowService {
	return &EscrowService{
		omnistonClient: client,
		quoteRepo:      quoteRepo,
	}
}

func (s *EscrowService) BuildTonEscrowTransfer(ctx context.Context, invoiceID string, ownerSrcAddress string, traderDstAddress string) (*omniTypes.TonTransaction, error) {
	q, err := s.quoteRepo.GetByInvoice(ctx, invoiceID)
	if err != nil {
		return nil, fmt.Errorf("get quote: %w", err)
	}
	if q.QuoteID == "" {
		return nil, fmt.Errorf("quote not found for invoice")
	}

	secret := make([]byte, 32)
	if _, err := rand.Read(secret); err != nil {
		return nil, fmt.Errorf("generate secret: %w", err)
	}
	hash := sha256.Sum256(secret)

	req := &chains.BuildTonEscrowTransferRequest{
		QuoteId: q.QuoteID,
		OwnerSrcAddress: &common.ChainAddress{
			Chain: &common.ChainAddress_Ton{Ton: ownerSrcAddress},
		},
		TraderDstAddress: &common.ChainAddress{
			Chain: &common.ChainAddress_Ton{Ton: traderDstAddress},
		},
		GasExcessAddress: &common.ChainAddress{
			Chain: &common.ChainAddress_Ton{Ton: ownerSrcAddress},
		},
		RefundSrcAddress: &common.ChainAddress{
			Chain: &common.ChainAddress_Ton{Ton: ownerSrcAddress},
		},
		HtlcSecrets: &omniTypes.HtlcSecrets{
			SecretMode: &omniTypes.HtlcSecrets_Provided{
				Provided: &omniTypes.SecretModeProvided{
					Hashes: [][]byte{hash[:]},
				},
			},
		},
	}

	return s.omnistonClient.BuildTonEscrowTransfer(ctx, req)
}

// BuildEvmOrderPayload builds an unsigned EVM order payload for signing.
func (s *EscrowService) BuildEvmOrderPayload(ctx context.Context, invoiceID, ownerSrcAddress, traderDstAddress string) (*chains.EvmOrderPayloadResponse, error) {
	q, err := s.quoteRepo.GetByInvoice(ctx, invoiceID)
	if err != nil {
		return nil, fmt.Errorf("get quote: %w", err)
	}
	if q.QuoteID == "" {
		return nil, fmt.Errorf("quote not found for invoice")
	}

	// Generate random secret and hash for HTLC
	secret := make([]byte, 32)
	if _, err := rand.Read(secret); err != nil {
		return nil, fmt.Errorf("generate secret: %w", err)
	}
	hash := sha256.Sum256(secret)

	req := &chains.BuildEvmOrderPayloadRequest{
		QuoteId: q.QuoteID,
		OwnerSrcAddress: &common.ChainAddress{
			Chain: &common.ChainAddress_Base{Base: ownerSrcAddress},
		},
		TraderDstAddress: &common.ChainAddress{
			Chain: &common.ChainAddress_Ton{Ton: traderDstAddress},
		},
		HtlcSecrets: &omniTypes.HtlcSecrets{
			SecretMode: &omniTypes.HtlcSecrets_Provided{
				Provided: &omniTypes.SecretModeProvided{
					Hashes: [][]byte{hash[:]},
				},
			},
		},
	}

	return s.omnistonClient.BuildEvmOrderPayload(ctx, req)
}
