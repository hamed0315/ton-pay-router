
package service

import (
	"context"

	"github.com/ton-pay-router/core/internal/port"
)

type StatsService struct {
	repo port.StatsRepository
}

func NewStatsService(repo port.StatsRepository) *StatsService {
	return &StatsService{repo: repo}
}

func (s *StatsService) GetDashboard(ctx context.Context, merchantID string) (map[string]interface{}, error) {
	return s.repo.GetDashboardStats(ctx, merchantID)
}

func (s *StatsService) GetRecentTransactions(ctx context.Context, merchantID string, limit int) ([]map[string]interface{}, error) {
	if limit <= 0 {
		limit = 10
	}
	return s.repo.GetRecentTransactions(ctx, merchantID, limit)
}
