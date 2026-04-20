import { useRef, useEffect, useState } from 'react'
import { usePlayer } from '../../hooks/usePlayer'
import { formatDuration } from '../../utils/formatDuration'

const RATES = [0.5, 1, 1.25, 1.5, 2]

export default function AudioPlayer() {
  const { currentBook, isPlaying, volume, playbackRate, pause, resume, setVolume, setPlaybackRate, stop } = usePlayer()
  const audioRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) audio.play().catch(() => {})
    else audio.pause()
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate
  }, [playbackRate])

  useEffect(() => {
    if (audioRef.current && currentBook) {
      audioRef.current.load()
      if (isPlaying) audioRef.current.play().catch(() => {})
    }
  }, [currentBook?.audio_url])

  if (!currentBook) return null

  const handleSeek = (e) => {
    const time = Number(e.target.value)
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-lg px-4 py-3 z-50">
      <audio
        ref={audioRef}
        src={currentBook.audio_url}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={() => pause()}
      />
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <div className="flex-shrink-0 min-w-0 w-40">
          <p className="text-stone-900 text-sm font-medium truncate">{currentBook.title}</p>
          <p className="text-stone-500 text-xs truncate">{currentBook.author}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => (isPlaying ? pause() : resume())}
            className="bg-amber-600 hover:bg-amber-700 hover:scale-110 active:scale-95 text-white rounded-full w-9 h-9 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:shadow-amber-300 hover:shadow-md"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={stop} className="text-stone-400 hover:text-stone-700 hover:scale-110 active:scale-95 transition-all cursor-pointer text-lg">✕</button>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-stone-500 text-xs flex-shrink-0">{formatDuration(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 accent-amber-500"
          />
          <span className="text-stone-500 text-xs flex-shrink-0">{formatDuration(duration)}</span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <label className="text-stone-500 text-xs flex items-center gap-1">
            <span>🔊</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 h-1 accent-amber-500"
            />
          </label>
          <select
            value={playbackRate}
            onChange={(e) => setPlaybackRate(Number(e.target.value))}
            className="bg-stone-50 text-stone-700 text-xs rounded px-1 py-0.5 border border-stone-300"
          >
            {RATES.map((r) => (
              <option key={r} value={r}>{r}x</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
