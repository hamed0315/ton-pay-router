
package quote

import (
	"encoding/json"
	"time"
)

type Quote struct {
	ID            string
	InvoiceID     string
	Provider      string
	QuoteID       string
	RawRate       string
	AppliedSpread string
	FinalRate     string
	BestRoute     string
	PriceImpact   string
	RawQuote      json.RawMessage
	ValidUntil    time.Time
	CreatedAt     time.Time
}
