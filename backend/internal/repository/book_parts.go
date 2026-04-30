package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/AZRV17/audio-book-app/internal/domain"
)

type BookPartsRepository struct {
	db *pgxpool.Pool
}

func NewBookPartsRepository(db *pgxpool.Pool) *BookPartsRepository {
	return &BookPartsRepository{db: db}
}

func (r *BookPartsRepository) SaveParts(ctx context.Context, bookID int64, filePaths []string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM book_parts WHERE book_id=$1`, bookID)
	if err != nil {
		return fmt.Errorf("delete old parts: %w", err)
	}

	for i, path := range filePaths {
		_, err := r.db.Exec(ctx, `
			INSERT INTO book_parts (book_id, position, file_path) VALUES ($1, $2, $3)`,
			bookID, i+1, path,
		)
		if err != nil {
			return fmt.Errorf("insert part %d: %w", i+1, err)
		}
	}
	return nil
}

func (r *BookPartsRepository) FindByBook(ctx context.Context, bookID int64) ([]*domain.BookPart, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, book_id, position, file_path FROM book_parts
		WHERE book_id=$1 ORDER BY position`, bookID,
	)
	if err != nil {
		return nil, fmt.Errorf("find parts: %w", err)
	}
	defer rows.Close()

	var parts []*domain.BookPart
	for rows.Next() {
		p := &domain.BookPart{}
		if err := rows.Scan(&p.ID, &p.BookID, &p.Position, &p.FilePath); err != nil {
			return nil, fmt.Errorf("scan part: %w", err)
		}
		parts = append(parts, p)
	}
	return parts, nil
}
