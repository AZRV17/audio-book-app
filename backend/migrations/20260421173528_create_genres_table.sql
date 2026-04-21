-- +goose Up
CREATE TABLE genres (
    id   BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

INSERT INTO genres (name) VALUES
    ('Классика'),
    ('Фантастика'),
    ('Детектив'),
    ('Роман'),
    ('Биография'),
    ('Саморазвитие'),
    ('История'),
    ('Приключения');

-- +goose Down
DROP TABLE IF EXISTS genres;
