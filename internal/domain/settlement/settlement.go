
package settlement

import "time"

type Status string

const (
	StatusPending   Status = "pending"
	StatusCompleted Status = "completed"
	StatusFailed    Status = "failed"
)

type Settlement struct {
	ID            string
	InvoiceID     string
	TxHashSrc     string
	TxHashDst     string
	AmountSrc     string
	AmountDst     string
	Status        Status
	Confirmations int
	GasUsed       string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}
