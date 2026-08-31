
package handler

import (
	"encoding/json"
	"net/http"

)

type updateProfileRequest struct {
	Name               string  `json:"name"`
	WebhookURL         string  `json:"webhook_url"`
	SettlementAddress  string  `json:"settlement_address"`
	SettlementCurrency string  `json:"settlement_currency"`
	FeePercent         *float64 `json:"fee_percent"`
}

func (h *Handler) GetMe(w http.ResponseWriter, r *http.Request) {
	merchant, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}

	// Hide sensitive fields
	resp := map[string]interface{}{
		"id":                  merchant.ID,
		"name":                merchant.Name,
		"email":               merchant.Email,
		"telegram_user_id":    merchant.TelegramUserID,
		"settlement_address":  merchant.SettlementAddress,
		"settlement_currency": merchant.SettlementCurrency,
		"webhook_url":         merchant.WebhookURL,
		"fee_percent":         merchant.FeePercent,
		"role":                merchant.Role,
		"is_active":           merchant.IsActive,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	merchant, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}

	var req updateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	if req.Name != "" {
		merchant.Name = req.Name
	}
	if req.SettlementAddress != "" {
		merchant.SettlementAddress = req.SettlementAddress
	}
	if req.SettlementCurrency != "" {
		merchant.SettlementCurrency = req.SettlementCurrency
	}
	if req.WebhookURL != "" {
		merchant.WebhookURL = req.WebhookURL
	}
	if req.FeePercent != nil {
		merchant.FeePercent = req.FeePercent
	}

	if err := h.MerchantService.UpdateProfile(r.Context(), merchant); err != nil {
		http.Error(w, "failed to update profile", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func (h *Handler) UpdateWebhook(w http.ResponseWriter, r *http.Request) {
	merchant, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}

	var req struct {
		WebhookURL string `json:"webhook_url"`
		WebhookSecret string `json:"webhook_secret"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	if req.WebhookURL != "" {
		merchant.WebhookURL = req.WebhookURL
	}
	if req.WebhookSecret != "" {
		merchant.WebhookSecret = req.WebhookSecret
	}

	if err := h.MerchantService.UpdateProfile(r.Context(), merchant); err != nil {
		http.Error(w, "failed to update webhook", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
