import { useEffect, useRef, useState } from 'react'
import { spokenWords, type SpokenWordId } from '../data/spokenWords'

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '0:00'
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

const SpokenWordPlayer = ({ id }: { id: SpokenWordId }) => {
  const track = spokenWords[id]
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showLyrics, setShowLyrics] = useState(false)

  useEffect(() => {
    const pause = () => { audioRef.current?.pause(); setPlaying(false) }
    window.addEventListener('stop-inline-audio', pause)
    return () => window.removeEventListener('stop-inline-audio', pause)
  }, [])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      window.dispatchEvent(new Event('stop-main-audio'))
      await audio.play()
    } else audio.pause()
  }

  return <div className="mt-6 rounded-xl border border-neutral-800/15 bg-white/25 p-4">
    <audio ref={audioRef} src={track.audioSrc} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onEnded={() => setPlaying(false)} />
    <div className="flex items-center gap-3"><button type="button" onClick={toggle} aria-label={playing ? `Pauzeer ${track.title}` : `Speel ${track.title}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs text-white">{playing ? 'Ⅱ' : '▶'}</button><div className="min-w-0 flex-1"><div className="mb-2 flex items-center justify-between gap-3"><span className="truncate text-xs font-medium uppercase tracking-[0.13em]">{track.title}</span><span className="text-[9px] tabular-nums text-neutral-500">{formatTime(currentTime)} / {formatTime(duration)}</span></div><input aria-label={`Voortgang ${track.title}`} type="range" min="0" max={duration || 0} step="0.1" value={currentTime} onChange={(event) => { const time = Number(event.target.value); if (audioRef.current) audioRef.current.currentTime = time; setCurrentTime(time) }} className="block w-full accent-neutral-900" /></div></div>
    <button type="button" onClick={() => setShowLyrics((value) => !value)} aria-expanded={showLyrics} className="mt-4 text-[9px] uppercase tracking-[0.15em] underline underline-offset-4">{showLyrics ? 'Verberg tekst' : 'Lees de tekst'}</button>
    {showLyrics && <pre className="mt-5 whitespace-pre-wrap border-t border-neutral-800/10 pt-5 font-sans text-sm leading-7 text-neutral-700">{track.lyrics}</pre>}
  </div>
}

export default SpokenWordPlayer
