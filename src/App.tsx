import { useEffect, useRef, useState } from 'react'
import VerticalNav from './components/VerticalNav'
import ZoneContainer from './components/ZoneContainer'

export type ZoneId =
  | 'de-eerste-draad'
  | 'veld'
  | 'droom'
  | 'textiel'
  | 'ritueel'
  | 'stilte'

const zones: { id: ZoneId; label: string }[] = [
  { id: 'de-eerste-draad', label: 'DE EERSTE DRAAD' },
  { id: 'veld', label: 'VELD' },
  { id: 'droom', label: 'DROOM' },
  { id: 'textiel', label: 'TEXTIEL' },
  { id: 'ritueel', label: 'RITUEEL' },
  { id: 'stilte', label: 'STILTE' },
]

function App() {
  const [activeZone, setActiveZone] = useState<ZoneId>('de-eerste-draad')
  const [audioEnabled, setAudioEnabled] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio('/audio/stilte-en-draad.wav')
      audio.loop = true
      audio.preload = 'auto'
      audioRef.current = audio
    }

    const audio = audioRef.current
    if (!audio) return

    if (audioEnabled) {
      audio
        .play()
        .catch(() => {
          setAudioEnabled(false)
        })
    } else {
      audio.pause()
    }
  }, [audioEnabled])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row md:gap-12">
        <VerticalNav
          zones={zones}
          activeZone={activeZone}
          onSelect={setActiveZone}
        />
        <div className="flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <header className="space-y-1 text-sm uppercase tracking-[0.24em] text-neutral-700">
              <div className="font-semibold text-neutral-800">STILTE &amp; DRAAD</div>
              <div className="text-xs font-normal text-neutral-600">door Jannie</div>
            </header>

            <button
              type="button"
              aria-pressed={audioEnabled}
              onClick={() => setAudioEnabled((prev) => !prev)}
              className="inline-flex items-center gap-3 self-start rounded-full border border-white/70 bg-white/70 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-neutral-700 shadow-soft/0 backdrop-blur-sm transition hover:-translate-y-[1px] hover:shadow-soft focus-visible:outline-none"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white">
                {audioEnabled ? (
                  <span className="flex gap-[4px]">
                    <span className="block h-3.5 w-[3px] rounded-[1px] bg-white" />
                    <span className="block h-3.5 w-[3px] rounded-[1px] bg-white" />
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="block"
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: '6px solid transparent',
                      borderBottom: '6px solid transparent',
                      borderLeft: '9px solid white',
                      marginLeft: '2px',
                    }}
                  />
                )}
              </span>
              <span className="text-left leading-tight">
                zet audio aan
                <span className="block text-[10px] font-normal uppercase tracking-[0.12em] text-neutral-600">
                  voor een betere ervaring
                </span>
              </span>
            </button>
          </div>
          <ZoneContainer
            activeZone={activeZone}
            onZoneChange={setActiveZone}
          />
        </div>
      </div>
    </div>
  )
}

export default App
