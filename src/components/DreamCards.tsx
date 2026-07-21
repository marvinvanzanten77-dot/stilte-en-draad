import { useEffect, useState } from 'react'

type DreamCard = {
  id: string
  title: string
  image: string
  meaning: string
  invitation: string
}

const dreamCards: DreamCard[] = [
  { id: 'eerste-stap', title: 'De Eerste Stap', image: '/droomkaarten/01-de-eerste-stap.png', meaning: 'Je hoeft de hele weg nog niet te kunnen zien. Een droom wordt werkelijk zodra je haar een kleine plaats in je dag geeft.', invitation: 'Besteed vandaag tien minuten aan datgene wat je steeds uitstelt.' },
  { id: 'open-deur', title: 'De Open Deur', image: '/droomkaarten/02-de-open-deur.png', meaning: 'Niet alles achter de drempel hoeft al bekend te zijn. Nieuwsgierigheid kan voldoende zijn om verder te gaan.', invitation: 'Zeg vandaag eenmaal ja tegen iets wat je normaal uit onzekerheid vermijdt.' },
  { id: 'eigen-stem', title: 'De Eigen Stem', image: '/droomkaarten/03-de-eigen-stem.png', meaning: 'Wat alleen jij kunt maken, ontstaat pas wanneer jouw eigen stem meer ruimte krijgt dan de verwachtingen om je heen.', invitation: 'Schrijf in één zin op wat jij werkelijk wilt maken of beleven.' },
  { id: 'lange-draad', title: 'De Lange Draad', image: '/droomkaarten/04-de-lange-draad.png', meaning: 'Vooruitgang is niet altijd zichtbaar. Iedere herhaling, poging en omweg wordt onderdeel van de draad die jou verder brengt.', invitation: 'Kies één kleine handeling die je deze week driemaal wilt herhalen.' },
  { id: 'vuur', title: 'Het Vuur', image: '/droomkaarten/05-het-vuur.png', meaning: 'Bescherm wat jou levend en enthousiast maakt. Een innerlijk vuur hoeft niet groot te zijn om richting te geven.', invitation: 'Maak vandaag bewust ruimte voor iets waar je energie van krijgt.' },
  { id: 'omweg', title: 'De Omweg', image: '/droomkaarten/06-de-omweg.png', meaning: 'Een andere route is geen mislukking. Soms ontdek je juist buiten het oorspronkelijke plan wat werkelijk bij je past.', invitation: 'Benoem één onverwachte verandering die je achteraf iets waardevols bracht.' },
  { id: 'lege-ruimte', title: 'De Lege Ruimte', image: '/droomkaarten/07-de-lege-ruimte.png', meaning: 'Niet iedere leegte hoeft direct gevuld te worden. In open ruimte kan een idee groeien zonder al een antwoord te zijn.', invitation: 'Plan vandaag een kwartier waarin niets hoeft te worden opgelost.' },
  { id: 'losse-knoop', title: 'De Losse Knoop', image: '/droomkaarten/08-de-losse-knoop.png', meaning: 'Wat jou ooit beschermde, kan je nu tegenhouden. Loslaten betekent niet dat iets waardeloos is geweest.', invitation: 'Schrijf één overtuiging op die je niet langer hoeft mee te dragen.' },
  { id: 'spiegel', title: 'De Spiegel', image: '/droomkaarten/09-de-spiegel.png', meaning: 'Kijk opnieuw naar wat je verlangt. Is dit werkelijk jouw droom, of een beeld waarvan je leerde dat het bij je moest passen?', invitation: 'Maak je antwoord af: als niemand keek, dan zou ik…' },
  { id: 'getijden', title: 'De Getijden', image: '/droomkaarten/10-de-getijden.png', meaning: 'Rust en beweging horen bij dezelfde cyclus. Een stille periode betekent niet dat je droom verdwenen is.', invitation: 'Geef jezelf vandaag toestemming om te herstellen zonder schuldgevoel.' },
  { id: 'medereiziger', title: 'De Medereiziger', image: '/droomkaarten/11-de-medereiziger.png', meaning: 'Je hoeft een droom niet alleen te dragen. De juiste verbinding maakt jouw richting niet minder persoonlijk, maar sterker.', invitation: 'Vertel één vertrouwd persoon welke droom je graag meer ruimte wilt geven.' },
  { id: 'nieuw-begin', title: 'Het Nieuwe Begin', image: '/droomkaarten/12-het-nieuwe-begin.png', meaning: 'Ieder begin mag klein zijn. Groei ontstaat niet uit zekerheid, maar uit aandacht voor wat voorzichtig naar het licht beweegt.', invitation: 'Kies vóór het einde van vandaag één zichtbare eerste handeling.' },
]

const DreamCards = () => {
  const [selected, setSelected] = useState<DreamCard | null>(null)

  useEffect(() => {
    if (!selected) return
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setSelected(null)
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [selected])

  return <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-[#c9b99d]/40 p-4 shadow-inner sm:p-5">
    <div className="grid grid-cols-6 gap-2 sm:gap-3" aria-label="Twaalf gedekte droomkaarten">
      {dreamCards.map((card, index) => <button key={card.id} type="button" onClick={() => setSelected(card)} aria-label={`Trek droomkaart ${index + 1}`} className="group relative aspect-[2/3] overflow-hidden rounded-md border border-[#8f7048]/35 bg-[#a77b50] shadow-[0_4px_8px_rgba(65,46,29,.22)] transition duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_8px_15px_rgba(65,46,29,.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f5136]" style={{ transform: `rotate(${(index % 3 - 1) * 1.5}deg)` }}>
        <span className="absolute inset-1 rounded-[3px] border border-[#ead8b5]/55" />
        <span className="absolute inset-[18%] rotate-45 rounded-sm border border-[#ead8b5]/45" />
        <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ead8b5]/70 bg-[#87603f] shadow-inner sm:h-7 sm:w-7" />
        <span className="absolute inset-x-0 bottom-1.5 text-center font-serif text-[8px] text-[#f0dfc1]/75">{String(index + 1).padStart(2, '0')}</span>
      </button>)}
    </div>
    <p className="mt-4 text-center text-[8px] uppercase tracking-[0.18em] text-neutral-500">Kies de kaart die naar je toe trekt</p>

    {selected && <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#d8cbb5]/95 p-4 backdrop-blur-sm">
      <div className="grid max-h-full w-full grid-cols-[minmax(105px,.72fr)_1.28fr] gap-4 overflow-y-auto rounded-xl border border-white/60 bg-[#eee4d2] p-3 shadow-xl sm:grid-cols-[minmax(145px,.8fr)_1.2fr] sm:gap-5 sm:p-4">
        <img src={selected.image} alt={`Textielkaart ${selected.title}`} className="aspect-[2/3] w-full rounded-lg object-cover shadow-[0_8px_18px_rgba(62,44,27,.22)]" />
        <div className="flex min-w-0 flex-col justify-center py-1">
          <p className="text-[8px] uppercase tracking-[0.2em] text-[#9b7d4f]">Jouw droomkaart</p>
          <h3 className="mt-2 text-sm font-semibold uppercase tracking-[0.13em] sm:text-base">{selected.title}</h3>
          <p className="mt-3 text-xs leading-5 text-neutral-600 sm:text-sm sm:leading-6">{selected.meaning}</p>
          <div className="mt-3 border-l border-[#9b7d4f]/55 pl-3"><p className="text-[7px] uppercase tracking-[0.17em] text-neutral-500">Vandaag</p><p className="mt-1.5 font-serif text-xs leading-5 text-neutral-700 sm:text-sm">{selected.invitation}</p></div>
          <button type="button" onClick={() => setSelected(null)} className="mt-4 self-start rounded-full border border-neutral-800/20 px-3 py-2 text-[8px] uppercase tracking-[0.14em] transition hover:bg-white/60">Leg terug en kies opnieuw</button>
        </div>
      </div>
    </div>}
  </div>
}

export default DreamCards
