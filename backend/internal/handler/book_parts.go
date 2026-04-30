package handler

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/AZRV17/audio-book-app/internal/domain"
	"github.com/AZRV17/audio-book-app/internal/repository"
)

type BookPartsHandler struct {
	partsRepo *repository.BookPartsRepository
	logger    *slog.Logger
	staticDir string
}

func NewBookPartsHandler(partsRepo *repository.BookPartsRepository, logger *slog.Logger, staticDir string) *BookPartsHandler {
	return &BookPartsHandler{partsRepo: partsRepo, logger: logger, staticDir: staticDir}
}

func (h *BookPartsHandler) UploadZip(w http.ResponseWriter, r *http.Request) {
	bookID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Некорректный ID")
		return
	}

	if err := r.ParseMultipartForm(500 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "Файл слишком большой (макс. 500MB)")
		return
	}

	file, _, err := r.FormFile("zip")
	if err != nil {
		writeError(w, http.StatusBadRequest, "Файл не найден в запросе")
		return
	}
	defer file.Close()

	buf, err := io.ReadAll(file)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Ошибка чтения файла")
		return
	}

	zr, err := zip.NewReader(bytes.NewReader(buf), int64(len(buf)))
	if err != nil {
		writeError(w, http.StatusBadRequest, "Некорректный ZIP-архив")
		return
	}

	var mp3Files []*zip.File
	for _, f := range zr.File {
		if !f.FileInfo().IsDir() && strings.EqualFold(filepath.Ext(f.Name), ".mp3") {
			mp3Files = append(mp3Files, f)
		}
	}

	if len(mp3Files) == 0 {
		writeError(w, http.StatusBadRequest, "В архиве не найдено MP3-файлов")
		return
	}

	sort.Slice(mp3Files, func(i, j int) bool {
		return mp3Files[i].Name < mp3Files[j].Name
	})

	dir := filepath.Join(h.staticDir, "audio", fmt.Sprintf("book_%d", bookID))
	if err := os.MkdirAll(dir, 0755); err != nil {
		writeError(w, http.StatusInternalServerError, "Внутренняя ошибка сервера")
		return
	}

	var filePaths []string
	for i, f := range mp3Files {
		filename := fmt.Sprintf("%03d_%s", i+1, filepath.Base(f.Name))
		dstPath := filepath.Join(dir, filename)

		rc, err := f.Open()
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Ошибка распаковки")
			return
		}

		dst, err := os.Create(dstPath)
		if err != nil {
			rc.Close()
			writeError(w, http.StatusInternalServerError, "Ошибка сохранения файла")
			return
		}

		_, err = io.Copy(dst, rc)
		rc.Close()
		dst.Close()
		if err != nil {
			writeError(w, http.StatusInternalServerError, "Ошибка записи файла")
			return
		}

		filePaths = append(filePaths, fmt.Sprintf("/static/audio/book_%d/%s", bookID, filename))
	}

	if err := h.partsRepo.SaveParts(r.Context(), bookID, filePaths); err != nil {
		h.logger.Error("save parts failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Внутренняя ошибка сервера")
		return
	}

	writeJSON(w, http.StatusOK, map[string]int{"parts": len(filePaths)})
}

func (h *BookPartsHandler) GetParts(w http.ResponseWriter, r *http.Request) {
	bookID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Некорректный ID")
		return
	}

	parts, err := h.partsRepo.FindByBook(r.Context(), bookID)
	if err != nil {
		h.logger.Error("get parts failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Внутренняя ошибка сервера")
		return
	}

	if parts == nil {
		parts = []*domain.BookPart{}
	}

	writeJSON(w, http.StatusOK, parts)
}
