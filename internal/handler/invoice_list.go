
package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
)

func (h *Handler) ListInvoices(w http.ResponseWriter, r *http.Request) {
	merchant, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}

	limit := 20
	offset := 0
	if l := r.URL.Query().Get("limit"); l != "" {
		if val, err := strconv.Atoi(l); err == nil {
			limit = val
		}
	}
	if o := r.URL.Query().Get("offset"); o != "" {
		if val, err := strconv.Atoi(o); err == nil {
			offset = val
		}
	}

	invoices, err := h.InvoiceService.ListByMerchant(r.Context(), merchant.ID, limit, offset)
	if err != nil {
		http.Error(w, "failed to list invoices: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(invoices)
}
