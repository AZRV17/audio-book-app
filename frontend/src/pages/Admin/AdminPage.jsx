import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { addBook, deleteBook } from '../../api/admin'
import { getBooks, getGenres } from '../../api/books'

export default function AdminPage() {
  const [books, setBooks] = useState([])
  const [genres, setGenres] = useState([])
  const [form, setForm] = useState({ title: '', author: '', audio_url: '', genre_id: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getBooks({}).then(({ data }) => setBooks(data))
    getGenres().then(({ data }) => setGenres(data))
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        title: form.title,
        author: form.author,
        audio_url: form.audio_url,
        genre_id: form.genre_id ? Number(form.genre_id) : null,
      }
      const { data } = await addBook(payload)
      setBooks((prev) => [data, ...prev])
      setForm({ title: '', author: '', audio_url: '', genre_id: '' })
      toast.success(`Книга "${data.title}" добавлена`)
    } catch {
      toast.error('Не удалось добавить книгу')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, title) => {
    try {
      await deleteBook(id)
      setBooks((prev) => prev.filter((b) => b.id !== id))
      toast.success(`Книга "${title}" удалена`)
    } catch {
      toast.error('Не удалось удалить книгу')
    }
  }

  return (
    <div className="bg-stone-50 min-h-[calc(100vh-57px)] px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-stone-900 mb-8">Панель администратора</h1>

        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-stone-900 mb-4">Добавить книгу</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-stone-600 text-sm mb-1">Название</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Мастер и Маргарита"
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
              />
              <p className="text-stone-400 text-xs mt-1">Метаданные подтянутся автоматически из Google Books</p>
            </div>
            <div>
              <label className="block text-stone-600 text-sm mb-1">Автор <span className="text-stone-400">(необязательно)</span></label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="Лев Толстой"
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
              />
              <p className="text-stone-400 text-xs mt-1">Если не заполнено — подтянется из Google Books</p>
            </div>
            <div>
              <label className="block text-stone-600 text-sm mb-1">Ссылка на аудио</label>
              <input
                type="text"
                value={form.audio_url}
                onChange={(e) => setForm({ ...form, audio_url: e.target.value })}
                placeholder="https://example.com/audio.mp3"
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-stone-600 text-sm mb-1">Жанр</label>
              <select
                value={form.genre_id}
                onChange={(e) => setForm({ ...form, genre_id: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
              >
                <option value="">— Без жанра —</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
            >
              {loading ? 'Добавление...' : 'Добавить книгу'}
            </button>
          </form>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-stone-900 mb-4">Книги ({books.length})</h2>
          <div className="space-y-3">
            {books.map((book) => (
              <div key={book.id} className="flex items-center gap-4 p-3 border border-stone-100 rounded-lg">
                {book.cover_url && (
                  <img src={book.cover_url} alt={book.title} className="w-10 h-14 object-contain flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-stone-900 font-medium truncate">{book.title}</p>
                  <p className="text-stone-500 text-sm truncate">{book.author}</p>
                </div>
                <button
                  onClick={() => handleDelete(book.id, book.title)}
                  className="text-red-500 hover:text-red-700 text-sm px-3 py-1 border border-red-200 hover:border-red-400 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                >
                  Удалить
                </button>
              </div>
            ))}
            {books.length === 0 && <p className="text-stone-500">Книг пока нет</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
