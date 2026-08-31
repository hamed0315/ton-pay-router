
package omniston

import (
	"context"
	"crypto/tls"
	"fmt"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/ton-pay-router/core/proto/stonfi/omni/v1beta8/trader"
	"github.com/ton-pay-router/core/proto/stonfi/omni/v1beta8/trader/chains"
	"github.com/ton-pay-router/core/proto/stonfi/omni/v1beta8/types"
)

type Client struct {
	conn     *grpc.ClientConn
	quoteRpc trader.QuoteRpcClient
	orderRpc trader.OrderRpcClient
	swapRpc  trader.SwapRpcClient
	evmRpc   chains.EvmRpcClient
	tonRpc   chains.TonRpcClient
}

type Config struct {
	Endpoint string
	Insecure bool
}

func NewClient(ctx context.Context, cfg Config) (*Client, error) {
	var opts []grpc.DialOption
	if cfg.Insecure {
		opts = append(opts, grpc.WithTransportCredentials(insecure.NewCredentials()))
	} else {
		opts = append(opts, grpc.WithTransportCredentials(credentials.NewTLS(&tls.Config{})))
	}
	opts = append(opts, grpc.WithNoProxy())

	conn, err := grpc.DialContext(ctx, cfg.Endpoint, opts...)
	if err != nil {
		return nil, fmt.Errorf("dial omniston: %w", err)
	}

	return &Client{
		conn:     conn,
		quoteRpc: trader.NewQuoteRpcClient(conn),
		orderRpc: trader.NewOrderRpcClient(conn),
		swapRpc:  trader.NewSwapRpcClient(conn),
		evmRpc:   chains.NewEvmRpcClient(conn),
		tonRpc:   chains.NewTonRpcClient(conn),
	}, nil
}

func (c *Client) Close() error {
	return c.conn.Close()
}

func (c *Client) GetQuote(ctx context.Context, req *types.QuoteRequest) (*types.Quote, error) {
	stream, err := c.quoteRpc.Quote(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("open quote stream: %w", err)
	}

	for {
		event, err := stream.Recv()
		if err != nil {
			return nil, fmt.Errorf("receive quote event: %w", err)
		}
		switch e := event.Event.(type) {
		case *trader.QuoteEvent_QuoteUpdated:
			return e.QuoteUpdated, nil
		case *trader.QuoteEvent_NoQuote:
			return nil, fmt.Errorf("no quote available")
		case *trader.QuoteEvent_Ack:
			// continue waiting
		}
	}
}

func (c *Client) BuildEvmOrderPayload(ctx context.Context, req *chains.BuildEvmOrderPayloadRequest) (*chains.EvmOrderPayloadResponse, error) {
	return c.evmRpc.BuildOrderPayload(ctx, req)
}

func (c *Client) RegisterSignedOrder(ctx context.Context, req *trader.RegisterSignedOrderRequest) error {
	_, err := c.orderRpc.RegisterSignedOrder(ctx, req)
	return err
}

func (c *Client) TrackOrder(ctx context.Context, req *trader.TrackOrderRequest) (trader.OrderRpc_TrackClient, error) {
	return c.orderRpc.Track(ctx, req)
}

func (c *Client) BuildTonEscrowTransfer(ctx context.Context, req *chains.BuildTonEscrowTransferRequest) (*types.TonTransaction, error) {
	return c.tonRpc.BuildEscrowTransfer(ctx, req)
}
