import { createContext, useState, useRef, useCallback, useEffect } from 'react'
import { saveProgress, getProgress } from '../api/progress'

export const PlayerContext = createContext(null)

const SAVE_INTERVAL = 10000

export function PlayerProvider({ children }) {
  const [currentBook, setCurrentBook] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [error, setError] = useState(null)
  const [startPosition, setStartPosition] = useState(0)
  const audioRef = useRef(null)
  const saveTimerRef = useRef(null)

  const persistPosition = useCallback((bookId, position) => {
    localStorage.setItem(`progress_${bookId}`, String(position))
    saveProgress(bookId, position).catch(() => {})
  }, [])

  const startSaveTimer = useCallback((bookId) => {
    if (saveTimerRef.current) clearInterval(saveTimerRef.current)
    saveTimerRef.current = setInterval(() => {
      const pos = audioRef.current?.currentTime
      if (pos) persistPosition(bookId, pos)
    }, SAVE_INTERVAL)
  }, [persistPosition])

  const stopSaveTimer = useCallback(() => {
    if (saveTimerRef.current) {
      clearInterval(saveTimerRef.current)
      saveTimerRef.current = null
    }
  }, [])

  const play = useCallback(async (book) => {
    if (!book.audio_url) {
      setError('У этой книги нет аудиофайла')
      return
    }
    setError(null)
    if (currentBook?.id === book.id) {
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
        stopSaveTimer()
      } else {
        audioRef.current?.play().catch(() => {})
        setIsPlaying(true)
        startSaveTimer(book.id)
      }
      return
    }
    const localPos = localStorage.getItem(`progress_${book.id}`)
    let startPos = localPos ? Number(localPos) : 0
    try {
      const { data } = await getProgress(book.id)
      if (data.position > 0) startPos = data.position
    } catch {}
    setStartPosition(startPos)
    setCurrentBook(book)
    setIsPlaying(true)
    startSaveTimer(book.id)
  }, [currentBook, isPlaying, startSaveTimer, stopSaveTimer])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
    stopSaveTimer()
    if (currentBook) {
      const pos = audioRef.current?.currentTime
      if (pos) persistPosition(currentBook.id, pos)
    }
  }, [currentBook, stopSaveTimer, persistPosition])

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {})
    setIsPlaying(true)
    if (currentBook) startSaveTimer(currentBook.id)
  }, [currentBook, startSaveTimer])

  const stop = useCallback(() => {
    if (currentBook) {
      const pos = audioRef.current?.currentTime
      if (pos) persistPosition(currentBook.id, pos)
    }
    stopSaveTimer()
    audioRef.current?.pause()
    setCurrentBook(null)
    setIsPlaying(false)
    setError(null)
  }, [currentBook, stopSaveTimer, persistPosition])

  useEffect(() => () => stopSaveTimer(), [stopSaveTimer])

  return (
    <PlayerContext.Provider value={{
      currentBook, isPlaying, volume, playbackRate, error, startPosition,
      play, pause, resume, stop,
      setVolume, setPlaybackRate, audioRef,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}