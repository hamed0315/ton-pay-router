
package port

import (
	"context"

	"github.com/ton-pay-router/core/internal/domain/gateway"
	"github.com/ton-pay-router/core/internal/domain/invoice"
	"github.com/ton-pay-router/core/internal/domain/ledger"
	"github.com/ton-pay-router/core/internal/domain/merchant"
	"github.com/ton-pay-router/core/internal/domain/payment"
	"github.com/ton-pay-router/core/internal/domain/quote"
	"github.com/ton-pay-router/core/internal/domain/settlement"
	"github.com/ton-pay-router/core/internal/domain/settlementaddress"
	"github.com/ton-pay-router/core/internal/domain/support"
)

type MerchantRepository interface {
	Create(ctx context.Context, m *merchant.Merchant) error
	GetByID(ctx context.Context, id string) (*merchant.Merchant, error)
	GetByAPIKeyHash(ctx context.Context, hash string) (*merchant.Merchant, error)
	GetByTelegramID(ctx context.Context, telegramID string) (*merchant.Merchant, error)
	GetByEmail(ctx context.Context, email string) (*merchant.Merchant, error)
	GetByGoogleID(ctx context.Context, googleID string) (*merchant.Merchant, error)
	Update(ctx context.Context, m *merchant.Merchant) error
}

type InvoiceRepository interface {
	Create(ctx context.Context, inv *invoice.Invoice) error
	GetByID(ctx context.Context, id string) (*invoice.Invoice, error)
	GetByIdempotencyKey(ctx context.Context, merchantID, idempotencyKey string) (*invoice.Invoice, error)
	UpdateStatus(ctx context.Context, id string, status invoice.Status) error
	UpdateDestAmount(ctx context.Context, id string, destAmount string) error
	ListByMerchant(ctx context.Context, merchantID string, limit, offset int) ([]*invoice.Invoice, error)
}

type PaymentRepository interface {
	Create(ctx context.Context, p *payment.Payment) error
	GetByID(ctx context.Context, id string) (*payment.Payment, error)
	Update(ctx context.Context, p *payment.Payment) error
}

type SettlementRepository interface {
	Create(ctx context.Context, s *settlement.Settlement) error
	GetByID(ctx context.Context, id string) (*settlement.Settlement, error)
	Update(ctx context.Context, s *settlement.Settlement) error
}

type LedgerRepository interface {
	Create(ctx context.Context, entry *ledger.LedgerEntry) error
	ListByInvoice(ctx context.Context, invoiceID string) ([]*ledger.LedgerEntry, error)
}

type QuoteRepository interface {
	Create(ctx context.Context, q *quote.Quote) error
	GetByID(ctx context.Context, id string) (*quote.Quote, error)
	GetByInvoice(ctx context.Context, invoiceID string) (*quote.Quote, error)
}

type GatewayRepository interface {
	Create(ctx context.Context, g *gateway.Gateway) error
	GetByAPIKeyHash(ctx context.Context, hash string) (*gateway.Gateway, error)
	ListByMerchant(ctx context.Context, merchantID string) ([]*gateway.Gateway, error)
	Update(ctx context.Context, g *gateway.Gateway) error
	Delete(ctx context.Context, id string) error
}

type StatsRepository interface {
	GetDashboardStats(ctx context.Context, merchantID string) (map[string]interface{}, error)
	GetRecentTransactions(ctx context.Context, merchantID string, limit int) ([]map[string]interface{}, error)
}

type SettlementAddressRepository interface {
	Create(ctx context.Context, sa *settlementaddress.SettlementAddress) error
	ListByMerchant(ctx context.Context, merchantID string) ([]*settlementaddress.SettlementAddress, error)
	Delete(ctx context.Context, id string) error
}

type SupportRepository interface {
	CreateTicket(ctx context.Context, t *support.Ticket) error
	GetTicketByID(ctx context.Context, id string) (*support.Ticket, error)
	ListTicketsByMerchant(ctx context.Context, merchantID string) ([]*support.Ticket, error)
	AddMessage(ctx context.Context, m *support.Message) error
	ListMessagesByTicket(ctx context.Context, ticketID string) ([]*support.Message, error)
	GetFAQ(ctx context.Context) ([]map[string]interface{}, error)
}
