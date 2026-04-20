package app

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/AZRV17/audio-book-app/internal/config"
	"github.com/AZRV17/audio-book-app/internal/handler"
	"github.com/AZRV17/audio-book-app/internal/repository"
	"github.com/AZRV17/audio-book-app/internal/service"
)

type App struct {
	logger *slog.Logger
	db     *pgxpool.Pool
	server *http.Server
	cfg    *config.Config
}

func New(cfg *config.Config, logger *slog.Logger, db *pgxpool.Pool) *App {
	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo, cfg.JWT.Secret)
	authHandler := handler.NewAuthHandler(authService, logger)

	router := newRouter(authHandler)

	srv := &http.Server{
		Addr:         fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
	}

	return &App{
		logger: logger,
		db:     db,
		server: srv,
		cfg:    cfg,
	}
}

func (a *App) Run() error {
	a.logger.Info("starting HTTP server", "addr", a.server.Addr)
	return a.server.ListenAndServe()
}

func (a *App) Stop(ctx context.Context) error {
	a.logger.Info("shutting down HTTP server")
	if err := a.server.Shutdown(ctx); err != nil {
		return fmt.Errorf("server shutdown: %w", err)
	}
	a.db.Close()
	a.logger.Info("shutdown complete")
	return nil
}

func newRouter(authHandler *handler.AuthHandler) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Heartbeat("/health"))

	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/auth/register", authHandler.Register)
	})

	return r
}
