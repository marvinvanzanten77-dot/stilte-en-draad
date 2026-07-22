import { useEffect, useState } from 'react'

const DURATION = 30
const reflections = [
  { quote: 'Nergens vindt een mens een rustiger toevluchtsoord dan in zijn eigen ziel.', author: 'Marcus Aurelius' },
  { quote: 'Alle ongelukkigheid van mensen komt voort uit het feit dat zij niet rustig alleen kunnen zijn.', author: 'Blaise Pascal' },
  { quote: 'Er bestaat niet zoiets als stilte.', author: 'John Cage' },
  { quote: 'Ware stilte is niet alleen de afwezigheid van woorden, maar innerlijke rust.', author: 'Thich Nhat Hanh' },
  { quote: 'Schep stilte.', author: 'Søren Kierkegaard' },
  { quote: 'Ik wilde diep leven en al het merg uit het leven zuigen.', author: 'Henry David Thoreau' },
]

const SilenceExperience = () => {
  const [remaining, setRemaining] = useState(DURATION)
  const [running, setRunning] = useState(true)
  const complete = remaining === 0

  useEffect(() => {
    if (!running || complete) return
    const timer = window.setInterval(() => setRemaining((value) => {
      if (value <= 1) {
        window.clearInterval(timer)
        setRunning(false)
        return 0
      }
      return value - 1
    }), 1000)
    return () => window.clearInterval(timer)
  }, [complete, running])

  const reset = () => { setRemaining(DURATION); setRunning(true) }
  const progress = (DURATION - remaining) / DURATION
  const reflection = reflections[Math.min(reflections.length - 1, Math.floor((DURATION - remaining) / 5))]

  return <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#34332f] text-[#eee7dc] shadow-inner">
    <div className="relative flex min-h-64 items-center justify-center overflow-hidden p-8 text-center">
      <div aria-hidden="true" className="absolute rounded-full border border-[#c6a978]/30 transition-all duration-1000 ease-linear" style={{ width: `${72 + progress * 190}px`, height: `${72 + progress * 190}px`, opacity: .75 - progress * .45 }} />
      <div aria-hidden="true" className="absolute h-36 w-36 rounded-full bg-[#c6a978]/[.06] blur-xl" />
      <div className="relative z-10">
        {complete ? <><p className="font-serif text-2xl leading-9">Wat hoorde je<br />toen niets hoefde?</p><p className="mt-4 text-[9px] uppercase tracking-[0.18em] text-white/45">Neem het mee zonder het te benoemen</p></> : <><span className="font-serif text-4xl tabular-nums text-[#e4d5bc]">{remaining}</span><p className="mt-3 text-[9px] uppercase tracking-[0.18em] text-white/45">seconden ruimte</p><div key={reflection.author} className="mx-auto mt-7 max-w-sm animate-pulse"><p className="font-serif text-lg leading-7 text-[#e9ddca]">“{reflection.quote}”</p><p className="mt-3 text-[8px] uppercase tracking-[0.18em] text-white/45">— {reflection.author}</p></div></>}
      </div>
    </div>
    <div className="border-t border-white/10 p-4">
      <button type="button" onClick={reset} className="mx-auto block rounded-full border border-white/20 px-5 py-2.5 text-[9px] uppercase tracking-[0.16em] text-white/70 transition hover:bg-white/10 hover:text-white">Start opnieuw</button>
    </div>
  </div>
}

export default SilenceExperience
