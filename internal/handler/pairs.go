
package handler

import (
	"encoding/json"
	"net/http"
)

func (h *Handler) GetAvailablePairs(w http.ResponseWriter, r *http.Request) {
	pairs, err := h.PairDiscoveryService.DiscoverPairs(r.Context())
	if err != nil {
		http.Error(w, "failed to discover pairs: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pairs)
}
