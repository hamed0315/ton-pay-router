
package merchant

import "time"

type Merchant struct {
	ID                 string
	Name               string
	APIKeyHash         string
	WebhookURL         string
	WebhookSecret      string
	SettlementAddress  string
	SettlementCurrency string
	TelegramUserID     string
	Email              string
	PasswordHash       string
	GoogleID           string
	QRSession          string
	QRExpiresAt        *time.Time
	Role               string
	RiskLevel          string
	SpreadOverride     *float64
	FeePercent         *float64
	AllowedNetworks    []string
	SettlementPolicy   string
	IsActive           bool
	CreatedAt          time.Time
	UpdatedAt          time.Time
}
