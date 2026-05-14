import { Link } from 'react-router-dom'

export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="block bg-white border border-stone-200 shadow-md hover:shadow-xl hover:-translate-y-1 rounded-xl overflow-hidden transition-all duration-200">
      {book.cover_url ? (
        <img src={book.cover_url} alt={book.title} className="w-full h-40 object-contain bg-stone-50 p-2 sm:h-48" />
      ) : (
        <div className="w-full h-40 bg-amber-50 flex items-center justify-center text-3xl sm:h-48 sm:text-4xl">Ошибка</div>
      )}
      <div className="p-2.5 sm:p-3">
        <h3 className="text-stone-900 font-semibold text-sm truncate">{book.title}</h3>
        <p className="text-stone-500 text-xs truncate mb-3">{book.author}</p>
        <span className="block text-center text-xs bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 py-1.5 rounded transition-all cursor-pointer">
          Подробнее
        </span>
      </div>
    </Link>
  )
}
