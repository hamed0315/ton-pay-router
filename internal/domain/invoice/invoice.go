
package invoice

import (
	"encoding/json"
	"time"
)

type Status string

const (
	StatusPending   Status = "pending"
	StatusPaid      Status = "paid"
	StatusExpired   Status = "expired"
	StatusFailed    Status = "failed"
	StatusSettled   Status = "settled"
	StatusCancelled Status = "cancelled"
)

type Invoice struct {
	ID             string
	MerchantID     string
	Amount         string
	SourceCurrency string
	DestCurrency   string
	DestAmount     string
	DestAddress    string
	Status         Status
	CallbackURL    string
	IdempotencyKey string
	QuoteSnapshot  json.RawMessage
	Metadata       json.RawMessage
	ExpiresAt      time.Time
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
