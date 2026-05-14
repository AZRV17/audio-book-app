import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../hooks/useAuth'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(form)
      toast.success('Аккаунт успешно создан!')
      navigate('/')
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка регистрации'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-stone-50 min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-8 sm:min-h-[calc(100vh-57px)]">
      <div className="w-full max-w-sm bg-white shadow-md rounded-xl p-5 sm:p-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-6 text-center">Регистрация</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-stone-600 text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white text-stone-900 rounded-lg px-3 py-2 border border-stone-300 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-stone-600 text-sm mb-1">Пароль</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-white text-stone-900 rounded-lg px-3 py-2 border border-stone-300 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 active:scale-[0.98] disabled:opacity-50 hover:shadow-md hover:shadow-amber-200 text-white py-2.5 rounded-lg font-medium transition-all cursor-pointer"
          >
            {loading ? 'Регистрация...' : 'Создать аккаунт'}
          </button>
        </form>
        <p className="text-stone-500 text-sm text-center mt-4">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-amber-600 hover:text-amber-700">Войти</Link>
        </p>
      </div>
    </div>
  )
}
