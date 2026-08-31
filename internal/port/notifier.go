
package port

import "context"

type Notifier interface {
	SendWebhook(ctx context.Context, url, secret string, payload []byte) error
	SendTelegram(ctx context.Context, chatID, message string) error
}
