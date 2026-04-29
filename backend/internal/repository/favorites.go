package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/AZRV17/audio-book-app/internal/domain"
)

type FavoritesRepository struct {
	db *pgxpool.Pool
}

func NewFavoritesRepository(db *pgxpool.Pool) *FavoritesRepository {
	return &FavoritesRepository{db: db}
}

func (r *FavoritesRepository) Add(ctx context.Context, userID, bookID int64) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO favorites (user_id, book_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
		userID, bookID,
	)
	if err != nil {
		return fmt.Errorf("add favorite: %w", err)
	}
	return nil
}

func (r *FavoritesRepository) Remove(ctx context.Context, userID, bookID int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM favorites WHERE user_id=$1 AND book_id=$2`, userID, bookID)
	if err != nil {
		return fmt.Errorf("remove favorite: %w", err)
	}
	return nil
}

func (r *FavoritesRepository) FindAll(ctx context.Context, userID int64) ([]*domain.Book, error) {
	rows, err := r.db.Query(ctx, `
		SELECT b.id, b.title, b.author, COALESCE(b.description, ''),
		       COALESCE(b.cover_url, ''), COALESCE(b.audio_url, ''),
		       b.genre_id, COALESCE(g.name, ''), b.created_at
		FROM favorites f
		JOIN books b ON b.id = f.book_id
		LEFT JOIN genres g ON g.id = b.genre_id
		WHERE f.user_id = $1
		ORDER BY f.created_at DESC`, userID,
	)
	if err != nil {
		return nil, fmt.Errorf("find favorites: %w", err)
	}
	defer rows.Close()

	var books []*domain.Book
	for rows.Next() {
		b := &domain.Book{}
		if err := rows.Scan(&b.ID, &b.Title, &b.Author, &b.Description,
			&b.CoverURL, &b.AudioURL, &b.GenreID, &b.Genre, &b.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan favorite: %w", err)
		}
		books = append(books, b)
	}
	return books, nil
}

func (r *FavoritesRepository) IsFavorite(ctx context.Context, userID, bookID int64) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM favorites WHERE user_id=$1 AND book_id=$2)`,
		userID, bookID,
	).Scan(&exists)
	return exists, err
}
