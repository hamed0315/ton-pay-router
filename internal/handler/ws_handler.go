
package handler

import (
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // TODO: restrict in production
	},
}

func (h *Handler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	invoiceID := r.PathValue("id")
	if invoiceID == "" {
		http.Error(w, "invoice id required", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	client := &WSClient{
		conn: conn,
		send: make(chan WSMessage, 10),
	}

	h.WSHub.Register(invoiceID, client)

	go h.writePump(invoiceID, client)
	go h.readPump(invoiceID, client)
}

func (h *Handler) writePump(invoiceID string, client *WSClient) {
	defer func() {
		h.WSHub.Unregister(invoiceID, client)
		client.conn.Close()
	}()
	for msg := range client.send {
		if err := client.conn.WriteJSON(msg); err != nil {
			return
		}
	}
}

func (h *Handler) readPump(invoiceID string, client *WSClient) {
	defer func() {
		h.WSHub.Unregister(invoiceID, client)
		client.conn.Close()
	}()
	for {
		_, _, err := client.conn.ReadMessage()
		if err != nil {
			return
		}
	}
}
