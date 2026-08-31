
package handler

import (
	"encoding/json"
	"net/http"
)

type addSettlementAddressRequest struct {
	Address  string `json:"address"`
	Currency string `json:"currency"`
}

func (h *Handler) AddSettlementAddress(w http.ResponseWriter, r *http.Request) {
	merchant, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}

	var req addSettlementAddressRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if req.Address == "" || req.Currency == "" {
		http.Error(w, "address and currency are required", http.StatusBadRequest)
		return
	}

	sa, err := h.SettlementAddressService.Create(r.Context(), merchant.ID, req.Address, req.Currency)
	if err != nil {
		http.Error(w, "failed to add address", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(sa)
}

func (h *Handler) ListSettlementAddresses(w http.ResponseWriter, r *http.Request) {
	merchant, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}

	list, err := h.SettlementAddressService.ListByMerchant(r.Context(), merchant.ID)
	if err != nil {
		http.Error(w, "failed to list addresses", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(list)
}

func (h *Handler) DeleteSettlementAddress(w http.ResponseWriter, r *http.Request) {
	merchant, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "id required", http.StatusBadRequest)
		return
	}

	// Check ownership (simplified)
	list, _ := h.SettlementAddressService.ListByMerchant(r.Context(), merchant.ID)
	found := false
	for _, sa := range list {
		if sa.ID == id {
			found = true
			break
		}
	}
	if !found {
		http.Error(w, "address not found", http.StatusNotFound)
		return
	}

	if err := h.SettlementAddressService.Delete(r.Context(), id); err != nil {
		http.Error(w, "failed to delete", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("deleted"))
}
