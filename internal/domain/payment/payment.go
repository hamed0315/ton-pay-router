
package payment

import "time"

type Status string

const (
	StatusPending   Status = "pending"
	StatusCompleted Status = "completed"
	StatusFailed    Status = "failed"
)

type Payment struct {
	ID        string
	InvoiceID string
	TxHashSrc string
	TxHashDst string
	AmountSrc string
	AmountDst string
	Status    Status
	Provider  string
	CreatedAt time.Time
	UpdatedAt time.Time
}
