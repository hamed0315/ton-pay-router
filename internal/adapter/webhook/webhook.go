
package webhook

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"

	"github.com/ton-pay-router/core/internal/port"
)

type WebhookNotifier struct {
	client *http.Client
}

func NewWebhookNotifier() port.Notifier {
	return &WebhookNotifier{
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

func (n *WebhookNotifier) SendWebhook(ctx context.Context, url, secret string, payload []byte) error {
	if url == "" {
		return nil
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("create webhook request: %w", err)
	}

	signature := signPayload(payload, secret)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-TONPAY-Signature", signature)

	resp, err := n.client.Do(req)
	if err != nil {
		return fmt.Errorf("send webhook: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("webhook returned status %d", resp.StatusCode)
	}
	return nil
}

func (n *WebhookNotifier) SendTelegram(ctx context.Context, chatID, message string) error {
	return nil
}

func signPayload(payload []byte, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write(payload)
	return hex.EncodeToString(h.Sum(nil))
}
