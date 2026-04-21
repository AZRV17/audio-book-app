package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/AZRV17/audio-book-app/internal/domain"
)

type GenreRepository struct {
	db *pgxpool.Pool
}

func NewGenreRepository(db *pgxpool.Pool) *GenreRepository {
	return &GenreRepository{db: db}
}

func (r *GenreRepository) FindAll(ctx context.Context) ([]*domain.Genre, error) {
	rows, err := r.db.Query(ctx, `SELECT id, name FROM genres ORDER BY name`)
	if err != nil {
		return nil, fmt.Errorf("find genres: %w", err)
	}
	defer rows.Close()

	var genres []*domain.Genre
	for rows.Next() {
		g := &domain.Genre{}
		if err := rows.Scan(&g.ID, &g.Name); err != nil {
			return nil, fmt.Errorf("scan genre: %w", err)
		}
		genres = append(genres, g)
	}

	return genres, nil
}
