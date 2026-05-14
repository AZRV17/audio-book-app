import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { getFavorites } from '../../api/favorites'
import BookCard from '../../components/BookCard/BookCard'

export default function FavoritesPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFavorites()
      .then(({ data }) => setBooks(data))
      .catch(() => toast.error('Не удалось загрузить избранное'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-stone-50 min-h-[calc(100vh-65px)] px-3 py-5 pb-28 sm:min-h-[calc(100vh-57px)] sm:px-4 sm:py-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 mb-5 sm:text-3xl sm:mb-6">Избранное</h1>

        {loading && <p className="text-stone-500">Загрузка...</p>}
        {!loading && books.length === 0 && (
          <p className="text-stone-500">Вы ещё не добавили ни одной книги в избранное</p>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  )
}
