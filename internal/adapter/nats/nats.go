
package nats

import (
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/ton-pay-router/core/config"
)

func NewConn(cfg *config.Config) (*nats.Conn, error) {
	conn, err := nats.Connect(cfg.NATSURL,
		nats.Timeout(5*time.Second),
		nats.ReconnectWait(2*time.Second),
		nats.MaxReconnects(-1),
		nats.PingInterval(20*time.Second),
		nats.MaxPingsOutstanding(5),
	)
	if err != nil {
		return nil, fmt.Errorf("connect nats: %w", err)
	}
	return conn, nil
}
