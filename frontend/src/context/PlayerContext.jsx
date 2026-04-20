import { createContext, useState, useCallback } from 'react'

export const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const [currentBook, setCurrentBook] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)

  const play = useCallback((book) => {
    setCurrentBook(book)
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => setIsPlaying(false), [])
  const resume = useCallback(() => setIsPlaying(true), [])
  const stop = useCallback(() => {
    setCurrentBook(null)
    setIsPlaying(false)
  }, [])

  return (
    <PlayerContext.Provider value={{
      currentBook, isPlaying, volume, playbackRate,
      play, pause, resume, stop,
      setVolume, setPlaybackRate, setIsPlaying,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}
