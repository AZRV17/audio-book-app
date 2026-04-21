-- +goose Up
CREATE TABLE books (
    id          BIGSERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    author      TEXT NOT NULL,
    description TEXT,
    cover_url   TEXT,
    audio_url   TEXT,
    genre_id    BIGINT REFERENCES genres(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX books_title_idx ON books USING gin(to_tsvector('russian', title));
CREATE INDEX books_author_idx ON books USING gin(to_tsvector('russian', author));

-- +goose Down
DROP TABLE IF EXISTS books;
