import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { FiPlay, FiPause, FiBook, FiHeart } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { getBook, getBookParts } from '../../api/books'
import { checkFavorite, addFavorite, removeFavorite } from '../../api/favorites'
import { usePlayer } from '../../hooks/usePlayer'
import { useAuth } from '../../hooks/useAuth'

export default function BookDetailPage() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [hasParts, setHasParts] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const { play, isPlaying, currentBook, error } = usePlayer()
  const { user } = useAuth()

  useEffect(() => {
    Promise.all([
      getBook(id),
      getBookParts(id).catch(() => ({ data: [] })),
    ]).then(([{ data: book }, { data: parts }]) => {
      setBook(book)
      setHasParts(parts && parts.length > 0)
    }).catch(() => toast.error('Не удалось загрузить книгу'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (user) {
      checkFavorite(id).then(({ data }) => setIsFavorite(data.is_favorite)).catch(() => {})
    }
  }, [id, user])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(id)
        setIsFavorite(false)
        toast.success('Удалено из избранного')
      } else {
        await addFavorite(id)
        setIsFavorite(true)
        toast.success('Добавлено в избранное')
      }
    } catch {
      toast.error('Не удалось обновить избранное')
    }
  }

  if (loading) return <div className="bg-stone-50 min-h-[calc(100vh-57px)] flex items-center justify-center"><p className="text-stone-500">Загрузка...</p></div>
  if (!book) return <div className="bg-stone-50 min-h-[calc(100vh-57px)] flex items-center justify-center"><p className="text-stone-500">Книга не найдена</p></div>

  const isCurrentlyPlaying = currentBook?.id === book.id && isPlaying
  const hasAudio = !!book.audio_url || hasParts

  return (
    <div className="bg-stone-50 min-h-[calc(100vh-57px)] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 flex gap-6">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-36 h-52 object-contain bg-stone-50 rounded-lg flex-shrink-0" />
          ) : (
            <div className="w-36 h-52 bg-amber-50 rounded-lg flex-shrink-0 flex items-center justify-center text-amber-300"><FiBook size={48} /></div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-stone-900 mb-1">{book.title}</h1>
            <p className="text-stone-500 mb-4">{book.author}</p>
            {book.genre && <span className="inline-block bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full mb-4">{book.genre}</span>}
            <div className="flex items-center gap-3">
              <button
                onClick={() => play(book)}
                disabled={!hasAudio}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
              >
                {isCurrentlyPlaying ? <><FiPause size={16} /> Пауза</> : <><FiPlay size={16} /> Слушать</>}
              </button>
              {user && (
                <button
                  onClick={toggleFavorite}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors cursor-pointer font-medium text-sm"
                  style={isFavorite
                    ? { borderColor: '#ef4444', color: '#ef4444', backgroundColor: '#fef2f2' }
                    : { borderColor: '#d6d3d1', color: '#78716c', backgroundColor: 'white' }
                  }
                >
                  {isFavorite ? <FaHeart size={14} /> : <FiHeart size={14} />}
                  {isFavorite ? 'В избранном' : 'В избранное'}
                </button>
              )}
            </div>
            {!hasAudio && <p className="text-stone-400 text-sm mt-2">Аудиофайл недоступен</p>}
          </div>
        </div>

        {book.description && (
          <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 mt-4">
            <h2 className="text-lg font-semibold text-stone-900 mb-3">Описание</h2>
            <p className="text-stone-600 leading-relaxed">{book.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
