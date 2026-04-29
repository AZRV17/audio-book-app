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

func (r *ProgressRepository) Save(ctx context.Context, userID, bookID int64, position float64, partIndex int) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO listening_progress (user_id, book_id, position, part_index, updated_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (user_id, book_id) DO UPDATE
		SET position = EXCLUDED.position, part_index = EXCLUDED.part_index, updated_at = NOW()`,
		userID, bookID, position, partIndex,
	)
	if err != nil {
		return fmt.Errorf("save progress: %w", err)
	}
	return nil
}

type Progress struct {
	Position  float64 `json:"position"`
	PartIndex int     `json:"part_index"`
}

func (r *ProgressRepository) Get(ctx context.Context, userID, bookID int64) (*Progress, error) {
	var p Progress
	err := r.db.QueryRow(ctx, `
		SELECT position, part_index FROM listening_progress WHERE user_id=$1 AND book_id=$2`,
		userID, bookID,
	).Scan(&p.Position, &p.PartIndex)
	if err != nil {
		return &Progress{}, nil
	}
	return &p, nil
}
