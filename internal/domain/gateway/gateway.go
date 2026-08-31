
package gateway

import "time"

type Gateway struct {
	ID         string
	MerchantID string
	Name       string
	APIKeyHash string
	IsActive   bool
	CreatedAt  time.Time
	UpdatedAt  time.Time
}
