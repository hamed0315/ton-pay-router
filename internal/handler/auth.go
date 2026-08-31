
package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ton-pay-router/core/internal/service"
)

type registerRequest struct {
	Name               string `json:"name"`
	Email              string `json:"email"`
	Password           string `json:"password"`
	WebhookURL         string `json:"webhook_url"`
	SettlementAddress  string `json:"settlement_address"`
	SettlementCurrency string `json:"settlement_currency"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResponse struct {
	Token     string `json:"token"`
	MerchantID string `json:"merchant_id"`
	Role      string `json:"role"`
}

func (h *Handler) RegisterEmail(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if req.Name == "" || req.Email == "" || req.Password == "" || req.SettlementAddress == "" {
		http.Error(w, "name, email, password, settlement_address are required", http.StatusBadRequest)
		return
	}
	if req.SettlementCurrency == "" {
		req.SettlementCurrency = "TON"
	}

	merchant, _, err := h.MerchantService.Register(r.Context(), service.RegisterMerchantRequest{
		Name:               req.Name,
		Email:              req.Email,
		Password:           req.Password,
		WebhookURL:         req.WebhookURL,
		SettlementAddress:  req.SettlementAddress,
		SettlementCurrency: req.SettlementCurrency,
	})
	if err != nil {
		http.Error(w, "failed to register: "+err.Error(), http.StatusInternalServerError)
		return
	}

	token, err := h.AuthService.GenerateToken(merchant.ID, merchant.Role)
	if err != nil {
		http.Error(w, "failed to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(authResponse{
		Token:      token,
		MerchantID: merchant.ID,
		Role:       merchant.Role,
	})
}

func (h *Handler) LoginEmail(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if req.Email == "" || req.Password == "" {
		http.Error(w, "email and password are required", http.StatusBadRequest)
		return
	}

	merchant, err := h.MerchantService.LoginWithEmail(r.Context(), req.Email, req.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	token, err := h.AuthService.GenerateToken(merchant.ID, merchant.Role)
	if err != nil {
		http.Error(w, "failed to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(authResponse{
		Token:      token,
		MerchantID: merchant.ID,
		Role:       merchant.Role,
	})
}
