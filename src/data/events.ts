export type AtelierEvent = {
  id: string
  title: string
  type: 'Festival' | 'Markt' | 'Expositie'
  date: string
  startTime: string
  endTime: string
  street: string
  city: string
  locationNote: string
  admission: string
  description: string
  image: string
  imageAlt: string
  imageCaption: string
}

export const events: AtelierEvent[] = [
  {
    id: 'grietmarkt-amerongen-2026',
    title: 'Grietmarkt',
    type: 'Markt',
    date: '2026-09-12',
    startTime: '10:00',
    endTime: '17:00',
    street: 'Margaretha Turnorlaan',
    city: 'Amerongen',
    locationNote: 'Tegenover Kasteel Amerongen',
    admission: 'Gratis te bezoeken',
    description: 'Ontmoet Jannie en ontdek Stilte & Draad op de Grietmarkt in Amerongen.',
    image: '/events/grietmarkt-amerongen-2026.webp',
    imageAlt: 'Bezoekers en marktkramen op een eerdere Grietmarkt in Amerongen',
    imageCaption: 'Sfeerbeeld van een eerdere editie van de Grietmarkt, 11 mei 2013.',
  },
]

export const eventDate = (event: AtelierEvent) => new Date(`${event.date}T12:00:00`)

export const formatEventDate = (event: AtelierEvent) =>
  new Intl.DateTimeFormat('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .format(eventDate(event))
