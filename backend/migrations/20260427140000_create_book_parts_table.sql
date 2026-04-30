-- +goose Up
CREATE TABLE book_parts (
    id       BIGSERIAL PRIMARY KEY,
    book_id  BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    position INT    NOT NULL,
    file_path TEXT  NOT NULL
);

CREATE INDEX idx_book_parts_book_id ON book_parts(book_id, position);

-- +goose Down
DROP TABLE book_parts;
