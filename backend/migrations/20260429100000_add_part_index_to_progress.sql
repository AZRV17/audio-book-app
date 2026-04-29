-- +goose Up
ALTER TABLE listening_progress ADD COLUMN IF NOT EXISTS part_index INT NOT NULL DEFAULT 0;

-- +goose Down
ALTER TABLE listening_progress DROP COLUMN IF EXISTS part_index;
