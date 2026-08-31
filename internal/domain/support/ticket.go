
package support

import "time"

type Ticket struct {
	ID         string
	MerchantID string
	Subject    string
	Category   string
	Status     string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type Message struct {
	ID         string
	TicketID   string
	SenderType string // "merchant" or "support"
	Message    string
	CreatedAt  time.Time
}
