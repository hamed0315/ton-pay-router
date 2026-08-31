
package middleware

import (
	"fmt"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"
)

type RateLimiter struct {
	client *redis.Client
}

func NewRateLimiter(client *redis.Client) *RateLimiter {
	return &RateLimiter{client: client}
}

func (rl *RateLimiter) Limit(limit int, window time.Duration, keyFunc func(r *http.Request) string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			key := keyFunc(r)
			if key == "" {
				next.ServeHTTP(w, r)
				return
			}

			ctx := r.Context()
			redisKey := fmt.Sprintf("rate:%s", key)

			count, err := rl.client.Incr(ctx, redisKey).Result()
			if err != nil {
				// If Redis error, allow request (fail open) or block? For security, fail closed.
				http.Error(w, "rate limit error", http.StatusInternalServerError)
				return
			}

			if count == 1 {
				// Set expiry on first request in window
				rl.client.Expire(ctx, redisKey, window)
			}

			if count > int64(limit) {
				http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func IPKey(r *http.Request) string {
	// In production, consider X-Forwarded-For etc.
	ip := r.RemoteAddr
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		ip = forwarded
	}
	return ip
}

func APIKeyKey(r *http.Request) string {
	return r.Header.Get("X-API-Key")
}
