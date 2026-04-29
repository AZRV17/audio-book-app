import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-stone-200 shadow-sm text-stone-900 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <Link to="/" className="text-xl font-bold text-amber-600">AudioBooks</Link>
      <div className="flex items-center gap-4">
        <Link to="/catalog" className="text-stone-700 hover:text-amber-600 font-semibold transition-colors">Каталог</Link>
        {user && (
          <Link to="/favorites" className="text-stone-700 hover:text-amber-600 font-semibold transition-colors">Избранное</Link>
        )}
        {user?.role === 'admin' && (
          <Link to="/admin" className="text-stone-700 hover:text-amber-600 font-semibold transition-colors">Админка</Link>
        )}
        {user ? (
          <>
            <span className="text-stone-500 text-sm">{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded text-sm transition-colors"
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-stone-700 hover:text-amber-600 font-semibold transition-colors">Войти</Link>
            <Link
              to="/register"
              className="bg-amber-600 hover:bg-amber-700 font-semibold text-white px-3 py-1.5 rounded text-sm transition-colors"
            >
              Регистрация
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
