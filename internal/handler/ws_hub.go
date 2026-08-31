
package handler

import (
	"sync"

	"github.com/gorilla/websocket"
)

type WSMessage struct {
	Type string `json:"type"`
	Data interface{} `json:"data"`
}

type WSClient struct {
	conn *websocket.Conn
	send chan WSMessage
}

type WSHub struct {
	mu      sync.RWMutex
	clients map[string]map[*WSClient]bool // invoiceID -> clients
}

func NewWSHub() *WSHub {
	return &WSHub{
		clients: make(map[string]map[*WSClient]bool),
	}
}

func (h *WSHub) Register(invoiceID string, client *WSClient) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.clients[invoiceID] == nil {
		h.clients[invoiceID] = make(map[*WSClient]bool)
	}
	h.clients[invoiceID][client] = true
}

func (h *WSHub) Unregister(invoiceID string, client *WSClient) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if clients, ok := h.clients[invoiceID]; ok {
		if _, exists := clients[client]; exists {
			delete(clients, client)
			close(client.send)
		}
		if len(clients) == 0 {
			delete(h.clients, invoiceID)
		}
	}
}

func (h *WSHub) Broadcast(invoiceID string, msg WSMessage) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	if clients, ok := h.clients[invoiceID]; ok {
		for client := range clients {
			select {
			case client.send <- msg:
			default:
				go h.Unregister(invoiceID, client)
				client.conn.Close()
			}
		}
	}
}
