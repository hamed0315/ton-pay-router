
package port

import (
	"context"

	"github.com/ton-pay-router/core/internal/domain/events"
)

type EventBus interface {
	Publish(ctx context.Context, event events.Event) error
	Subscribe(ctx context.Context, subject string, handler func(events.Event)) error
}
