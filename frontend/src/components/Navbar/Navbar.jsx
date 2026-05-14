import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    setIsOpen(false)
    logout()
    navigate('/login')
  }

  const closeMenu = () => setIsOpen(false)
  const linkClass = 'text-stone-700 hover:text-amber-600 font-semibold transition-colors'

  return (
    <nav className="sticky top-0 z-[60] border-b border-stone-200 bg-white text-stone-900 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" onClick={closeMenu} className="text-xl font-bold text-amber-600">AudioBooks</Link>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 text-stone-700 transition-colors hover:bg-stone-50 md:hidden"
          aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isOpen}
        >
          {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>

        <div className="hidden items-center gap-4 md:flex">
          <Link to="/catalog" className={linkClass}>Каталог</Link>
          {user && (
            <Link to="/favorites" className={linkClass}>Избранное</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className={linkClass}>Админка</Link>
          )}
          {user ? (
            <>
              <span className="max-w-48 truncate text-sm text-stone-500">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                aria-label="Выйти"
                title="Выйти"
              >
                <FiLogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}>Войти</Link>
              <Link
                to="/register"
                className="bg-amber-600 hover:bg-amber-700 font-semibold text-white px-3 py-1.5 rounded text-sm transition-colors"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} absolute inset-x-0 top-full border-t border-stone-100 bg-white px-4 pb-4 shadow-lg md:hidden`}>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 pt-3">
          <Link to="/catalog" onClick={closeMenu} className={linkClass}>Каталог</Link>
          {user && (
            <Link to="/favorites" onClick={closeMenu} className={linkClass}>Избранное</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={closeMenu} className={linkClass}>Админка</Link>
          )}
          {user ? (
            <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
              <span className="min-w-0 truncate text-sm text-stone-500">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                aria-label="Выйти"
                title="Выйти"
              >
                <FiLogOut size={18} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className={linkClass}>Войти</Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="rounded bg-amber-600 px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-amber-700"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
