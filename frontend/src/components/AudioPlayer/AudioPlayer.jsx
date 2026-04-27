import { useState } from 'react'
import { FiPlay, FiPause, FiX, FiVolume2, FiVolume1, FiVolumeX } from 'react-icons/fi'
import { usePlayer } from '../../hooks/usePlayer'
import { formatDuration } from '../../utils/formatDuration'

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

export default function AudioPlayer() {
  const { currentBook, isPlaying, volume, playbackRate, error, startPosition, pause, resume, stop, setVolume, setPlaybackRate, audioRef } = usePlayer()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  if (!currentBook) return null

  const handleSeek = (e) => {
    const time = Number(e.target.value)
    if (audioRef.current) audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value)
    if (audioRef.current) audioRef.current.volume = val
    setVolume(val)
  }

  const cycleRate = () => {
    const idx = RATES.indexOf(playbackRate)
    const next = RATES[(idx + 1) % RATES.length]
    if (audioRef.current) audioRef.current.playbackRate = next
    setPlaybackRate(next)
  }

  const VolumeIcon = volume === 0 ? FiVolumeX : volume < 0.5 ? FiVolume1 : FiVolume2

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-lg px-4 py-3 z-50">
      <audio
        ref={audioRef}
        src={currentBook.audio_url}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.target.duration)
          if (startPosition > 0) {
            e.target.currentTime = startPosition
            setCurrentTime(startPosition)
          }
        }}
        onCanPlay={() => { if (isPlaying) audioRef.current?.play().catch(() => {}) }}
        onEnded={stop}
      />
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <div className="flex-shrink-0 min-w-0 w-40">
          <p className="text-stone-900 text-sm font-medium truncate">{currentBook.title}</p>
          <p className="text-stone-500 text-xs truncate">{currentBook.author}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => (isPlaying ? pause() : resume())}
            className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-full w-9 h-9 flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} className="ml-0.5" />}
          </button>
          <button onClick={stop} className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer p-1">
            <FiX size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-stone-500 text-xs flex-shrink-0 w-10 text-right">{formatDuration(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 accent-amber-500 cursor-pointer"
          />
          <span className="text-stone-500 text-xs flex-shrink-0 w-10">{formatDuration(duration)}</span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={cycleRate}
            className="text-xs font-semibold text-stone-600 hover:text-amber-600 bg-stone-100 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded px-2 py-1 transition-colors cursor-pointer w-12 text-center"
          >
            {playbackRate}x
          </button>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <VolumeIcon size={16} className="text-stone-500 flex-shrink-0" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 accent-amber-500 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
