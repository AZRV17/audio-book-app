import { createContext, useState, useRef, useCallback, useEffect } from 'react'
import { saveProgress, getProgress } from '../api/progress'
import { getBookParts } from '../api/books'

export const PlayerContext = createContext(null)

const SAVE_INTERVAL = 10000

export function PlayerProvider({ children }) {
  const [currentBook, setCurrentBook] = useState(null)
  const [parts, setParts] = useState([])
  const [partIndex, setPartIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [error, setError] = useState(null)
  const [startPosition, setStartPosition] = useState(0)
  const [startPartIndex, setStartPartIndex] = useState(0)
  const audioRef = useRef(null)
  const saveTimerRef = useRef(null)

  const currentSrc = parts.length > 0
    ? parts[partIndex]?.file_path
    : currentBook?.audio_url

  const persistPosition = useCallback((bookId, position, partIdx = 0) => {
    localStorage.setItem(`progress_${bookId}`, JSON.stringify({ position, partIndex: partIdx }))
    saveProgress(bookId, position, partIdx).catch(() => {})
  }, [])

  const partIndexRef = useRef(0)

  const startSaveTimer = useCallback((bookId) => {
    if (saveTimerRef.current) clearInterval(saveTimerRef.current)
    saveTimerRef.current = setInterval(() => {
      const pos = audioRef.current?.currentTime
      if (pos) persistPosition(bookId, pos, partIndexRef.current)
    }, SAVE_INTERVAL)
  }, [persistPosition])

  const stopSaveTimer = useCallback(() => {
    if (saveTimerRef.current) {
      clearInterval(saveTimerRef.current)
      saveTimerRef.current = null
    }
  }, [])

  const play = useCallback(async (book) => {
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

    let bookParts = []
    try {
      const { data } = await getBookParts(book.id)
      bookParts = data || []
    } catch {}

    if (bookParts.length === 0 && !book.audio_url) {
      setError('У этой книги нет аудиофайла')
      return
    }

    const localRaw = localStorage.getItem(`progress_${book.id}`)
    let startPos = 0
    let startPart = 0
    if (localRaw) {
      try {
        const parsed = JSON.parse(localRaw)
        startPos = parsed.position || 0
        startPart = parsed.partIndex || 0
      } catch {
        startPos = Number(localRaw) || 0
      }
    }
    try {
      const { data } = await getProgress(book.id)
      if (data.position > 0) {
        startPos = data.position
        startPart = data.part_index || 0
      }
    } catch {}

    setParts(bookParts)
    setPartIndex(startPart)
    partIndexRef.current = startPart
    setStartPosition(startPos)
    setStartPartIndex(startPart)
    setCurrentBook(book)
    setIsPlaying(true)
    startSaveTimer(book.id)
  }, [currentBook, isPlaying, startSaveTimer, stopSaveTimer])

  const nextPart = useCallback(() => {
    setPartIndex((prev) => {
      const next = Math.min(prev + 1, parts.length - 1)
      partIndexRef.current = next
      return next
    })
  }, [parts.length])

  const prevPart = useCallback(() => {
    setPartIndex((prev) => {
      const next = Math.max(prev - 1, 0)
      partIndexRef.current = next
      return next
    })
  }, [])

  const handleEnded = useCallback(() => {
    if (partIndex + 1 < parts.length) {
      setPartIndex((prev) => {
        partIndexRef.current = prev + 1
        return prev + 1
      })
      setIsPlaying(true)
    } else {
      stop()
    }
  }, [partIndex, parts.length])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
    stopSaveTimer()
    if (currentBook) {
      const pos = audioRef.current?.currentTime
      if (pos) persistPosition(currentBook.id, pos, partIndexRef.current)
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
      if (pos) persistPosition(currentBook.id, pos, partIndexRef.current)
    }
    stopSaveTimer()
    audioRef.current?.pause()
    setCurrentBook(null)
    setParts([])
    setPartIndex(0)
    setIsPlaying(false)
    setError(null)
  }, [currentBook, stopSaveTimer, persistPosition])

  useEffect(() => () => stopSaveTimer(), [stopSaveTimer])

  return (
    <PlayerContext.Provider value={{
      currentBook, parts, partIndex, isPlaying, volume, playbackRate, error, startPosition, startPartIndex, currentSrc,
      play, pause, resume, stop, nextPart, prevPart, handleEnded,
      setVolume, setPlaybackRate, audioRef,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}
