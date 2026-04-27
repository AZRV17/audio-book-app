-- +goose Up
CREATE TABLE listening_progress (
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id    BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    position   FLOAT  NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, book_id)
);

-- +goose Down
DROP TABLE listening_progress;