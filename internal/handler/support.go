
package handler

import (
	"encoding/json"
	"net/http"
)

type createTicketRequest struct {
	Subject  string `json:"subject"`
	Category string `json:"category"`
}

type addMessageRequest struct {
	Message string `json:"message"`
}

func (h *Handler) CreateTicket(w http.ResponseWriter, r *http.Request) {
	merchant, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}

	var req createTicketRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if req.Subject == "" || req.Category == "" {
		http.Error(w, "subject and category required", http.StatusBadRequest)
		return
	}

	ticket, err := h.SupportService.CreateTicket(r.Context(), merchant.ID, req.Subject, req.Category)
	if err != nil {
		http.Error(w, "failed to create ticket", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(ticket)
}

func (h *Handler) ListTickets(w http.ResponseWriter, r *http.Request) {
	merchant, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}

	tickets, err := h.SupportService.ListTicketsByMerchant(r.Context(), merchant.ID)
	if err != nil {
		http.Error(w, "failed to list tickets", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tickets)
}

func (h *Handler) AddMessage(w http.ResponseWriter, r *http.Request) {
	_, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}
	ticketID := r.PathValue("id")
	if ticketID == "" {
		http.Error(w, "ticket id required", http.StatusBadRequest)
		return
	}

	var req addMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if req.Message == "" {
		http.Error(w, "message required", http.StatusBadRequest)
		return
	}

	if err := h.SupportService.AddMessage(r.Context(), ticketID, "merchant", req.Message); err != nil {
		http.Error(w, "failed to add message", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("message sent"))
}

func (h *Handler) ListMessages(w http.ResponseWriter, r *http.Request) {
	_, ok := getMerchantFromContext(r.Context())
	if !ok {
		http.Error(w, "merchant not found", http.StatusUnauthorized)
		return
	}
	ticketID := r.PathValue("id")
	if ticketID == "" {
		http.Error(w, "ticket id required", http.StatusBadRequest)
		return
	}

	messages, err := h.SupportService.ListMessages(r.Context(), ticketID)
	if err != nil {
		http.Error(w, "failed to list messages", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func (h *Handler) GetFAQ(w http.ResponseWriter, r *http.Request) {
	faqs, err := h.SupportService.GetFAQ(r.Context())
	if err != nil {
		http.Error(w, "failed to get faq", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(faqs)
}
