import { useState } from 'react'
import { FiPause, FiPlay, FiSkipBack, FiSkipForward, FiVolume1, FiVolume2, FiVolumeX, FiX } from 'react-icons/fi'
import { usePlayer } from '../../hooks/usePlayer'
import { formatDuration } from '../../utils/formatDuration'

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

export default function AudioPlayer() {
  const { currentBook, parts, partIndex, isPlaying, volume, playbackRate, startPosition, startPartIndex, currentSrc, handleEnded, pause, resume, stop, nextPart, prevPart, setVolume, setPlaybackRate, audioRef } = usePlayer()
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

  const Controls = ({ compact = false }) => (
    <div className={`flex items-center justify-center ${compact ? 'gap-3' : 'gap-1'}`}>
      {parts.length > 1 && (
        <button
          onClick={prevPart}
          disabled={partIndex === 0}
          className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30"
          aria-label="Previous part"
        >
          <FiSkipBack size={16} />
        </button>
      )}
      <button
        onClick={() => (isPlaying ? pause() : resume())}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-600 text-white shadow-sm transition-all hover:bg-amber-700 active:scale-95"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} className="ml-0.5" />}
      </button>
      {parts.length > 1 && (
        <button
          onClick={nextPart}
          disabled={partIndex === parts.length - 1}
          className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30"
          aria-label="Next part"
        >
          <FiSkipForward size={16} />
        </button>
      )}
    </div>
  )

  const Progress = ({ compact = false }) => (
    <div className="flex min-w-0 items-center gap-2">
      <span className={`${compact ? 'w-9 text-[11px]' : 'w-10 text-xs'} flex-shrink-0 text-right text-stone-500`}>
        {formatDuration(currentTime)}
      </span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={currentTime}
        onChange={handleSeek}
        className="h-1 flex-1 cursor-pointer accent-amber-500"
      />
      <span className={`${compact ? 'w-9 text-[11px]' : 'w-10 text-xs'} flex-shrink-0 text-stone-500`}>
        {formatDuration(duration)}
      </span>
    </div>
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white px-3 py-2 shadow-lg sm:px-4 sm:py-3">
      <audio
        ref={audioRef}
        src={currentSrc}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.target.duration)
          if (partIndex === startPartIndex && startPosition > 0) {
            e.target.currentTime = startPosition
            setCurrentTime(startPosition)
          }
        }}
        onCanPlay={() => { if (isPlaying) audioRef.current?.play().catch(() => {}) }}
        onEnded={handleEnded}
      />

      <div className="mx-auto max-w-4xl md:hidden">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-5 text-stone-900">{currentBook.title}</p>
            {parts.length > 1 && (
              <p className="truncate text-[11px] leading-4 text-stone-400">Часть {partIndex + 1} / {parts.length}</p>
            )}
          </div>
          <button
            onClick={cycleRate}
            className="h-7 w-11 flex-shrink-0 rounded border border-stone-200 bg-stone-100 text-center text-xs font-semibold text-stone-600 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
          >
            {playbackRate}x
          </button>
          <button
            onClick={stop}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            aria-label="Close player"
          >
            <FiX size={15} />
          </button>
        </div>

        <div className="mt-1">
          <Controls compact />
        </div>

        <div className="mt-1">
          <Progress compact />
        </div>
      </div>

      <div className="mx-auto hidden max-w-4xl items-center gap-4 md:flex">
        <div className="min-w-0 w-40 flex-shrink-0">
          <p className="truncate text-sm font-medium leading-5 text-stone-900">{currentBook.title}</p>
          <p className="truncate text-xs text-stone-500">{currentBook.author}</p>
          {parts.length > 1 && (
            <p className="text-xs text-stone-400">Часть {partIndex + 1} / {parts.length}</p>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          <Controls />
          <button
            onClick={stop}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            aria-label="Close player"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <Progress />
        </div>

        <div className="flex flex-shrink-0 items-center justify-start gap-3">
          <button
            onClick={cycleRate}
            className="w-12 rounded border border-stone-200 bg-stone-100 px-2 py-1 text-center text-xs font-semibold text-stone-600 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
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
              className="h-1 w-16 cursor-pointer accent-amber-500"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
