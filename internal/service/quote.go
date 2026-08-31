
package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/ton-pay-router/core/internal/domain/quote"
	"github.com/ton-pay-router/core/internal/port"
)

type QuoteService struct {
	repo     port.QuoteRepository
	provider port.QuoteProvider
}

func NewQuoteService(repo port.QuoteRepository, provider port.QuoteProvider) *QuoteService {
	return &QuoteService{repo: repo, provider: provider}
}

func (s *QuoteService) GetQuote(ctx context.Context, invoiceID, sourceCurrency, destCurrency, amount string, merchantFeePercent float64) (*quote.Quote, string, error) {
	req := port.QuoteRequest{
		SourceCurrency: sourceCurrency,
		DestCurrency:   destCurrency,
		Amount:         amount,
	}
	rawQuote, rawJSON, err := s.provider.GetQuote(ctx, req)
	if err != nil {
		return nil, "", fmt.Errorf("get raw quote: %w", err)
	}

	// تعیین اسپرد پویا بر اساس مبلغ
	spreadPercent := dynamicSpread(amount)

	// محاسبه نرخ نهایی با اسپرد
	finalRate := applySpread(rawQuote.RawRate, spreadPercent)

	// محاسبه مبلغ مقصد اولیه (بدون کارمزد ثابت)
	destAmountFloat, err := calculateDestAmount(amount, finalRate)
	if err != nil {
		return nil, "", err
	}

	// اعمال کارمزد ثابت درصدی
	feeAmount := destAmountFloat * merchantFeePercent / 100
	destAmountFloat -= feeAmount
	destAmount := strconv.FormatFloat(destAmountFloat, 'f', 6, 64)

	appliedSpreadStr := fmt.Sprintf("%.2f", spreadPercent)

	domainQuote := &quote.Quote{
		ID:            rawQuote.QuoteID,
		InvoiceID:     invoiceID,
		Provider:      rawQuote.Provider,
		QuoteID:       rawQuote.QuoteID,
		RawRate:       rawQuote.RawRate,
		AppliedSpread: appliedSpreadStr,
		FinalRate:     finalRate,
		BestRoute:     rawQuote.BestRoute,
		PriceImpact:   rawQuote.PriceImpact,
		RawQuote:      json.RawMessage(rawJSON),
		ValidUntil:    time.Now().UTC().Add(5 * time.Minute),
		CreatedAt:     time.Now().UTC(),
	}

	// Add fee fields if not in struct, we'll store in RawQuote JSON for now
	// We'll rely on Ledger for accounting

	domainQuote.ID = uuid.NewString()
	domainQuote.AppliedSpread = appliedSpreadStr
	domainQuote.FinalRate = finalRate
	domainQuote.RawQuote = json.RawMessage(rawJSON)
	domainQuote.ValidUntil = time.Now().UTC().Add(5 * time.Minute)
	domainQuote.CreatedAt = time.Now().UTC()

	if err := s.repo.Create(ctx, domainQuote); err != nil {
		return nil, "", fmt.Errorf("save quote: %w", err)
	}

	return domainQuote, destAmount, nil
}

func (s *QuoteService) GetByInvoice(ctx context.Context, invoiceID string) (*quote.Quote, error) {
	return s.repo.GetByInvoice(ctx, invoiceID)
}

func dynamicSpread(amount string) float64 {
	amt, _ := strconv.ParseFloat(amount, 64)
	switch {
	case amt < 50:
		return 0.3
	case amt < 500:
		return 0.5
	case amt < 5000:
		return 0.7
	default:
		return 1.0
	}
}

func applySpread(rawRate string, spreadPercent float64) string {
	rate, err := strconv.ParseFloat(rawRate, 64)
	if err != nil {
		return rawRate
	}
	final := rate * (1 - spreadPercent/100)
	return strconv.FormatFloat(final, 'f', 6, 64)
}

func calculateDestAmount(amount string, rate string) (float64, error) {
	amt, err := strconv.ParseFloat(amount, 64)
	if err != nil {
		return 0, err
	}
	r, err := strconv.ParseFloat(rate, 64)
	if err != nil {
		return 0, err
	}
	return amt * r, nil
}
