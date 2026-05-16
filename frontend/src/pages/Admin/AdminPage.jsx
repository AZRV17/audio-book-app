import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { FiUpload, FiRefreshCw } from 'react-icons/fi'
import { addBook, updateBook, uploadAudio, uploadZip, deleteBook } from '../../api/admin'
import { getBooks, getGenres } from '../../api/books'

const emptyForm = { title: '', author: '', description: '', cover_url: '', audio_url: '', genre_id: '' }

export default function AdminPage() {
  const [books, setBooks] = useState([])
  const [genres, setGenres] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [audioFile, setAudioFile] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [manualMode, setManualMode] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getBooks({}).then(({ data }) => setBooks(data))
    getGenres().then(({ data }) => setGenres(data))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        title: form.title,
        author: form.author,
        description: form.description,
        cover_url: form.cover_url,
        audio_url: form.audio_url,
        genre_id: form.genre_id ? Number(form.genre_id) : null,
        skip_google: manualMode,
      }

      if (editingId) {
        const { data } = await updateBook(editingId, payload)
        setBooks((prev) => prev.map((b) => (b.id === editingId ? data : b)))
        toast.success(`Книга "${data.title}" обновлена`)
        setEditingId(null)
      } else {
        const { data } = await addBook(payload)
        let book = data
        if (audioFile) {
          try {
            const { data: updated } = await uploadAudio(data.id, audioFile)
            book = updated
          } catch {
            toast.error('Книга добавлена, но не удалось загрузить аудиофайл')
          }
        }
        setBooks((prev) => [book, ...prev])
        toast.success(`Книга "${book.title}" добавлена`)
        setManualMode(false)
        setAudioFile(null)
      }
      setForm(emptyForm)
    } catch (err) {
      const msg = err?.response?.data?.error
      if (!editingId && err?.response?.status === 502) {
        toast.error('Google Books недоступен - заполните данные вручную')
        setManualMode(true)
      } else {
        toast.error(msg || (editingId ? 'Не удалось обновить книгу' : 'Не удалось добавить книгу'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (book) => {
    setEditingId(book.id)
    setManualMode(false)
    setForm({
      title: book.title,
      author: book.author || '',
      description: book.description || '',
      cover_url: book.cover_url || '',
      audio_url: book.audio_url || '',
      genre_id: book.genre_id ? String(book.genre_id) : '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setEditingId(null)
    setManualMode(false)
    setAudioFile(null)
    setForm(emptyForm)
  }

  const handleUploadAudio = async (id, file) => {
    try {
      const { data } = await uploadAudio(id, file)
      setBooks((prev) => prev.map((b) => (b.id === id ? data : b)))
      toast.success('Аудиофайл загружен')
    } catch {
      toast.error('Не удалось загрузить аудиофайл')
    }
  }

  const handleUploadZip = async (id, file) => {
    try {
      const { data } = await uploadZip(id, file)
      toast.success(`ZIP загружен: ${data.parts} частей`)
    } catch {
      toast.error('Не удалось загрузить ZIP-архив')
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

  const showExtraFields = editingId || manualMode

  return (
    <div className="bg-stone-50 min-h-[calc(100vh-65px)] px-3 py-5 pb-28 sm:min-h-[calc(100vh-57px)] sm:px-4 sm:py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 mb-5 sm:text-3xl sm:mb-8">Панель администратора</h1>

        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-4 mb-6 sm:p-6 sm:mb-8">
          <h2 className="text-lg font-semibold text-stone-900 mb-4 sm:text-xl">
            {editingId ? 'Редактировать книгу' : manualMode ? 'Добавить книгу вручную' : 'Добавить книгу'}
          </h2>
          {manualMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-amber-800 text-sm">
              Google Books недоступен - заполните данные вручную
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-stone-600 text-sm mb-1">Название</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Война и мир"
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
              />
              {!showExtraFields && <p className="text-stone-400 text-xs mt-1">Метаданные подтянутся автоматически из Google Books</p>}
            </div>
            <div>
              <label className="block text-stone-600 text-sm mb-1">
                Автор {!showExtraFields && <span className="text-stone-400">(необязательно)</span>}
              </label>
              <input
                type="text"
                required={manualMode}
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="Лев Толстой"
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
              />
              {!showExtraFields && <p className="text-stone-400 text-xs mt-1">Если не заполнено - подтянется из Google Books</p>}
            </div>
            {showExtraFields && (
              <>
                <div>
                  <label className="block text-stone-600 text-sm mb-1">Описание</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 text-sm mb-1">Ссылка на обложку</label>
                  <input
                    type="text"
                    value={form.cover_url}
                    onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
                    placeholder="https://example.com/cover.jpg"
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-stone-600 text-sm mb-1">Аудио</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={form.audio_url}
                  onChange={(e) => { setForm({ ...form, audio_url: e.target.value }); setAudioFile(null) }}
                  placeholder="https://example.com/audio.mp3"
                  className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
                  disabled={!!audioFile}
                />
                <label className="flex items-center justify-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm px-3 py-2 border border-blue-200 hover:border-blue-400 rounded-lg transition-colors cursor-pointer sm:flex-shrink-0">
                  <FiUpload size={14} />
                  {audioFile ? audioFile.name.slice(0, 15) + '…' : 'Файл'}
                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3,.mp3"
                    className="hidden"
                    onChange={(e) => { if (e.target.files[0]) { setAudioFile(e.target.files[0]); setForm({ ...form, audio_url: '' }) } }}
                  />
                </label>
              </div>
              <p className="text-stone-400 text-xs mt-1">Укажите ссылку или загрузите MP3-файл</p>
            </div>
            <div>
              <label className="block text-stone-600 text-sm mb-1">Жанр</label>
              <select
                value={form.genre_id}
                onChange={(e) => setForm({ ...form, genre_id: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none"
              >
                <option value="">- Без жанра -</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
              >
                {loading ? '...' : editingId ? 'Сохранить' : 'Добавить книгу'}
              </button>
              {(editingId || manualMode) && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Отмена
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4 sm:text-xl">Книги ({books.length})</h2>
          <div className="space-y-3">
            {books.map((book) => (
              <div key={book.id} className={`flex flex-wrap items-center gap-3 p-3 border rounded-lg sm:gap-4 ${editingId === book.id ? 'border-amber-300 bg-amber-50' : 'border-stone-100'}`}>
                {book.cover_url && (
                  <img src={book.cover_url} alt={book.title} className="w-10 h-14 object-contain flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1 basis-[calc(100%-3.25rem)] sm:basis-0">
                  <p className="text-stone-900 font-medium truncate">{book.title}</p>
                  <p className="text-stone-500 text-sm truncate">{book.author}</p>
                </div>
                <label className="flex flex-1 items-center justify-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm px-3 py-1.5 border border-blue-200 hover:border-blue-400 rounded-lg transition-colors cursor-pointer sm:flex-none sm:flex-shrink-0 sm:py-1">
                  {book.audio_url ? <FiRefreshCw size={14} /> : <FiUpload size={14} />}
                  MP3
                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3,.mp3"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleUploadAudio(book.id, e.target.files[0])}
                  />
                </label>
                <label className="flex flex-1 items-center justify-center gap-1.5 text-violet-600 hover:text-violet-700 text-sm px-3 py-1.5 border border-violet-200 hover:border-violet-400 rounded-lg transition-colors cursor-pointer sm:flex-none sm:flex-shrink-0 sm:py-1">
                  <FiUpload size={14} />
                  ZIP
                  <input
                    type="file"
                    accept=".zip,application/zip"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleUploadZip(book.id, e.target.files[0])}
                  />
                </label>
                <button
                  onClick={() => handleEdit(book)}
                  className="flex-1 text-amber-600 hover:text-amber-700 text-sm px-3 py-1.5 border border-amber-200 hover:border-amber-400 rounded-lg transition-colors cursor-pointer sm:flex-none sm:flex-shrink-0 sm:py-1"
                >
                  Изменить
                </button>
                <button
                  onClick={() => handleDelete(book.id, book.title)}
                  className="flex-1 text-red-500 hover:text-red-700 text-sm px-3 py-1.5 border border-red-200 hover:border-red-400 rounded-lg transition-colors cursor-pointer sm:flex-none sm:flex-shrink-0 sm:py-1"
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
