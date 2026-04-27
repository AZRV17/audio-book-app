package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ProgressRepository struct {
	db *pgxpool.Pool
}

func NewProgressRepository(db *pgxpool.Pool) *ProgressRepository {
	return &ProgressRepository{db: db}
}

func (r *ProgressRepository) Save(ctx context.Context, userID, bookID int64, position float64) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO listening_progress (user_id, book_id, position, updated_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (user_id, book_id) DO UPDATE
		SET position = EXCLUDED.position, updated_at = NOW()`,
		userID, bookID, position,
	)
	if err != nil {
		return fmt.Errorf("save progress: %w", err)
	}
	return nil
}

func (r *ProgressRepository) Get(ctx context.Context, userID, bookID int64) (float64, error) {
	var position float64
	err := r.db.QueryRow(ctx, `
		SELECT position FROM listening_progress WHERE user_id=$1 AND book_id=$2`,
		userID, bookID,
	).Scan(&position)
	if err != nil {
		return 0, nil
	}
	return position, nil
}
