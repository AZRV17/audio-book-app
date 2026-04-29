package handler

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/AZRV17/audio-book-app/internal/domain"
	"github.com/AZRV17/audio-book-app/internal/middleware"
	"github.com/AZRV17/audio-book-app/internal/repository"
)

type FavoritesHandler struct {
	favRepo *repository.FavoritesRepository
	logger  *slog.Logger
}

func NewFavoritesHandler(favRepo *repository.FavoritesRepository, logger *slog.Logger) *FavoritesHandler {
	return &FavoritesHandler{favRepo: favRepo, logger: logger}
}

func (h *FavoritesHandler) Add(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int64)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Не авторизован")
		return
	}

	bookID, err := strconv.ParseInt(chi.URLParam(r, "book_id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Некорректный ID книги")
		return
	}

	if err := h.favRepo.Add(r.Context(), userID, bookID); err != nil {
		h.logger.Error("add favorite failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Внутренняя ошибка сервера")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *FavoritesHandler) Remove(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int64)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Не авторизован")
		return
	}

	bookID, err := strconv.ParseInt(chi.URLParam(r, "book_id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Некорректный ID книги")
		return
	}

	if err := h.favRepo.Remove(r.Context(), userID, bookID); err != nil {
		h.logger.Error("remove favorite failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Внутренняя ошибка сервера")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *FavoritesHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int64)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Не авторизован")
		return
	}

	books, err := h.favRepo.FindAll(r.Context(), userID)
	if err != nil {
		h.logger.Error("list favorites failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Внутренняя ошибка сервера")
		return
	}

	if books == nil {
		books = []*domain.Book{}
	}

	writeJSON(w, http.StatusOK, books)
}

func (h *FavoritesHandler) Check(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int64)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Не авторизован")
		return
	}

	bookID, err := strconv.ParseInt(chi.URLParam(r, "book_id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Некорректный ID книги")
		return
	}

	isFav, err := h.favRepo.IsFavorite(r.Context(), userID, bookID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Внутренняя ошибка сервера")
		return
	}

	writeJSON(w, http.StatusOK, map[string]bool{"is_favorite": isFav})
}
