import { useState, useEffect } from 'react'
import { getBooks, getGenres } from '../../api/books'
import BookCard from '../../components/BookCard/BookCard'

export default function CatalogPage() {
  const [books, setBooks] = useState([])
  const [genres, setGenres] = useState([])
  const [search, setSearch] = useState('')
  const [genreId, setGenreId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getGenres().then(({ data }) => setGenres(data))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      setError(null)
      const params = {}
      if (search) params.search = search
      if (genreId) params.genre_id = genreId
      getBooks(params)
        .then(({ data }) => setBooks(data))
        .catch(() => setError('Не удалось загрузить книги'))
        .finally(() => setLoading(false))
    }, 400)

    return () => clearTimeout(timer)
  }, [search, genreId])

  return (
    <div className="bg-stone-50 min-h-[calc(100vh-57px)] px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-stone-900 mb-6">Каталог</h1>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию или автору..."
          className="w-full bg-white border border-stone-300 rounded-lg px-4 py-2 text-stone-900 focus:border-amber-500 focus:outline-none mb-4"
        />

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setGenreId('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${genreId === '' ? 'bg-amber-600 text-white' : 'bg-white border border-stone-300 text-stone-700 hover:border-amber-500 hover:text-amber-600'}`}
          >
            Все
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => setGenreId(String(g.id))}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${genreId === String(g.id) ? 'bg-amber-600 text-white' : 'bg-white border border-stone-300 text-stone-700 hover:border-amber-500 hover:text-amber-600'}`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {loading && <p className="text-stone-500">Загрузка...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && books.length === 0 && (
          <p className="text-stone-500">По вашему запросу ничего не найдено</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  )
}
