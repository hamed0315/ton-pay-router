
package service

import (
	"context"
	"fmt"

	"github.com/ton-pay-router/core/internal/port"
)

type PairDiscoveryService struct {
	provider port.QuoteProvider
}

func NewPairDiscoveryService(provider port.QuoteProvider) *PairDiscoveryService {
	return &PairDiscoveryService{provider: provider}
}

type CurrencyPair struct {
	Source string `json:"source"`
	Dest   string `json:"dest"`
}

func (s *PairDiscoveryService) DiscoverPairs(ctx context.Context) ([]CurrencyPair, error) {
	// List of candidate source/dest currencies we support
	sources := []string{"USDT_TON", "USDC_BASE", "TON", "USDT_ETH", "USDC_ETH", "USDT_BNB", "USDC_POLYGON"}
	dests := []string{"USDC_BASE", "TON", "USDT_TON", "USDC_ETH", "USDT_ETH", "USDT_BNB", "USDC_POLYGON"}

	var available []CurrencyPair
	for _, src := range sources {
		for _, dst := range dests {
			if src == dst {
				continue
			}
			_, _, err := s.provider.GetQuote(ctx, port.QuoteRequest{
				SourceCurrency: src,
				DestCurrency:   dst,
				Amount:         "1000000", // small amount for test
			})
			if err == nil {
				available = append(available, CurrencyPair{Source: src, Dest: dst})
			} else {
				// ignore no quote or other errors
			}
		}
	}
	if len(available) == 0 {
		return nil, fmt.Errorf("no available pairs")
	}
	return available, nil
}
