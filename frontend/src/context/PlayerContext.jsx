import { createContext, useState, useRef, useCallback } from 'react'

export const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const [currentBook, setCurrentBook] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [error, setError] = useState(null)
  const audioRef = useRef(null)

  const play = useCallback((book) => {
    if (!book.audio_url) {
      setError('У этой книги нет аудиофайла')
      return
    }
    setError(null)
    if (currentBook?.id === book.id) {
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        audioRef.current?.play().catch(() => {})
        setIsPlaying(true)
      }
      return
    }
    setCurrentBook(book)
    setIsPlaying(true)
  }, [currentBook, isPlaying])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {})
    setIsPlaying(true)
  }, [])

  const stop = useCallback(() => {
    audioRef.current?.pause()
    setCurrentBook(null)
    setIsPlaying(false)
    setError(null)
  }, [])

  return (
    <PlayerContext.Provider value={{
      currentBook, isPlaying, volume, playbackRate, error,
      play, pause, resume, stop,
      setVolume, setPlaybackRate, audioRef,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}
