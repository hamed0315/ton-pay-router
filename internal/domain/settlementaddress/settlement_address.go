
package settlementaddress

import "time"

type SettlementAddress struct {
	ID         string
	MerchantID string
	Address    string
	Currency   string
	IsActive   bool
	CreatedAt  time.Time
	UpdatedAt  time.Time
}
