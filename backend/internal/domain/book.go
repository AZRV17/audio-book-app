package domain

import "time"

type Book struct {
	ID          int64     `json:"id"`
	Title       string    `json:"title"`
	Author      string    `json:"author"`
	Description string    `json:"description"`
	CoverURL    string    `json:"cover_url"`
	AudioURL    string    `json:"audio_url"`
	GenreID     *int64    `json:"genre_id"`
	Genre       string    `json:"genre,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

type Genre struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}
