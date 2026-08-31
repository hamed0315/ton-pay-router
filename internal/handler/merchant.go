
package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/ton-pay-router/core/internal/service"
)

type createInvoiceRequest struct {
	Amount         string                 `json:"amount"`
	SourceCurrency string                 `json:"source_currency"`
	DestCurrency   string                 `json:"dest_currency,omitempty"`
	DestAddress    string                 `json:"dest_address,omitempty"`
	CallbackURL    string                 `json:"callback_url"`
	ExpiresIn      int                    `json:"expires_in"`
	Metadata       map[string]interface{} `json:"metadata"`
}

type createInvoiceResponse struct {
	ID             string `json:"id"`
	Amount         string `json:"amount"`
	SourceCurrency string `json:"source_currency"`
	DestCurrency   string `json:"dest_currency"`
	Status         string `json:"status"`
	ExpiresAt      string `json:"expires_at"`
	PaymentLink    string `json:"payment_link"`
}

type registerMerchantRequest struct {
	Name               string `json:"name"`
	WebhookURL         string `json:"webhook_url"`
	SettlementAddress  string `json:"settlement_address"`
	SettlementCurrency string `json:"settlement_currency"`
}

func (h *Handler) CreateInvoice(w http.ResponseWriter, r *http.Request) {
	merchant, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found in context", http.StatusUnauthorized)
		return
	}

	idempotencyKey := r.Header.Get("Idempotency-Key")

	var req createInvoiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if req.Amount == "" || req.SourceCurrency == "" {
		http.Error(w, "amount and source_currency are required", http.StatusBadRequest)
		return
	}

	if req.DestCurrency == "" {
		req.DestCurrency = merchant.SettlementCurrency
	}
	if req.DestAddress == "" {
		req.DestAddress = merchant.SettlementAddress
	}

	if req.DestAddress == "" {
		http.Error(w, "destination address is required", http.StatusBadRequest)
		return
	}

	expiresIn := time.Duration(req.ExpiresIn) * time.Second
	if expiresIn <= 0 {
		expiresIn = 15 * time.Minute
	}

	createReq := service.CreateInvoiceRequest{
		MerchantID:     merchant.ID,
		Amount:         req.Amount,
		SourceCurrency: req.SourceCurrency,
		DestCurrency:   req.DestCurrency,
		DestAddress:    req.DestAddress,
		CallbackURL:    req.CallbackURL,
		IdempotencyKey: idempotencyKey,
		ExpiresIn:      expiresIn,
		Metadata:       req.Metadata,
	}

	inv, err := h.InvoiceService.Create(r.Context(), createReq)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to create invoice: %v", err), http.StatusInternalServerError)
		return
	}

	// Generate payment link
	paymentLink := fmt.Sprintf("https://t.me/%s?startapp=%s", h.Config.BotUsername, inv.ID)

	resp := createInvoiceResponse{
		ID:             inv.ID,
		Amount:         inv.Amount,
		SourceCurrency: inv.SourceCurrency,
		DestCurrency:   inv.DestCurrency,
		Status:         string(inv.Status),
		ExpiresAt:      inv.ExpiresAt.Format(time.RFC3339),
		PaymentLink:    paymentLink,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

func (h *Handler) GetInvoice(w http.ResponseWriter, r *http.Request) {
	merchant, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}

	invoiceID := r.PathValue("id")
	if invoiceID == "" {
		http.Error(w, "invoice id required", http.StatusBadRequest)
		return
	}

	inv, err := h.InvoiceService.GetByID(r.Context(), invoiceID)
	if err != nil {
		http.Error(w, "invoice not found", http.StatusNotFound)
		return
	}

	if inv.MerchantID != merchant.ID {
		http.Error(w, "invoice does not belong to merchant", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(inv)
}

func (h *Handler) RegisterMerchant(w http.ResponseWriter, r *http.Request) {
	var req registerMerchantRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if req.Name == "" || req.SettlementAddress == "" {
		http.Error(w, "name and settlement_address are required", http.StatusBadRequest)
		return
	}

	if req.SettlementCurrency == "" {
		req.SettlementCurrency = "TON"
	}

	merchant, apiKey, err := h.MerchantService.Register(r.Context(), service.RegisterMerchantRequest{
		Name:               req.Name,
		WebhookURL:         req.WebhookURL,
		SettlementAddress:  req.SettlementAddress,
		SettlementCurrency: req.SettlementCurrency,
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to register merchant: %v", err), http.StatusInternalServerError)
		return
	}

	resp := map[string]string{
		"id":                  merchant.ID,
		"name":                merchant.Name,
		"api_key":             apiKey,
		"settlement_address":  merchant.SettlementAddress,
		"settlement_currency": merchant.SettlementCurrency,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

type registerMerchantTGRequest struct {
	Name               string `json:"name"`
	WebhookURL         string `json:"webhook_url"`
	SettlementAddress  string `json:"settlement_address"`
	SettlementCurrency string `json:"settlement_currency"`
}

func (h *Handler) RegisterMerchantTG(w http.ResponseWriter, r *http.Request) {
	initData := r.Header.Get("X-Telegram-InitData")
	if initData == "" {
		http.Error(w, "missing telegram init data", http.StatusBadRequest)
		return
	}

	// TODO: extract user ID properly from initData
	telegramUserID := initData

	var req registerMerchantTGRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if req.Name == "" || req.SettlementAddress == "" {
		http.Error(w, "name and settlement_address are required", http.StatusBadRequest)
		return
	}
	if req.SettlementCurrency == "" {
		req.SettlementCurrency = "TON"
	}

	merchant, apiKey, err := h.MerchantService.Register(r.Context(), service.RegisterMerchantRequest{
		Name:               req.Name,
		WebhookURL:         req.WebhookURL,
		SettlementAddress:  req.SettlementAddress,
		SettlementCurrency: req.SettlementCurrency,
		TelegramUserID:     telegramUserID,
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to register merchant: %v", err), http.StatusInternalServerError)
		return
	}

	resp := map[string]string{
		"id":                  merchant.ID,
		"name":                merchant.Name,
		"api_key":             apiKey,
		"settlement_address":  merchant.SettlementAddress,
		"settlement_currency": merchant.SettlementCurrency,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}
