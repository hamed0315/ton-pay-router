
package handler

import (
	"encoding/json"
	"net/http"
)

type buildEscrowRequest struct {
	InvoiceID     string `json:"invoice_id"`
	OwnerAddress  string `json:"owner_address"`
	TraderDstAddress string `json:"trader_dst_address"`
}

func (h *Handler) BuildTonEscrow(w http.ResponseWriter, r *http.Request) {
	var req buildEscrowRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if req.InvoiceID == "" || req.OwnerAddress == "" || req.TraderDstAddress == "" {
		http.Error(w, "invoice_id, owner_address, trader_dst_address are required", http.StatusBadRequest)
		return
	}

	tx, err := h.EscrowService.BuildTonEscrowTransfer(r.Context(), req.InvoiceID, req.OwnerAddress, req.TraderDstAddress)
	if err != nil {
		http.Error(w, "failed to build escrow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tx)
}
