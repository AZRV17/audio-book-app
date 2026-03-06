package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/AZRV17/audio-book-app/internal/app"
	"github.com/AZRV17/audio-book-app/internal/config"
	"github.com/AZRV17/audio-book-app/pkg/database"
	"github.com/AZRV17/audio-book-app/pkg/logger"
)

func main() {
	log := logger.New(os.Getenv("APP_ENV"))

	cfg := config.MustLoad(log)

	log = logger.New(cfg.Env)
	log.Info("configuration loaded", "env", cfg.Env, "addr", cfg.Server.Host+":"+cfg.Server.Port)

	dbCtx, dbCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer dbCancel()

	db, err := database.NewPostgresPool(dbCtx, cfg.Database.DSN)
	if err != nil {
		log.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	log.Info("database connection established")

	application := app.New(cfg, log, db)

	serverErr := make(chan error, 1)
	go func() {
		if err := application.Run(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErr <- err
		}
		close(serverErr)
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-quit:
		log.Info("received shutdown signal", "signal", sig)
	case err := <-serverErr:
		if err != nil {
			log.Error("server error", "error", err)
			os.Exit(1)
		}
	}

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := application.Stop(shutdownCtx); err != nil {
		log.Error("graceful shutdown failed", "error", err)
		os.Exit(1)
	}

	log.Info("server exited cleanly")
}

func init() {
	slog.SetDefault(slog.New(slog.NewTextHandler(os.Stdout, nil)))
}
