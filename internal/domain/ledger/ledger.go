
package ledger

import "time"

type AccountType string

const (
	AccountSpread    AccountType = "spread"
	AccountFee       AccountType = "fee"
	AccountSettlement AccountType = "settlement"
	AccountRefund    AccountType = "refund"
)

type LedgerEntry struct {
	ID          string
	Type        string
	Amount      string
	Currency    string
	InvoiceID   string
	AccountType AccountType
	Debit       string
	Credit      string
	CreatedAt   time.Time
}
