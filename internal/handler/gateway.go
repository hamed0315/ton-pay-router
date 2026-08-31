
package handler

import (
	"encoding/json"
	"net/http"
)

type createGatewayRequest struct {
	Name string `json:"name"`
}

func (h *Handler) CreateGateway(w http.ResponseWriter, r *http.Request) {
	merchant, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}

	var req createGatewayRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if req.Name == "" {
		req.Name = "Default"
	}

	gateway, apiKey, err := h.GatewayService.Create(r.Context(), merchant.ID, req.Name)
	if err != nil {
		http.Error(w, "failed to create gateway: "+err.Error(), http.StatusInternalServerError)
		return
	}

	resp := map[string]interface{}{
		"id":         gateway.ID,
		"name":       gateway.Name,
		"api_key":    apiKey,
		"is_active":  gateway.IsActive,
		"created_at": gateway.CreatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

func (h *Handler) ListGateways(w http.ResponseWriter, r *http.Request) {
	merchant, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}

	gateways, err := h.GatewayService.ListByMerchant(r.Context(), merchant.ID)
	if err != nil {
		http.Error(w, "failed to list gateways: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Don't return API key hash; can return masked or nothing.
	result := make([]map[string]interface{}, 0)
	for _, g := range gateways {
		result = append(result, map[string]interface{}{
			"id":         g.ID,
			"name":       g.Name,
			"is_active":  g.IsActive,
			"created_at": g.CreatedAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) RevokeGateway(w http.ResponseWriter, r *http.Request) {
	merchant, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}
	gatewayID := r.PathValue("id")
	if gatewayID == "" {
		http.Error(w, "gateway id required", http.StatusBadRequest)
		return
	}

	// Check ownership: fetch gateways and ensure this ID belongs to merchant.
	gateways, err := h.GatewayService.ListByMerchant(r.Context(), merchant.ID)
	if err != nil {
		http.Error(w, "failed to list gateways", http.StatusInternalServerError)
		return
	}
	found := false
	for _, g := range gateways {
		if g.ID == gatewayID {
			found = true
			break
		}
	}
	if !found {
		http.Error(w, "gateway not found", http.StatusNotFound)
		return
	}

	if err := h.GatewayService.Revoke(r.Context(), gatewayID); err != nil {
		http.Error(w, "failed to revoke gateway", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("gateway revoked"))
}

func (h *Handler) ToggleGateway(w http.ResponseWriter, r *http.Request) {
	merchant, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}
	gatewayID := r.PathValue("id")
	if gatewayID == "" {
		http.Error(w, "gateway id required", http.StatusBadRequest)
		return
	}

	gateway, err := h.GatewayService.Toggle(r.Context(), gatewayID, merchant.ID)
	if err != nil {
		http.Error(w, "failed to toggle gateway", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(gateway)
}
