import { useMemo, useState } from 'react'
import { eventDate, events, formatEventDate, type AtelierEvent } from '../data/events'
import { busFunding, formatFundingAmount } from '../data/funding'

const months = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]
const weekdays = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']
const fullDate = (year: number, month: number, day: number) =>
  new Intl.DateTimeFormat('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(year, month, day))

const agendaValue = (event: AtelierEvent, time: string) => `${event.date.replaceAll('-', '')}T${time.replace(':', '')}00`
const escapeCalendarText = (value: string) => value.replaceAll('\\', '\\\\').replaceAll(',', '\\,').replaceAll(';', '\\;').replaceAll('\n', '\\n')

const downloadAgenda = (event: AtelierEvent) => {
  const location = `${event.street}, ${event.city} (${event.locationNote})`
  const content = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Stilte & Draad//Evenementen//NL',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${event.id}@stilte-en-draad.nl`,
    `DTSTAMP:${new Date().toISOString().replaceAll('-', '').replaceAll(':', '').replace(/\.\d{3}Z$/, 'Z')}`,
    `DTSTART;TZID=Europe/Amsterdam:${agendaValue(event, event.startTime)}`,
    `DTEND;TZID=Europe/Amsterdam:${agendaValue(event, event.endTime)}`,
    `SUMMARY:${escapeCalendarText(`${event.title} · Stilte & Draad`)}`,
    `DESCRIPTION:${escapeCalendarText(`${event.description} ${event.admission}.`)}`,
    `LOCATION:${escapeCalendarText(location)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }))
  link.download = `${event.id}.ics`
  link.click()
  URL.revokeObjectURL(link.href)
}

const Evenementen = ({ navigate }: { navigate: (path: string) => void }) => {
  const fundingPercentage = Math.min(100, Math.round((busFunding.currentCents / busFunding.goalCents) * 100))
  const today = new Date()
  const firstUpcomingEvent = events.find((event) => eventDate(event) >= today) ?? events[0]
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(eventDate(firstUpcomingEvent).getFullYear(), eventDate(firstUpcomingEvent).getMonth(), 1),
  )
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [view, setView] = useState<'kalender' | 'lijst'>('kalender')
  const [eventType, setEventType] = useState<'Alles' | 'Festival' | 'Markt' | 'Expositie'>('Alles')
  const filteredEvents = events.filter((event) => eventType === 'Alles' || event.type === eventType)
  const selectedEvent = selectedDay === null ? null : filteredEvents.find((event) => {
    const date = eventDate(event)
    return date.getFullYear() === visibleMonth.getFullYear() && date.getMonth() === visibleMonth.getMonth() && date.getDate() === selectedDay
  }) ?? null
  const eventForDay = (day: number) => filteredEvents.find((event) => {
    const date = eventDate(event)
    return date.getFullYear() === visibleMonth.getFullYear() && date.getMonth() === visibleMonth.getMonth() && date.getDate() === day
  })

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
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_280px] lg:items-stretch">
          <div className="flex flex-col justify-center"><p className="text-sm leading-7 text-neutral-700">Jannie brengt haar werken, haar stem en de verhalen achter iedere draad nu al naar markten en ontmoetingsplekken. Het rijdende atelier is de volgende stap: een eigen bus waarin Stilte &amp; Draad straks vollediger kan reizen, worden beleefd en telkens opnieuw kan neerstrijken.</p><p className="mt-2 text-xs italic text-neutral-500">De ontmoetingen zijn er al. Nu bouwen we aan de ruimte die met haar mee kan reizen.</p><a href="#agenda" className="mt-5 self-start text-[9px] uppercase tracking-[0.15em] text-neutral-600 underline decoration-neutral-800/30 underline-offset-4">Waar strijken we neer? ↓</a></div>
          <aside id="doneren" className="rounded-xl border border-[#9b7d4f]/25 bg-[#eee5d6]/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.55)]" aria-labelledby="donation-title">
            <p className="text-[9px] uppercase tracking-[0.18em] text-[#8a6b43]">Bouw mee aan het rijdende atelier</p>
            <h3 id="donation-title" className="mt-2 text-sm font-semibold uppercase tracking-[0.13em]">Geef een draad mee</h3>
            <p className="mt-3 text-xs leading-6 text-neutral-600">Jouw donatie gaat rechtstreeks naar de aanschaf van een bus en de verbouwing ervan tot het rijdende atelier van Stilte &amp; Draad. Zo kunnen Jannies werken, stem en verhalen straks naar festivals, markten en ontmoetingsplekken reizen.</p>
            <div className="mt-5 rounded-xl border border-[#9b7d4f]/20 bg-white/30 p-4" aria-label="Voortgang van het budget voor het rijdende atelier">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.17em] text-neutral-500">Huidig bevestigd budget</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-800">{formatFundingAmount(busFunding.currentCents)}</p>
                </div>
                <p className="text-[9px] uppercase tracking-[0.13em] text-neutral-500">{fundingPercentage}%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#9b7d4f]/15" role="progressbar" aria-label={busFunding.goalLabel} aria-valuemin={0} aria-valuemax={busFunding.goalCents} aria-valuenow={busFunding.currentCents} aria-valuetext={`${formatFundingAmount(busFunding.currentCents)} van ${formatFundingAmount(busFunding.goalCents)}`}>
                <div className="h-full rounded-full bg-[#9b7d4f] transition-[width] duration-700" style={{ width: `${fundingPercentage}%` }} />
              </div>
              <div className="mt-2 flex justify-between gap-3 text-[9px] text-neutral-500">
                <span>Van {formatFundingAmount(busFunding.goalCents)}</span>
                <span>Bus + atelierombouw</span>
              </div>
              <p className="mt-3 text-[10px] leading-5 text-neutral-500">Het doel reserveert ruimte voor een betrouwbare gebruikte bus, een veilige basisinrichting, elektra, presentatiewanden en materiaalopslag.</p>
            </div>
            <button type="button" onClick={() => navigate('/doneren')} className="mt-4 w-full rounded-full bg-[#2f2a24] px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-white transition hover:bg-[#473d32]">Doneer aan het rijdende atelier ♥</button>
          </aside>
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
            {calendar.map((day, index) => {
              if (day === null) return <div key={`empty-${index}`} />
              const dayEvent = eventForDay(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  aria-pressed={selectedDay === day}
                  aria-label={`${fullDate(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)}${isToday(day) ? ', vandaag' : ''}; ${dayEvent ? dayEvent.title : 'geen evenement gepland'}`}
                  className={`relative aspect-square rounded-full text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 ${
                    selectedDay === day
                      ? 'bg-neutral-900 text-white'
                      : dayEvent
                        ? 'border border-[#9c7d4c] bg-[#c6a978]/35 font-semibold'
                      : isToday(day)
                        ? 'border border-neutral-800/50 bg-white/35'
                        : 'hover:bg-white/50'
                  }`}
                >
                  {day}
                  {dayEvent && <span aria-hidden="true" className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#8a6b43]" />}
                </button>
              )
            })}
          </div>
          </> : <div className="min-h-72 space-y-3">{filteredEvents.length ? filteredEvents.map((event) => <article id={event.id} key={event.id} className="scroll-mt-6 overflow-hidden rounded-xl border border-neutral-800/10 bg-white/30"><figure><img src={event.image} alt={event.imageAlt} width="1024" height="768" loading="lazy" decoding="async" className="aspect-[16/9] w-full object-cover" /><figcaption className="px-5 pt-3 text-[10px] italic text-neutral-500">{event.imageCaption}</figcaption></figure><div className="p-5 pt-4"><p className="text-[9px] uppercase tracking-[0.16em] text-[#8a6b43]">{event.type} · {event.admission}</p><h2 className="mt-2 text-base font-semibold uppercase tracking-[0.13em]">{event.title}</h2><p className="mt-3 text-sm leading-6 text-neutral-600">{formatEventDate(event)} · {event.startTime}–{event.endTime}</p><p className="text-sm leading-6 text-neutral-600">{event.street}, {event.city} · {event.locationNote}</p><button type="button" onClick={() => downloadAgenda(event)} className="mt-4 rounded-full border border-neutral-800/20 px-4 py-2 text-[9px] uppercase tracking-[0.14em]">Zet in mijn agenda</button></div></article>) : <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800/15 p-8 text-center"><p className="text-xs uppercase tracking-[0.16em]">Nog geen bevestigde {eventType.toLowerCase()}</p></div>}</div>}
        </section>

        <aside className="rounded-xl border border-white/50 bg-white/25 p-6">
          {selectedEvent && (
            <figure className="-mx-2 mb-5 overflow-hidden rounded-lg">
              <img src={selectedEvent.image} alt={selectedEvent.imageAlt} width="1024" height="768" loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <figcaption className="px-2 pt-2 text-[9px] italic leading-4 text-neutral-500">{selectedEvent.imageCaption}</figcaption>
            </figure>
          )}
          <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            {selectedDay
              ? `${selectedDay} ${months[visibleMonth.getMonth()]}`
              : 'Agenda'}
          </p>
          <h2 className="mt-3 text-base font-semibold uppercase tracking-[0.12em]">
            {selectedEvent ? selectedEvent.title : selectedDay ? 'Nog geen evenement' : 'Eerstvolgende datum'}
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            {selectedEvent
              ? `${selectedEvent.startTime}–${selectedEvent.endTime} · ${selectedEvent.street}, ${selectedEvent.city}. ${selectedEvent.locationNote}.`
              : selectedDay
              ? 'Voor deze dag staat nog geen festival of markt gepland.'
              : `${formatEventDate(events[0])}: ${events[0].title} in ${events[0].city}.`}
          </p>
          <div className="mt-6 border-t border-neutral-800/10 pt-5 text-xs leading-5 text-neutral-500">
            {selectedEvent ? selectedEvent.admission : 'Bevestigde data hebben een draadmarkering in de kalender.'}
          </div>
          <button type="button" disabled={!selectedEvent} onClick={() => selectedEvent && downloadAgenda(selectedEvent)} className="mt-5 w-full rounded-full border border-neutral-800/15 px-4 py-3 text-[10px] uppercase tracking-[0.13em] disabled:cursor-not-allowed disabled:text-neutral-400">Toevoegen aan agenda</button>
        </aside>
      </div>
    </div>
  )
}

export default Evenementen
