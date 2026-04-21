package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/AZRV17/audio-book-app/internal/domain"
)

type BookRepository struct {
	db *pgxpool.Pool
}

func NewBookRepository(db *pgxpool.Pool) *BookRepository {
	return &BookRepository{db: db}
}

func (r *BookRepository) FindAll(ctx context.Context, search string, genreID *int64) ([]*domain.Book, error) {
	query := `
		SELECT b.id, b.title, b.author, COALESCE(b.description, ''),
		       COALESCE(b.cover_url, ''), COALESCE(b.audio_url, ''),
		       b.genre_id, COALESCE(g.name, ''), b.created_at
		FROM books b
		LEFT JOIN genres g ON g.id = b.genre_id
		WHERE ($1 = '' OR b.title ILIKE '%' || $1 || '%' OR b.author ILIKE '%' || $1 || '%')
		  AND ($2::BIGINT IS NULL OR b.genre_id = $2)
		ORDER BY b.created_at DESC`

	rows, err := r.db.Query(ctx, query, search, genreID)
	if err != nil {
		return nil, fmt.Errorf("find books: %w", err)
	}
	defer rows.Close()

	var books []*domain.Book
	for rows.Next() {
		b := &domain.Book{}
		if err := rows.Scan(&b.ID, &b.Title, &b.Author, &b.Description,
			&b.CoverURL, &b.AudioURL, &b.GenreID, &b.Genre, &b.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan book: %w", err)
		}
		books = append(books, b)
	}

	return books, nil
}

func (r *BookRepository) FindByID(ctx context.Context, id int64) (*domain.Book, error) {
	b := &domain.Book{}

	err := r.db.QueryRow(ctx, `
		SELECT b.id, b.title, b.author, COALESCE(b.description, ''),
		       COALESCE(b.cover_url, ''), COALESCE(b.audio_url, ''),
		       b.genre_id, COALESCE(g.name, ''), b.created_at
		FROM books b
		LEFT JOIN genres g ON g.id = b.genre_id
		WHERE b.id = $1`, id,
	).Scan(&b.ID, &b.Title, &b.Author, &b.Description,
		&b.CoverURL, &b.AudioURL, &b.GenreID, &b.Genre, &b.CreatedAt)

	if err != nil {
		return nil, fmt.Errorf("find book by id: %w", err)
	}

	return b, nil
}
