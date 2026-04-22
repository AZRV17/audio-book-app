package app

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/AZRV17/audio-book-app/internal/config"
	"github.com/AZRV17/audio-book-app/internal/handler"
	"github.com/AZRV17/audio-book-app/internal/middleware"
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

	bookRepo := repository.NewBookRepository(db)
	genreRepo := repository.NewGenreRepository(db)
	bookHandler := handler.NewBookHandler(bookRepo, genreRepo, logger)
	adminHandler := handler.NewAdminHandler(bookRepo, logger, cfg.GoogleBooksKey, "./static")

	router := newRouter(authHandler, bookHandler, adminHandler, cfg.JWT.Secret)

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

func newRouter(authHandler *handler.AuthHandler, bookHandler *handler.BookHandler, adminHandler *handler.AdminHandler, jwtSecret string) http.Handler {
	r := chi.NewRouter()

	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Heartbeat("/health"))

	r.Handle("/static/*", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/login", authHandler.Login)

		r.Get("/books", bookHandler.GetBooks)
		r.Get("/books/{id}", bookHandler.GetBook)
		r.Get("/genres", bookHandler.GetGenres)

		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth(jwtSecret))
			r.Use(middleware.AdminOnly)
			r.Post("/admin/books", adminHandler.AddBook)
			r.Put("/admin/books/{id}", adminHandler.UpdateBook)
			r.Post("/admin/books/{id}/upload-audio", adminHandler.UploadAudio)
			r.Delete("/admin/books/{id}", adminHandler.DeleteBook)
		})
	})

	return r
}
