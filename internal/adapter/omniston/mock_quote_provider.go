
package omniston

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/ton-pay-router/core/internal/domain/quote"
	"github.com/ton-pay-router/core/internal/port"
)

type MockQuoteProvider struct{}

func NewMockQuoteProvider() port.QuoteProvider {
	return &MockQuoteProvider{}
}

func (p *MockQuoteProvider) GetQuote(ctx context.Context, req port.QuoteRequest) (*quote.Quote, json.RawMessage, error) {
	rawRate := "0.5"
	q := &quote.Quote{
		Provider:    "mock",
		QuoteID:     fmt.Sprintf("mock-%d", time.Now().UnixNano()),
		RawRate:     rawRate,
		BestRoute:   "direct",
		PriceImpact: "0",
	}
	return q, nil, nil
}
