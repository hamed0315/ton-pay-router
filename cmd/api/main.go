
package main

import (
	"context"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"go.uber.org/fx"

	"github.com/ton-pay-router/core/config"
	"github.com/ton-pay-router/core/internal/adapter/nats"
	omnistonadapter "github.com/ton-pay-router/core/internal/adapter/omniston"
	"github.com/ton-pay-router/core/internal/adapter/postgres"
	redisadapter "github.com/ton-pay-router/core/internal/adapter/redis"
	"github.com/ton-pay-router/core/internal/adapter/webhook"
	"github.com/ton-pay-router/core/internal/handler"
	custommiddleware "github.com/ton-pay-router/core/internal/middleware"
	"github.com/ton-pay-router/core/internal/service"
)

func NewRouter(h *handler.Handler, rl *custommiddleware.RateLimiter) *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(15 * time.Second))
	r.Use(handler.CorsMiddleware)

	publicRateLimit := rl.Limit(100, time.Minute, custommiddleware.IPKey)

	r.Get("/health", handler.Health)

	// Auth routes
	r.Post("/v2/auth/register", h.RegisterEmail)
	r.Post("/v2/auth/login", h.LoginEmail)

	// Merchant registration (legacy)
	registerLimit := rl.Limit(10, time.Minute, custommiddleware.IPKey)
	r.With(registerLimit).Post("/v2/merchants/register", h.RegisterMerchant)
	r.With(registerLimit).Post("/v2/merchants/register-tg", h.RegisterMerchantTG)

	// Public payment endpoints
	r.Group(func(r chi.Router) {
		r.Use(publicRateLimit)
		r.Get("/pay/{id}", h.GetPublicInvoice)
		r.Get("/api/pay/quote", h.GetPublicQuote)
		r.Post("/api/pay/confirm", h.ConfirmPayment)
		r.Get("/api/pay/status/{id}", h.GetPaymentStatus)
		r.Get("/ws/pay/{id}", h.HandleWebSocket)
		r.Post("/api/pay/build-escrow", h.BuildTonEscrow)
		r.Post("/api/pay/build-evm-order", h.BuildEvmOrder)
		r.Get("/api/pay/pairs", h.GetAvailablePairs)
	})

	// Merchant API (requires auth)
	merchantRateLimit := rl.Limit(100, time.Minute, custommiddleware.APIKeyKey)
	r.Route("/v2", func(r chi.Router) {
		r.Group(func(r chi.Router) {
			r.Use(h.AuthMiddleware)
			r.Use(merchantRateLimit)

			// Invoices
			r.Post("/invoices", h.CreateInvoice)
			r.Get("/invoices", h.ListInvoices)
			r.Get("/invoices/{id}", h.GetInvoice)

			// Gateways
			r.Post("/gateways", h.CreateGateway)
			r.Get("/gateways", h.ListGateways)
			r.Delete("/gateways/{id}", h.RevokeGateway)
			r.Post("/gateways/{id}/toggle", h.ToggleGateway)

			// Stats
			r.Get("/stats", h.GetStats)
			r.Get("/stats/transactions", h.GetRecentTransactions)

			// Settlement Addresses
			r.Post("/settlement/addresses", h.AddSettlementAddress)
			r.Get("/settlement/addresses", h.ListSettlementAddresses)
			r.Delete("/settlement/addresses/{id}", h.DeleteSettlementAddress)

			// Support
			r.Post("/support/tickets", h.CreateTicket)
			r.Get("/support/tickets", h.ListTickets)
			r.Post("/support/tickets/{id}/messages", h.AddMessage)
			r.Get("/support/tickets/{id}/messages", h.ListMessages)
			r.Get("/support/faq", h.GetFAQ)

			// Merchant settings
			r.Get("/merchants/me", h.GetMe)
			r.Put("/settings/profile", h.UpdateProfile)
			r.Put("/settings/webhook", h.UpdateWebhook)
		})
	})

	return r
}

func NewHTTPServer(cfg *config.Config, r *chi.Mux) *http.Server {
	return &http.Server{
		Addr:    ":" + cfg.HTTPPort,
		Handler: r,
	}
}

func RegisterHooks(lc fx.Lifecycle, s *http.Server) {
	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			go s.ListenAndServe()
			return nil
		},
		OnStop: func(ctx context.Context) error {
			return s.Shutdown(ctx)
		},
	})
}

func NewOmnistonClient(cfg *config.Config) (*omnistonadapter.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return omnistonadapter.NewClient(ctx, omnistonadapter.Config{
		Endpoint: "omni-grpc-sandbox.ston.fi:443",
		Insecure: false,
	})
}

func main() {
	fx.New(
		fx.Provide(
			config.Load,
			NewRouter,
			NewHTTPServer,
			postgres.NewPool,
			redisadapter.NewClient,
			nats.NewConn,
			postgres.NewMerchantRepository,
			postgres.NewInvoiceRepository,
			postgres.NewPaymentRepository,
			postgres.NewSettlementRepository,
			postgres.NewLedgerRepository,
			postgres.NewQuoteRepository,
			postgres.NewGatewayRepository,
			postgres.NewStatsRepository,
			postgres.NewSettlementAddressRepository,
			postgres.NewSupportRepository,
			webhook.NewWebhookNotifier,
			NewOmnistonClient,
			omnistonadapter.NewQuoteProvider,
			service.NewMerchantService,
			service.NewInvoiceService,
			service.NewPaymentService,
			service.NewSettlementService,
			service.NewLedgerService,
			service.NewQuoteService,
			service.NewEscrowService,
			service.NewPairDiscoveryService,
			service.NewAuthService,
			service.NewGatewayService,
			service.NewStatsService,
			service.NewSettlementAddressService,
			service.NewSupportService,
			handler.NewHandler,
			handler.NewWSHub,
			custommiddleware.NewRateLimiter,
		),
		fx.Invoke(RegisterHooks),
	).Run()
}
