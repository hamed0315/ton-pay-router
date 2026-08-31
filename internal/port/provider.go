
package port

import (
	"context"
	"encoding/json"

	"github.com/ton-pay-router/core/internal/domain/quote"
)

type QuoteProvider interface {
	GetQuote(ctx context.Context, req QuoteRequest) (*quote.Quote, json.RawMessage, error)
}

type SwapProvider interface {
	BuildSwap(ctx context.Context, req SwapRequest) (*SwapResponse, error)
	GetStatus(ctx context.Context, swapID string) (string, error)
}

type QuoteRequest struct {
	SourceCurrency string
	DestCurrency   string
	Amount         string
}

type SwapRequest struct {
	QuoteID      string
	SourceAddress string
	DestAddress   string
}

type SwapResponse struct {
	TxHash string
	SwapID string
	RawTx  string
}
