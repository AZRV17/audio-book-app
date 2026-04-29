package config

import (
	"log/slog"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Env            string
	Server         ServerConfig
	Database       DatabaseConfig
	JWT            JWTConfig
	GoogleBooksKey string
}

type JWTConfig struct {
	Secret string
}

type ServerConfig struct {
	Host         string
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

type DatabaseConfig struct {
	DSN string
}

func MustLoad(log *slog.Logger) *Config {
	_ = godotenv.Load()

	cfg := &Config{}

	cfg.Env = getEnvOrDefault("APP_ENV", "development")

	cfg.Server.Host = getEnvOrDefault("SERVER_HOST", "0.0.0.0")
	cfg.Server.Port = getEnvOrDefault("SERVER_PORT", "8080")
	cfg.Server.ReadTimeout = parseDuration(log, "SERVER_READ_TIMEOUT", "5s")
	cfg.Server.WriteTimeout = parseDuration(log, "SERVER_WRITE_TIMEOUT", "10s")

	cfg.Database.DSN = os.Getenv("DATABASE_URL")
	if cfg.Database.DSN == "" {
		log.Error("DATABASE_URL is not set")
		os.Exit(1)
	}

	cfg.JWT.Secret = os.Getenv("JWT_SECRET")
	if cfg.JWT.Secret == "" {
		log.Error("JWT_SECRET is not set")
		os.Exit(1)
	}

	cfg.GoogleBooksKey = os.Getenv("GOOGLE_BOOKS_API_KEY")

	return cfg
}

func getEnvOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func parseDuration(log *slog.Logger, key, def string) time.Duration {
	raw := getEnvOrDefault(key, def)
	d, err := time.ParseDuration(raw)
	if err != nil {
		log.Error("invalid duration in env", "key", key, "value", raw, "error", err)
		os.Exit(1)
	}
	return d
}
