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

func (r *BookRepository) Create(ctx context.Context, title, author, description, coverURL, audioURL string, genreID *int64) (*domain.Book, error) {
	b := &domain.Book{}

	err := r.db.QueryRow(ctx, `
		INSERT INTO books (title, author, description, cover_url, audio_url, genre_id)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, title, author, COALESCE(description, ''), COALESCE(cover_url, ''),
		          COALESCE(audio_url, ''), genre_id, created_at`,
		title, author, description, coverURL, audioURL, genreID,
	).Scan(&b.ID, &b.Title, &b.Author, &b.Description, &b.CoverURL, &b.AudioURL, &b.GenreID, &b.CreatedAt)

	if err != nil {
		return nil, fmt.Errorf("create book: %w", err)
	}

	return b, nil
}

func (r *BookRepository) Update(ctx context.Context, id int64, title, author, description, coverURL, audioURL string, genreID *int64) (*domain.Book, error) {
	b := &domain.Book{}

	err := r.db.QueryRow(ctx, `
		UPDATE books SET title=$1, author=$2, description=$3, cover_url=$4, audio_url=$5, genre_id=$6
		WHERE id=$7
		RETURNING id, title, author, COALESCE(description, ''), COALESCE(cover_url, ''),
		          COALESCE(audio_url, ''), genre_id, created_at`,
		title, author, description, coverURL, audioURL, genreID, id,
	).Scan(&b.ID, &b.Title, &b.Author, &b.Description, &b.CoverURL, &b.AudioURL, &b.GenreID, &b.CreatedAt)

	if err != nil {
		return nil, fmt.Errorf("update book: %w", err)
	}

	return b, nil
}

func (r *BookRepository) UpdateAudioURL(ctx context.Context, id int64, audioURL string) (*domain.Book, error) {
	b := &domain.Book{}

	err := r.db.QueryRow(ctx, `
		UPDATE books SET audio_url=$1 WHERE id=$2
		RETURNING id, title, author, COALESCE(description, ''), COALESCE(cover_url, ''),
		          COALESCE(audio_url, ''), genre_id, created_at`,
		audioURL, id,
	).Scan(&b.ID, &b.Title, &b.Author, &b.Description, &b.CoverURL, &b.AudioURL, &b.GenreID, &b.CreatedAt)

	if err != nil {
		return nil, fmt.Errorf("update audio url: %w", err)
	}

	return b, nil
}

func (r *BookRepository) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM books WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete book: %w", err)
	}
	return nil
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
