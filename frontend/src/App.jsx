import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { PlayerProvider } from './context/PlayerContext'
import Navbar from './components/Navbar/Navbar'
import AudioPlayer from './components/AudioPlayer/AudioPlayer'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import HomePage from './pages/Home/HomePage'
import CatalogPage from './pages/Catalog/CatalogPage'
import AdminPage from './pages/Admin/AdminPage'
import BookDetailPage from './pages/Book/BookDetailPage'
import LoginPage from './pages/Login/LoginPage'
import RegisterPage from './pages/Register/RegisterPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <Navbar />
          <Toaster position="bottom-right" richColors />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
          <AudioPlayer />
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
