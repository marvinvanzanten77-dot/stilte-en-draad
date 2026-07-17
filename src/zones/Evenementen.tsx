import { useMemo, useState } from 'react'

const months = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]
const weekdays = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

const Evenementen = () => {
  const today = new Date()
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [view, setView] = useState<'kalender' | 'lijst'>('kalender')
  const [eventType, setEventType] = useState<'Alles' | 'Festival' | 'Markt' | 'Expositie'>('Alles')

  const calendar = useMemo(() => {
    const year = visibleMonth.getFullYear()
    const month = visibleMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7
    return [
      ...Array.from({ length: mondayOffset }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ]
  }, [visibleMonth])

  const changeMonth = (offset: number) => {
    setVisibleMonth(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1),
    )
    setSelectedDay(null)
  }

  const isToday = (day: number) =>
    day === today.getDate() &&
    visibleMonth.getMonth() === today.getMonth() &&
    visibleMonth.getFullYear() === today.getFullYear()

  return (
    <div className="min-h-[560px] rounded-2xl bg-[#d8cbb4] p-7 shadow-soft ring-1 ring-neutral-200/40 md:p-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">Ontmoet Jannie</p>
        <h1 className="mt-2 text-2xl font-semibold uppercase tracking-[0.18em] text-neutral-900">Evenementen</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-700">
          Festivals, markten en andere plekken waar Stilte &amp; Draad tijdelijk neerstrijkt.
        </p>
      </header>

      <section className="mb-8 overflow-hidden rounded-xl border border-white/50 bg-[#f3efe6]/45" aria-labelledby="rijdende-atelier-title">
        <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[2/1]">
          <img src="/photos/rijdende-atelier-concept.jpg" alt="Conceptbeeld van het mobiele Stilte & Draad-atelier op een festival" width="1600" height="1066" loading="eager" className="h-full w-full object-cover" />
          <span className="absolute left-4 top-4 rounded-full bg-[#f8f4ec]/90 px-3 py-2 text-[9px] uppercase tracking-[0.15em] backdrop-blur-sm">Conceptbeeld</span>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/25 to-transparent p-5 pt-20 text-white sm:p-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/75">Stilte &amp; Draad onderweg</p>
            <h2 id="rijdende-atelier-title" className="mt-2 text-xl font-semibold uppercase tracking-[0.16em] sm:text-2xl">Het Rijdende Atelier</h2>
          </div>
        </div>
        <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
          <div><p className="text-sm leading-7 text-neutral-700">Een toekomstidee waarin de werken, Jannies stem en de verhalen achter iedere draad samen naar festivals en markten reizen.</p><p className="mt-2 text-xs italic text-neutral-500">Luister naar het verhaal achter iedere draad.</p></div>
          <a href="#agenda" className="rounded-full bg-neutral-900 px-5 py-3 text-center text-[10px] uppercase tracking-[0.15em] text-white">Waar strijken we neer? ↓</a>
        </div>
      </section>

      <div id="agenda" className="grid scroll-mt-6 gap-6 lg:grid-cols-[1fr_240px]">
        <section className="rounded-xl border border-white/50 bg-white/25 p-4 sm:p-6" aria-label="Evenementenkalender">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/10 pb-5">
            <div className="flex gap-2">{(['kalender', 'lijst'] as const).map((item) => <button key={item} type="button" onClick={() => setView(item)} aria-pressed={view === item} className={`rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.13em] ${view === item ? 'bg-neutral-900 text-white' : 'border border-neutral-800/15'}`}>{item}</button>)}</div>
            <button type="button" onClick={() => { setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(today.getDate()) }} className="text-[10px] uppercase tracking-[0.13em] underline underline-offset-4">Vandaag</button>
          </div>
          <div className="mb-5 flex flex-wrap gap-2" aria-label="Filter op type">{(['Alles', 'Festival', 'Markt', 'Expositie'] as const).map((type) => <button key={type} type="button" onClick={() => setEventType(type)} aria-pressed={eventType === type} className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] ${eventType === type ? 'border-[#9c7d4c] bg-white/55' : 'border-neutral-800/10'}`}>{type}</button>)}</div>
          {view === 'kalender' ? <>
          <div className="mb-6 flex items-center justify-between">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Vorige maand" className="h-9 w-9 rounded-full border border-neutral-800/20 text-lg transition hover:bg-white/50">←</button>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
              {months[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
            </h2>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Volgende maand" className="h-9 w-9 rounded-full border border-neutral-800/20 text-lg transition hover:bg-white/50">→</button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map((day) => <div key={day} className="pb-2 text-[10px] uppercase tracking-[0.14em] text-neutral-500">{day}</div>)}
            {calendar.map((day, index) =>
              day === null ? <div key={`empty-${index}`} /> : (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  aria-pressed={selectedDay === day}
                  className={`aspect-square rounded-full text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 ${
                    selectedDay === day
                      ? 'bg-neutral-900 text-white'
                      : isToday(day)
                        ? 'border border-neutral-800/50 bg-white/35'
                        : 'hover:bg-white/50'
                  }`}
                >
                  {day}
                </button>
              ),
            )}
          </div>
          </> : <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800/15 p-8 text-center"><p className="text-xs uppercase tracking-[0.16em]">Nog geen bevestigde {eventType === 'Alles' ? 'data' : eventType.toLowerCase()}</p><p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">Zodra Jannie ergens staat, verschijnt het evenement hier met locatie, route, deelknop en agenda-download.</p></div>}
        </section>

        <aside className="rounded-xl border border-white/50 bg-white/25 p-6">
          <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            {selectedDay
              ? `${selectedDay} ${months[visibleMonth.getMonth()]}`
              : 'Agenda'}
          </p>
          <h2 className="mt-3 text-base font-semibold uppercase tracking-[0.12em]">
            {selectedDay ? 'Nog geen evenement' : 'Data volgen'}
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            {selectedDay
              ? 'Voor deze dag staat nog geen festival of markt gepland.'
              : 'Hier verschijnen binnenkort de markten, festivals en locaties waar Jannie te vinden is.'}
          </p>
          <div className="mt-6 border-t border-neutral-800/10 pt-5 text-xs leading-5 text-neutral-500">
            Bevestigde data krijgen straks een draadmarkering in de kalender.
          </div>
          <button type="button" disabled className="mt-5 w-full cursor-not-allowed rounded-full border border-neutral-800/15 px-4 py-3 text-[10px] uppercase tracking-[0.13em] text-neutral-400">Toevoegen aan agenda</button>
        </aside>
      </div>
    </div>
  )
}

export default Evenementen
