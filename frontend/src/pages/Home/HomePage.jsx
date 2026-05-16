import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <main className="min-h-[calc(100vh-65px)] bg-stone-50 flex flex-col items-center justify-center text-center px-4 py-12 sm:min-h-[calc(100vh-57px)]">
      <h1 className="text-4xl font-bold text-stone-900 mb-4 leading-tight sm:text-5xl">
        Слушайте книги <span className="text-amber-600">на ходу</span>
      </h1>
      <p className="text-stone-500 text-base max-w-xl mb-8 sm:text-lg">
        Тысячи аудиокниг для занятых людей. Совмещайте чтение с повседневными делами.
      </p>
      <div className="flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4">
        <Link
          to="/catalog"
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Перейти в каталог
        </Link>
        {!user && (
          <Link
            to="/register"
            className="bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Зарегистрироваться
          </Link>
        )}
      </div>
    </main>
  )
}
