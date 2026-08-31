
package handler

import (
	"encoding/json"
	"net/http"
)

type buildEvmOrderRequest struct {
	InvoiceID        string `json:"invoice_id"`
	OwnerSrcAddress  string `json:"owner_src_address"`
	TraderDstAddress string `json:"trader_dst_address"`
}

func (h *Handler) BuildEvmOrder(w http.ResponseWriter, r *http.Request) {
	var req buildEvmOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if req.InvoiceID == "" || req.OwnerSrcAddress == "" || req.TraderDstAddress == "" {
		http.Error(w, "invoice_id, owner_src_address, trader_dst_address are required", http.StatusBadRequest)
		return
	}

	resp, err := h.EscrowService.BuildEvmOrderPayload(r.Context(), req.InvoiceID, req.OwnerSrcAddress, req.TraderDstAddress)
	if err != nil {
		http.Error(w, "failed to build EVM order: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
