package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/AZRV17/audio-book-app/internal/repository"
)

type AdminHandler struct {
	bookRepo       *repository.BookRepository
	logger         *slog.Logger
	googleBooksKey string
}

func NewAdminHandler(bookRepo *repository.BookRepository, logger *slog.Logger, googleBooksKey string) *AdminHandler {
	return &AdminHandler{bookRepo: bookRepo, logger: logger, googleBooksKey: googleBooksKey}
}

type addBookRequest struct {
	Title    string `json:"title"`
	Author   string `json:"author"`
	AudioURL string `json:"audio_url"`
	GenreID  *int64 `json:"genre_id"`
}

type googleBooksResponse struct {
	Items []struct {
		VolumeInfo struct {
			Title       string   `json:"title"`
			Authors     []string `json:"authors"`
			Description string   `json:"description"`
			ImageLinks  struct {
				Thumbnail string `json:"thumbnail"`
			} `json:"imageLinks"`
		} `json:"volumeInfo"`
	} `json:"items"`
}

func (h *AdminHandler) fetchGoogleBooks(ctx context.Context, title, author string) (resAuthor, description, coverURL string) {
	query := "intitle:" + title
	if author != "" {
		query += "+inauthor:" + author
	}
	apiURL := fmt.Sprintf(
		"https://www.googleapis.com/books/v1/volumes?q=%s&key=%s&maxResults=1&langRestrict=ru",
		url.QueryEscape(query), h.googleBooksKey,
	)

	h.logger.Info("google books request", "url", apiURL)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, apiURL, nil)
	if err != nil {
		h.logger.Error("google books: create request failed", "error", err)
		return "", "", ""
	}

	var resp *http.Response
	for attempt := 0; attempt < 3; attempt++ {
		var err error
		resp, err = http.DefaultClient.Do(req.Clone(ctx))
		if err != nil {
			h.logger.Error("google books: http request failed", "error", err)
			return "", "", ""
		}
		h.logger.Info("google books response", "status", resp.StatusCode, "attempt", attempt+1)
		if resp.StatusCode != http.StatusServiceUnavailable && resp.StatusCode != http.StatusTooManyRequests {
			break
		}
		resp.Body.Close()
		resp = nil
		if attempt < 2 {
			time.Sleep(time.Duration(attempt+1) * 500 * time.Millisecond)
		}
	}
	if resp == nil {
		return "", "", ""
	}
	defer resp.Body.Close()

	var result googleBooksResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		h.logger.Error("google books: decode failed", "error", err)
		return "", "", ""
	}

	h.logger.Info("google books items", "count", len(result.Items))

	if len(result.Items) == 0 {
		return "", "", ""
	}

	info := result.Items[0].VolumeInfo
	if len(info.Authors) > 0 {
		resAuthor = info.Authors[0]
	}
	description = info.Description
	coverURL = info.ImageLinks.Thumbnail
	if coverURL != "" {
		coverURL = "https" + coverURL[4:]
	}

	h.logger.Info("google books result", "author", resAuthor, "cover", coverURL)

	return resAuthor, description, coverURL
}

func (h *AdminHandler) AddBook(w http.ResponseWriter, r *http.Request) {
	var req addBookRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Некорректный запрос")
		return
	}

	if req.Title == "" {
		writeError(w, http.StatusBadRequest, "Название книги обязательно")
		return
	}

	author, description, coverURL := h.fetchGoogleBooks(r.Context(), req.Title, req.Author)
	if author == "" && description == "" && coverURL == "" {
		writeError(w, http.StatusBadGateway, "Не удалось получить данные из Google Books, попробуйте позже")
		return
	}
	if req.Author != "" {
		author = req.Author
	}

	book, err := h.bookRepo.Create(r.Context(), req.Title, author, description, coverURL, req.AudioURL, req.GenreID)
	if err != nil {
		h.logger.Error("add book failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Внутренняя ошибка сервера")
		return
	}

	writeJSON(w, http.StatusCreated, book)
}

func (h *AdminHandler) DeleteBook(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Некорректный ID")
		return
	}

	if err := h.bookRepo.Delete(r.Context(), id); err != nil {
		h.logger.Error("delete book failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Внутренняя ошибка сервера")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
