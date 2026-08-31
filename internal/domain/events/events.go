
package events

import "time"

type EventType string

const (
	PaymentInitiated    EventType = "payment.initiated"
	PaymentConfirmed    EventType = "payment.confirmed"
	SwapCompleted       EventType = "swap.completed"
	SettlementCompleted EventType = "settlement.completed"
	InvoiceExpired      EventType = "invoice.expired"
)

type Event struct {
	Type       EventType
	Payload    interface{}
	OccurredAt time.Time
	CorrelationID string
}
