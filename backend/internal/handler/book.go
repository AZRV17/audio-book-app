package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/AZRV17/audio-book-app/internal/domain"
	"github.com/AZRV17/audio-book-app/internal/repository"
)

type BookHandler struct {
	bookRepo  *repository.BookRepository
	genreRepo *repository.GenreRepository
	logger    *slog.Logger
}

func NewBookHandler(bookRepo *repository.BookRepository, genreRepo *repository.GenreRepository, logger *slog.Logger) *BookHandler {
	return &BookHandler{bookRepo: bookRepo, genreRepo: genreRepo, logger: logger}
}

func (h *BookHandler) GetBooks(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")

	var genreID *int64
	if g := r.URL.Query().Get("genre_id"); g != "" {
		id, err := strconv.ParseInt(g, 10, 64)
		if err == nil {
			genreID = &id
		}
	}

	books, err := h.bookRepo.FindAll(r.Context(), search, genreID)
	if err != nil {
		h.logger.Error("get books failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Внутренняя ошибка сервера")
		return
	}

	if books == nil {
		books = make([]*domain.Book, 0)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}

func (h *BookHandler) GetBook(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Некорректный ID")
		return
	}

	book, err := h.bookRepo.FindByID(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "Книга не найдена")
		return
	}

	writeJSON(w, http.StatusOK, book)
}

func (h *BookHandler) GetGenres(w http.ResponseWriter, r *http.Request) {
	genres, err := h.genreRepo.FindAll(r.Context())
	if err != nil {
		h.logger.Error("get genres failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Внутренняя ошибка сервера")
		return
	}

	if genres == nil {
		genres = make([]*domain.Genre, 0)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(genres)
}
