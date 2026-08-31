
package omniston

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/emptypb"

	common "github.com/ton-pay-router/core/proto/stonfi/common/v1/types"
	"github.com/ton-pay-router/core/proto/stonfi/omni/v1beta8/types"

	"github.com/ton-pay-router/core/internal/domain/quote"
	"github.com/ton-pay-router/core/internal/port"
)

type QuoteProvider struct {
	client *Client
}

func NewQuoteProvider(client *Client) port.QuoteProvider {
	return &QuoteProvider{client: client}
}

func (p *QuoteProvider) GetQuote(ctx context.Context, req port.QuoteRequest) (*quote.Quote, json.RawMessage, error) {
	inputAsset, err := assetIDFromString(req.SourceCurrency)
	if err != nil {
		return nil, nil, fmt.Errorf("parse input asset: %w", err)
	}
	outputAsset, err := assetIDFromString(req.DestCurrency)
	if err != nil {
		return nil, nil, fmt.Errorf("parse output asset: %w", err)
	}

	quoteReq := &types.QuoteRequest{
		InputAsset:  inputAsset,
		OutputAsset: outputAsset,
		Amount: &types.QuoteRequest_InputUnits{
			InputUnits: req.Amount,
		},
		SettlementParams: []*types.SettlementParams{
			{
				Params: &types.SettlementParams_Order{
					Order: &types.OrderSettlementParams{},
				},
			},
		},
	}

	omniQuote, err := p.client.GetQuote(ctx, quoteReq)
	if err != nil {
		return nil, nil, err
	}

	inputUnits, _ := strconv.ParseFloat(omniQuote.InputUnits, 64)
	outputUnits, _ := strconv.ParseFloat(omniQuote.OutputUnits, 64)
	rawRate := "0"
	if inputUnits > 0 {
		rawRate = strconv.FormatFloat(outputUnits/inputUnits, 'f', 6, 64)
	}

	rawJSON, err := protojson.Marshal(omniQuote)
	if err != nil {
		return nil, nil, fmt.Errorf("marshal quote: %w", err)
	}

	domainQuote := &quote.Quote{
		ID:            omniQuote.QuoteId,
		InvoiceID:     "",
		Provider:      "omniston",
		QuoteID:       omniQuote.QuoteId,
		RawRate:       rawRate,
		AppliedSpread: "0",
		FinalRate:     rawRate,
		BestRoute:     "",
		PriceImpact:   "0",
		RawQuote:      json.RawMessage(rawJSON),
		ValidUntil:    time.Now().UTC().Add(5 * time.Minute),
		CreatedAt:     time.Now().UTC(),
	}

	return domainQuote, json.RawMessage(rawJSON), nil
}

func assetIDFromString(currency string) (*common.AssetId, error) {
	switch currency {
	case "USDC_BASE":
		return &common.AssetId{
			Chain: &common.AssetId_Base{
				Base: &common.EvmAssetId{
					Kind: &common.EvmAssetId_Erc20{
						Erc20: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
					},
				},
			},
		}, nil
	case "TON":
		return &common.AssetId{
			Chain: &common.AssetId_Ton{
				Ton: &common.TonAssetId{
					Kind: &common.TonAssetId_Native{
						Native: &emptypb.Empty{},
					},
				},
			},
		}, nil
	case "USDT_TON":
		return &common.AssetId{
			Chain: &common.AssetId_Ton{
				Ton: &common.TonAssetId{
					Kind: &common.TonAssetId_Jetton{
						Jetton: "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
					},
				},
			},
		}, nil
	case "USDT_ETH":
		return &common.AssetId{
			Chain: &common.AssetId_Ethereum{
				Ethereum: &common.EvmAssetId{
					Kind: &common.EvmAssetId_Erc20{
						Erc20: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
					},
				},
			},
		}, nil
	case "USDC_ETH":
		return &common.AssetId{
			Chain: &common.AssetId_Ethereum{
				Ethereum: &common.EvmAssetId{
					Kind: &common.EvmAssetId_Erc20{
						Erc20: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
					},
				},
			},
		}, nil
	case "USDT_BNB":
		return &common.AssetId{
			Chain: &common.AssetId_Bnb{
				Bnb: &common.EvmAssetId{
					Kind: &common.EvmAssetId_Erc20{
						Erc20: "0x55d398326f99059fF775485246999027B3197955",
					},
				},
			},
		}, nil
	case "USDC_POLYGON":
		return &common.AssetId{
			Chain: &common.AssetId_Polygon{
				Polygon: &common.EvmAssetId{
					Kind: &common.EvmAssetId_Erc20{
						Erc20: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
					},
				},
			},
		}, nil
	default:
		return nil, fmt.Errorf("unsupported currency: %s", currency)
	}
}
