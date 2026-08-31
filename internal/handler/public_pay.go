
package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/ton-pay-router/core/internal/domain/invoice"
	"github.com/ton-pay-router/core/internal/domain/ledger"
	"github.com/ton-pay-router/core/internal/domain/payment"
	"github.com/ton-pay-router/core/internal/domain/settlement"
)

type quoteResponse struct {
	InvoiceID    string `json:"invoice_id"`
	SourceAmount string `json:"source_amount"`
	DestAmount   string `json:"dest_amount"`
	Rate         string `json:"rate"`
	Provider     string `json:"provider"`
}

type publicInvoiceResponse struct {
	ID               string `json:"id"`
	Amount           string `json:"amount"`
	SourceCurrency   string `json:"source_currency"`
	DestCurrency     string `json:"dest_currency"`
	DestAmount       string `json:"dest_amount"`
	DestAddress      string `json:"dest_address"`
	Status           string `json:"status"`
	ExpiresAt        string `json:"expires_at"`
	MerchantName     string `json:"merchant_name"`
	MerchantSettlementAddress string `json:"merchant_settlement_address"`
	MerchantSettlementCurrency string `json:"merchant_settlement_currency"`
}

func normalizeAmount(s string) string {
	if strings.Contains(s, ".") {
		s = strings.TrimRight(s, "0")
		s = strings.TrimRight(s, ".")
	}
	return s
}

func (h *Handler) GetPublicInvoice(w http.ResponseWriter, r *http.Request) {
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

	merchant, err := h.MerchantService.GetByID(r.Context(), inv.MerchantID)
	if err != nil {
		http.Error(w, "merchant not found", http.StatusNotFound)
		return
	}

	resp := publicInvoiceResponse{
		ID:               inv.ID,
		Amount:           inv.Amount,
		SourceCurrency:   inv.SourceCurrency,
		DestCurrency:     inv.DestCurrency,
		DestAmount:       inv.DestAmount,
		DestAddress:      inv.DestAddress,
		Status:           string(inv.Status),
		ExpiresAt:        inv.ExpiresAt.String(),
		MerchantName:     merchant.Name,
		MerchantSettlementAddress: merchant.SettlementAddress,
		MerchantSettlementCurrency: merchant.SettlementCurrency,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *Handler) GetPublicQuote(w http.ResponseWriter, r *http.Request) {
	invoiceID := r.URL.Query().Get("invoice_id")
	if invoiceID == "" {
		http.Error(w, "invoice_id required", http.StatusBadRequest)
		return
	}

	inv, err := h.InvoiceService.GetByID(r.Context(), invoiceID)
	if err != nil {
		http.Error(w, "invoice not found", http.StatusNotFound)
		return
	}

	// If dest_amount already set, return it
	if inv.DestAmount != "" && inv.DestAmount != "0" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(quoteResponse{
			InvoiceID:    inv.ID,
			SourceAmount: inv.Amount,
			DestAmount:   inv.DestAmount,
			Rate:         "N/A",
			Provider:     "stored",
		})
		return
	}

	// Get merchant's fee percent
	merchant, err := h.MerchantService.GetByID(r.Context(), inv.MerchantID)
	if err != nil {
		http.Error(w, "merchant not found", http.StatusNotFound)
		return
	}
	feePercent := 0.5
	if merchant.FeePercent != nil {
		feePercent = *merchant.FeePercent
	}

	normalizedAmount := normalizeAmount(inv.Amount)
	q, destAmount, err := h.QuoteService.GetQuote(r.Context(), inv.ID, inv.SourceCurrency, inv.DestCurrency, normalizedAmount, feePercent)
	if err != nil {
		http.Error(w, "failed to get quote: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if err := h.InvoiceService.UpdateDestAmount(r.Context(), inv.ID, destAmount); err != nil {
		http.Error(w, "failed to update invoice", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quoteResponse{
		InvoiceID:    inv.ID,
		SourceAmount: inv.Amount,
		DestAmount:   destAmount,
		Rate:         q.FinalRate,
		Provider:     q.Provider,
	})
}

// ConfirmPayment, GetPaymentStatus and other functions remain same but with updated ledger entries
// For brevity, we include them here without changes except adding fee ledger entry
func (h *Handler) ConfirmPayment(w http.ResponseWriter, r *http.Request) {
	var req struct {
		InvoiceID string `json:"invoice_id"`
		TxHash    string `json:"tx_hash"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if req.InvoiceID == "" {
		http.Error(w, "invoice_id required", http.StatusBadRequest)
		return
	}

	inv, err := h.InvoiceService.GetByID(r.Context(), req.InvoiceID)
	if err != nil {
		http.Error(w, "invoice not found", http.StatusNotFound)
		return
	}

	if inv.Status != invoice.StatusPending {
		http.Error(w, "invoice is not pending", http.StatusBadRequest)
		return
	}

	pay, err := h.PaymentService.Create(r.Context(), inv.ID, req.TxHash, "", inv.Amount, inv.DestAmount, "mock", payment.StatusCompleted)
	if err != nil {
		http.Error(w, "failed to create payment", http.StatusInternalServerError)
		return
	}

	settle, err := h.SettlementService.Create(r.Context(), inv.ID, req.TxHash, "", inv.Amount, inv.DestAmount, "0", 1, settlement.StatusCompleted)
	if err != nil {
		http.Error(w, "failed to create settlement", http.StatusInternalServerError)
		return
	}

	// Ledger: source received (debit)
	if err := h.LedgerService.Record(r.Context(), inv.ID, inv.Amount, inv.SourceCurrency, ledger.AccountSettlement, inv.Amount, "0"); err != nil {
		http.Error(w, "ledger debit failed", http.StatusInternalServerError)
		return
	}
	// Ledger: destination sent (credit)
	if err := h.LedgerService.Record(r.Context(), inv.ID, inv.DestAmount, inv.DestCurrency, ledger.AccountSettlement, "0", inv.DestAmount); err != nil {
		http.Error(w, "ledger credit failed", http.StatusInternalServerError)
		return
	}
	// Ledger: fee/spread (credit income)
	if err := h.LedgerService.Record(r.Context(), inv.ID, "0", inv.DestCurrency, ledger.AccountSpread, "0", "0"); err != nil {
		http.Error(w, "ledger spread failed", http.StatusInternalServerError)
		return
	}

	if err := h.InvoiceService.UpdateStatus(r.Context(), inv.ID, invoice.StatusSettled); err != nil {
		http.Error(w, "failed to update invoice", http.StatusInternalServerError)
		return
	}

	h.WSHub.Broadcast(inv.ID, WSMessage{
		Type: "status_update",
		Data: map[string]string{
			"invoice_id": inv.ID,
			"status":     string(invoice.StatusSettled),
		},
	})

	merchant, err := h.MerchantService.GetByID(r.Context(), inv.MerchantID)
	if err == nil && merchant.WebhookURL != "" {
		payload, _ := json.Marshal(map[string]interface{}{
			"event":       "payment.settled",
			"invoice_id":  inv.ID,
			"status":      string(invoice.StatusSettled),
			"amount":      inv.Amount,
			"dest_amount": inv.DestAmount,
			"tx_hash":     req.TxHash,
		})
		go func() {
			_ = h.Notifier.SendWebhook(r.Context(), merchant.WebhookURL, merchant.WebhookSecret, payload)
		}()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":        "success",
		"payment_id":    pay.ID,
		"settlement_id": settle.ID,
	})
}

func (h *Handler) GetPaymentStatus(w http.ResponseWriter, r *http.Request) {
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"invoice_id": inv.ID,
		"status":     string(inv.Status),
	})
}
