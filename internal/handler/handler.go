
package handler

import (
	"github.com/ton-pay-router/core/config"
	"github.com/ton-pay-router/core/internal/port"
	"github.com/ton-pay-router/core/internal/service"
)

type Handler struct {
	Config                   *config.Config
	MerchantService          *service.MerchantService
	InvoiceService           *service.InvoiceService
	QuoteService             *service.QuoteService
	PaymentService           *service.PaymentService
	SettlementService        *service.SettlementService
	LedgerService            *service.LedgerService
	EscrowService            *service.EscrowService
	PairDiscoveryService     *service.PairDiscoveryService
	AuthService              *service.AuthService
	GatewayService           *service.GatewayService
	StatsService             *service.StatsService
	SettlementAddressService *service.SettlementAddressService
	SupportService           *service.SupportService
	Notifier                 port.Notifier
	WSHub                    *WSHub
}

func NewHandler(cfg *config.Config, merchantSvc *service.MerchantService, invoiceSvc *service.InvoiceService, quoteSvc *service.QuoteService, paymentSvc *service.PaymentService, settlementSvc *service.SettlementService, ledgerSvc *service.LedgerService, escrowSvc *service.EscrowService, pairDiscoverySvc *service.PairDiscoveryService, authSvc *service.AuthService, gatewaySvc *service.GatewayService, statsSvc *service.StatsService, settlementAddressSvc *service.SettlementAddressService, supportSvc *service.SupportService, notifier port.Notifier, wsHub *WSHub) *Handler {
	return &Handler{
		Config:                   cfg,
		MerchantService:          merchantSvc,
		InvoiceService:           invoiceSvc,
		QuoteService:             quoteSvc,
		PaymentService:           paymentSvc,
		SettlementService:        settlementSvc,
		LedgerService:            ledgerSvc,
		EscrowService:            escrowSvc,
		PairDiscoveryService:     pairDiscoverySvc,
		AuthService:              authSvc,
		GatewayService:           gatewaySvc,
		StatsService:             statsSvc,
		SettlementAddressService: settlementAddressSvc,
		SupportService:           supportSvc,
		Notifier:                 notifier,
		WSHub:                    wsHub,
	}
}
