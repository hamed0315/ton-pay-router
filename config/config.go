
package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	HTTPPort        string
	PostgresDSN     string
	RedisAddr       string
	RedisPassword   string
	RedisDB         int
	NATSURL         string
	JWTSecret       string
	Environment     string
	ShutdownTimeout time.Duration
	BotToken        string
	BotUsername     string
}

func Load() (*Config, error) {
	cfg := &Config{
		HTTPPort:        getEnv("HTTP_PORT", "8080"),
		PostgresDSN:     getEnv("POSTGRES_DSN", "postgres://user:pass@localhost:5433/tonpay?sslmode=disable"),
		RedisAddr:       getEnv("REDIS_ADDR", "localhost:6380"),
		RedisPassword:   getEnv("REDIS_PASSWORD", ""),
		RedisDB:         getEnvInt("REDIS_DB", 0),
		NATSURL:         getEnv("NATS_URL", "nats://localhost:4222"),
		JWTSecret:       getEnv("JWT_SECRET", "change-me"),
		Environment:     getEnv("ENVIRONMENT", "development"),
		ShutdownTimeout: time.Duration(getEnvInt("SHUTDOWN_TIMEOUT_SECONDS", 10)) * time.Second,
		BotToken:        getEnv("BOT_TOKEN", ""),
		BotUsername:     getEnv("BOT_USERNAME", ""),
	}
	return cfg, nil
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return fallback
}
