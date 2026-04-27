package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/AZRV17/audio-book-app/internal/middleware"
	"github.com/AZRV17/audio-book-app/internal/repository"
)

type ProgressHandler struct {
	progressRepo *repository.ProgressRepository
	logger       *slog.Logger
}

func NewProgressHandler(progressRepo *repository.ProgressRepository, logger *slog.Logger) *ProgressHandler {
	return &ProgressHandler{progressRepo: progressRepo, logger: logger}
}

func (h *ProgressHandler) Save(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int64)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Не авторизован")
		return
	}

	var req struct {
		BookID   int64   `json:"book_id"`
		Position float64 `json:"position"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Некорректный запрос")
		return
	}

	if err := h.progressRepo.Save(r.Context(), userID, req.BookID, req.Position); err != nil {
		h.logger.Error("save progress failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Внутренняя ошибка сервера")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ProgressHandler) Get(w http.ResponseWriter, r *http.Request) {
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

	position, err := h.progressRepo.Get(r.Context(), userID, bookID)
	if err != nil {
		h.logger.Error("get progress failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Внутренняя ошибка сервера")
		return
	}

	writeJSON(w, http.StatusOK, map[string]float64{"position": position})
}
