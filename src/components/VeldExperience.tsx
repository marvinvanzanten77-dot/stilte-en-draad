import { useEffect, useRef, useState } from 'react'

type Memory = {
  id: string
  country: string
  place?: string
  x: number
  y: number
  accent: string
  title: string
  text: string
  transcript: string
  videoSrc?: string
  audioSrc?: string
}

const memories: Memory[] = [
  { id: 'utrecht', country: 'Nederland', place: 'Utrecht', x: 47, y: 24, accent: '#9b6b45', title: 'Waar mijn leven begon', text: 'Utrecht is de plek waar ik als gevoelig meisje opgroeide, moeder werd en uiteindelijk besloot mijn eigen leven werkelijk aan te gaan.', transcript: `Ik ben 71 jaar geleden geboren in een klein steegje aan de Westerkade in Utrecht. Als klein meisje trok ik veel op met een vriend uit de buurt. Ook was ik vaak te vinden bij tantes, neven en andere kinderen thuis.

Bij ons thuis heerste, vooral door mijn vader, veel discipline. Ik was juist een vrij kind dat wilde spelen, ontdekken en beleven. Daarom kwam ik graag bij gezinnen waar het wat losser en ongedwongener was.

Toen ik zes jaar was, verhuisden we naar de Roerstraat. Daar heb ik het grootste deel van mijn jeugd doorgebracht. Van de vier kinderen was ik het gevoelige en kwetsbare type. Ik was graag op mezelf, schuchter en verlegen. Veel van wat ik voelde, hield ik binnen.

Ik bleef in de Roerstraat wonen tot ik trouwde met de vader van mijn oudste kind, mijn dochter Josien. Dat huwelijk duurde vijf jaar. We pasten niet bij elkaar. Ik voelde mij niet gezien en kon binnen die relatie steeds minder mezelf zijn. Hij richtte zich vooral op zijn werk, terwijl ik behoefte had aan warmte, nabijheid en samen leven.

Na het einde van dat huwelijk begon mijn vrije periode. Het werd een ontdekkingsreis waarin ik langzaam losbrak van het onzekere en verlegen meisje dat ik altijd was geweest. Ik besloot het leven niet langer vanaf de zijlijn te bekijken, maar het werkelijk aan te gaan — met alles wat mooi, moeilijk en onverwacht kon zijn.

In die periode ontmoette ik de vader van mijn twee zoons. Eerst werd Marvin geboren en daarna Melton, mijn jongste. Uiteindelijk kwamen we terecht in een huis in Hoograven. Dat werd de plek waar wij samenwoonden en waar onze kinderen als gezin verder opgroeiden.

Utrecht is daardoor niet één herinnering of één huis. Het is de plek waar ik als gevoelig meisje begon, waar ik moeder werd en waar ik voor het eerst bewust koos om mijn eigen leven te leiden.`, videoSrc: '/videos/kaart/utrecht.mp4' },
  { id: 'zeist', country: 'Nederland', place: 'Zeist', x: 47, y: 24, accent: '#6f7957', title: 'Opnieuw ruimte voor mijzelf', text: 'In Zeist veranderde mijn rol binnen de familie. Na jaren intensief zorgen ontstond er opnieuw ruimte om dichter bij mijzelf te komen en mijn eigen leven vorm te geven.', transcript: `Toen mijn kinderen oud genoeg waren om op zichzelf te wonen, verhuisde ik naar een rustigere en intiemere plek in Zeist. Mijn dochter woonde met haar twee kinderen in hetzelfde gebouw. Dat maakte de afstand tussen ons klein, niet alleen letterlijk, maar ook in ons dagelijks leven.

Omdat de vader van haar kinderen niet aanwezig was, speelde ik tijdens hun eerste jaren een grote rol in de verzorging en opvoeding. Ik was veel bij hen en mocht hun ontwikkeling van heel dichtbij meemaken. Ook zag ik hoe mijn dochter groeide in haar rol als moeder. Die periode heeft ons bijzonder hecht gemaakt en ik ben dankbaar dat ik zoveel van hun jonge leven heb mogen delen.

Later kreeg mijn dochter een nieuwe partner. Als moeder en grootmoeder vond ik het niet altijd eenvoudig om mijn positie binnen het gezin te zien veranderen. De plek die jarenlang zo vanzelfsprekend had gevoeld, kreeg een andere vorm. Toch bracht die verandering mij ook iets waardevols: de kans om weer dichter bij mijzelf te komen en mijn eigen leven opnieuw invulling te geven.

In Zeist nam ik een Jack Russell in huis. Ze heette Dushi. Met haar kwam er opnieuw beweging en gezelschap in een huis dat plotseling leger en stiller voelde. Dankzij haar bleef ik naar buiten gaan en ontstonden er onderweg vanzelf kleine contacten met andere mensen.

Mijn twee zoons woonden allebei nog in Utrecht. Zij waren druk bezig hun eigen weg te vinden. Zo ging ieder van ons steeds meer een eigen richting op. Voor mij werd Zeist de plek waar zorgen voor anderen langzaam weer plaats mocht maken voor aandacht voor mijn eigen leven.`, videoSrc: '/videos/kaart/zeist.mp4' },
  { id: 'ijzendoorn', country: 'Nederland', place: 'IJzendoorn', x: 47, y: 24, accent: '#b78a42', title: 'Waar ik de draad terugvond', text: 'In IJzendoorn leerde ik de stilte niet langer als leegte te zien. Hier ontdekte ik opnieuw dat ik een maker ben en vond de beweging van mijn leven een plek in mijn handen.', transcript: `Ik woon nu zeven jaar in IJzendoorn. Misschien een vreemde keuze voor een vrouw die altijd van het bruisende leven heeft gehouden: salsa, dansen, feesten, flirten en avontuur.

Blijkbaar werd ook ik ouder. Niet per se saaier, maar wel uitgekeken op het idee dat ik het leven altijd buiten mijzelf moest zoeken. Ik koos voor een plek waar ik nog sterker met de leegte en de stilte werd geconfronteerd. Voor het eerst woonde ik niet meer in de buurt van mijn kinderen. Ik verruilde de hele regio Utrecht voor een klein dorp in de Betuwe. Helemaal alleen was ik niet; in het nabijgelegen Tiel woont nog een zus van mij.

De coronaperiode bracht mij nog verder naar binnen. Gek genoeg ben ik daar achteraf dankbaar voor. In die tijd maakte ik kennis met een nieuwe kant van mijzelf: een stillere, wijzere en stabielere vrouw, die niet voortdurend iets buiten zichzelf nodig had om te voelen dat zij leefde.

Tijdens een cursus leerde ik haken. Daarmee leerde ik ook om werkelijk stil te zitten. Terwijl mijn handen bezig waren, herontdekte ik iets wat altijd al in mij had gezeten: ik ben een maker. Iemand die iets in beweging moet zetten.

Vroeger bracht ik vooral de mensen om mij heen in beweging, met mijn humor, gastvrijheid, energie en passie. In IJzendoorn begon ik de draad in beweging te brengen. Steek voor steek ontstonden kleuren, vormen en verhalen onder mijn handen.

Misschien was dit wel de rode draad die ik mijn hele leven in de buitenwereld had gezocht. Niet iets wat ik nog hoefde te vinden, maar iets wat al die tijd in mij aanwezig was en alleen op voldoende stilte had gewacht om zichtbaar te worden.`, videoSrc: '/videos/kaart/ijzendoorn.mp4' },
  { id: 'marokko', country: 'Marokko', x: 44, y: 48, accent: '#b56b45', title: 'Kleur die blijft', text: 'Warmte, patronen en verzadigde kleuren vonden een weg terug naar het atelier.', transcript: `Rood in de aarde.\nBlauw waar schaduw valt.\nGoud in het laatste licht.\n\nIk nam niets mee behalve kijken,\nmaar thuis bleken mijn handen\nde kleuren nog te kennen.` },
  { id: 'suriname', country: 'Suriname', x: 27, y: 64, accent: '#657750', title: 'Groen in vele lagen', text: 'Een landschap waarin alles groeit, klinkt en door elkaar heen beweegt.', transcript: `Het groen was nooit één kleur.\nIedere laag droeg een ander licht,\neen ander geluid, een ander verhaal.\n\nSindsdien weet ik:\novervloed hoeft niet luid te zijn.` },
  { id: 'griekenland', country: 'Griekenland', x: 59, y: 40, accent: '#58778b', title: 'Licht op steen', text: 'Helder licht en oude vormen maken zichtbaar hoe schoonheid en slijtage naast elkaar bestaan.', transcript: `Witte muren hielden het zonlicht vast.\nStenen droegen sporen van handen\ndie ik nooit heb gekend.\n\nNiets blijft ongeschonden.\nJuist daarin wordt een oppervlak een verhaal.` },
  { id: 'ibiza', country: 'Ibiza', x: 49, y: 43, accent: '#765b79', title: 'Een vrijer ritme', text: 'Op het eiland werd maken minder een opdracht en meer een beweging van aandacht.', transcript: `De dag had geen haast.\nWind trok losse lijnen door het zand\nen de avond begon zonder aankondiging.\n\nVrijheid is misschien niet alles loslaten,\nmaar voelen welke draad je wilt vasthouden.` },
]

const countries = [
  { name: 'Nederland', x: 54.3, y: 28.5, color: '#9b6b45' },
  { name: 'Marokko', x: 52.6, y: 48.7, color: '#b56b45' },
  { name: 'Suriname', x: 37.5, y: 65.6, color: '#657750' },
  { name: 'Griekenland', x: 59.2, y: 39.7, color: '#58778b' },
  { name: 'Ibiza', x: 53.5, y: 40.5, color: '#765b79' },
]

const VeldExperience = () => {
  const [active, setActive] = useState<Memory | null>(null)
  const [netherlandsOpen, setNetherlandsOpen] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setActive(null)
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [active])

  useEffect(() => {
    if (!netherlandsOpen) return
    const close = (event: PointerEvent) => {
      if (!mapRef.current?.contains(event.target as Node)) setNetherlandsOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [netherlandsOpen])

  const chooseCountry = (country: string) => {
    if (country === 'Nederland') { setNetherlandsOpen((open) => !open); return }
    setNetherlandsOpen(false)
    setActive(memories.find((memory) => memory.country === country) ?? null)
  }

  return <>
    <section className="grid border-t border-neutral-800/10 md:grid-cols-[.85fr_1.15fr]">
      <div className="p-7 md:p-10 lg:p-12">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Lees</p>
        <h2 className="mt-3 text-lg font-semibold uppercase tracking-[0.14em]">Waar de draad de wereld raakt</h2>
        <div className="mt-7 max-w-xl space-y-5 text-sm leading-7 text-neutral-700">
          <p>Mijn werk begint niet aan de werktafel. Het begint buiten, op plekken waar ik heb gewoond, gereisd, gewacht en gekeken. Een kleur op een muur, licht dat door bladeren valt of de bocht van een rivier kan jaren later onverwacht terugkeren in mijn handen.</p>
          <p>Utrecht gaf mij de eerste grond onder mijn voeten. Daarna kwamen andere landschappen: dichtbij en ver weg, vertrouwd en vreemd. Ik verzamelde er geen voorbeelden om na te maken. Ik nam ritmes mee, oppervlakken en gevoelens waarvoor ik toen nog geen woorden had.</p>
          <p className="border-l border-[#9b7d4f]/60 py-1 pl-5 font-serif text-lg leading-8 text-neutral-700">Wanneer ik nu een draad kies, reist zo'n plek soms opnieuw met mij mee. Niet als afbeelding, maar als herinnering die kleur en vorm krijgt.</p>
        </div>
      </div>

      <div className="border-t border-neutral-800/10 p-7 md:border-l md:border-t-0 md:p-10 lg:p-12">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Ontdek</p>
        <h2 className="mt-3 text-lg font-semibold uppercase tracking-[0.14em]">Herinneringen op de kaart</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">Kies een plek en luister naar het verhaal dat daar is achtergebleven. Nederland opent drie kleinere draden.</p>
        <p className="sr-only">De kaart bevat verhalen uit Utrecht, Zeist, IJzendoorn, Marokko, Suriname, Griekenland en Ibiza. Alle plekken zijn als knoppen met het toetsenbord te openen.</p>

        <div ref={mapRef} onClick={() => setNetherlandsOpen(false)} className="relative mt-6 overflow-hidden rounded-2xl border border-white/55 bg-[#cbbda4]/45 shadow-[inset_0_2px_12px_rgba(71,61,47,.22),0_12px_28px_rgba(84,68,48,.14)]">
          <svg viewBox="0 0 760 390" className="block w-full" role="img" aria-label="Gestileerde wereldkaart met herinneringsplekken">
            <defs>
              <radialGradient id="field-map-sea" cx="48%" cy="42%" r="75%"><stop offset="0" stopColor="#c7d3c8" /><stop offset=".58" stopColor="#aebfb6" /><stop offset="1" stopColor="#8fa69f" /></radialGradient>
              <linearGradient id="land-warm" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d6b07d" /><stop offset=".55" stopColor="#ad7b58" /><stop offset="1" stopColor="#85634d" /></linearGradient>
              <linearGradient id="land-green" x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#aeb484" /><stop offset=".6" stopColor="#758064" /><stop offset="1" stopColor="#586653" /></linearGradient>
              <linearGradient id="land-gold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d2af68" /><stop offset=".55" stopColor="#a27c4e" /><stop offset="1" stopColor="#76634d" /></linearGradient>
              <filter id="land-depth" x="-15%" y="-15%" width="130%" height="140%"><feDropShadow dx="0" dy="7" stdDeviation="6" floodColor="#3f4e48" floodOpacity=".32" /><feDropShadow dx="-2" dy="-2" stdDeviation="1" floodColor="#f4ead1" floodOpacity=".38" /></filter>
              <pattern id="field-map-lines" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M18 0H0V18" fill="none" stroke="#f5ecdc" strokeOpacity=".2" /></pattern>
            </defs>
            <rect width="760" height="390" fill="url(#field-map-sea)" />
            <rect width="760" height="390" fill="url(#field-map-lines)" />
            <g stroke="#594d3e" strokeOpacity=".5" strokeWidth="1.4" strokeLinejoin="round" filter="url(#land-depth)">
              <path fill="url(#land-warm)" d="M42 92 72 54l60-28 82 12 54 38 31 50-27 31-39 3-31 43-38 18-22-31-44-3-35-35-39-19Z" />
              <path fill="url(#land-green)" d="m235 181 45 3 38 34 11 54-21 75-28 30-17-51-30-51 5-47-18-26Z" />
              <path fill="url(#land-gold)" d="m346 95 29-33 55-17 45 14 28 31-22 20-29-8-20 18-29-4-18 23-31-9Z" />
              <path fill="url(#land-warm)" d="m385 145 52-10 42 31 28 58-21 65-38 57-35-27-9-58-29-48 13-36-17-22Z" />
              <path fill="url(#land-gold)" d="m468 74 48-22 78 5 90 31 47 39-20 35-54 4-29 36-54 7-34-34-48-10-19-30-38-13Z" />
              <path fill="url(#land-green)" d="m602 275 42-18 70 28 6 39-39 31-68-10-28-34Z" />
              <path fill="#b89363" d="m350 72 10-21 10 25-9 14Z" />
              <path fill="#8a765c" d="m497 232 17 15-5 28-14-9Z" />
            </g>
            <g fill="none" stroke="#f5ecd9" strokeOpacity=".2" strokeWidth="1"><path d="M65 115q85-58 190 9M253 235q37 43 48 103M365 112q128-61 300 26M399 193q50 28 73 115" /></g>
            <path d="M55 326 Q205 288 360 322 T710 304" fill="none" stroke="#f0dfbd" strokeOpacity=".7" strokeWidth="2.5" strokeDasharray="3 9" />
            {countries.map((country) => <g key={country.name} transform={`translate(${country.x * 7.6} ${country.y * 3.9})`} className="cursor-pointer" role="button" tabIndex={0} aria-label={`Open ${country.name}`} onClick={(event) => { event.stopPropagation(); chooseCountry(country.name) }} onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && chooseCountry(country.name)}>
              <circle r="17" fill={country.color} fillOpacity=".18" className="animate-pulse" />
              <circle r="8" fill="#f2eadc" stroke={country.color} strokeWidth="3" />
              <text y="27" textAnchor="middle" fill="#493e31" fontSize="10" letterSpacing="1.4" className="uppercase">{country.name}</text>
            </g>)}
          </svg>
          {netherlandsOpen && <div onClick={(event) => event.stopPropagation()} className="absolute left-1/2 top-3 flex -translate-x-1/2 flex-wrap justify-center gap-2 rounded-full border border-[#9b7d4f]/30 bg-[#f3eadb]/95 p-2 shadow-lg backdrop-blur-sm">
            {memories.filter((memory) => memory.country === 'Nederland').map((memory) => <button key={memory.id} type="button" onClick={() => { setNetherlandsOpen(false); setActive(memory) }} className="rounded-full px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-neutral-700 transition hover:bg-[#9b7d4f] hover:text-white">{memory.place}</button>)}
          </div>}
          <p className="absolute bottom-3 left-4 text-[8px] uppercase tracking-[0.18em] text-neutral-500">Klik op een gemarkeerde plek</p>
        </div>
      </div>
    </section>

    {active && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2e271f]/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="memory-title" onMouseDown={(event) => event.target === event.currentTarget && setActive(null)}>
      <article className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#c6a978]/60 bg-[#eee5d6] shadow-2xl">
        <header className="flex items-start justify-between gap-5 border-b border-neutral-800/10 px-6 py-5">
          <div><p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">{active.country}{active.place ? ` · ${active.place}` : ''}</p><h3 id="memory-title" className="mt-2 text-lg font-semibold uppercase tracking-[0.14em]">{active.title}</h3></div>
          <button type="button" onClick={() => setActive(null)} aria-label="Sluit venster" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-800/20 text-lg text-neutral-600 hover:bg-white/50">×</button>
        </header>
        <div className="grid gap-6 p-6 sm:grid-cols-[1.08fr_.92fr]">
          <div>
            {active.videoSrc ? <video controls muted playsInline preload="metadata" src={active.videoSrc} onVolumeChange={(event) => { event.currentTarget.muted = true }} aria-label={`Stille video-impressie van ${active.place ?? active.country}`} className="aspect-video w-full rounded-xl bg-neutral-900 object-cover" /> : <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-[#39342e] text-[#eee5d6] shadow-inner"><span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 pl-0.5 text-sm">▶</span><span className="mt-3 text-[8px] uppercase tracking-[0.2em] text-white/60">Filmfragment volgt</span></div>}
            <p className="mt-4 text-sm leading-6 text-neutral-600">{active.text}</p>
            <div className="mt-5 rounded-xl border border-[#9b7d4f]/25 bg-white/35 p-4">
              <p className="mb-3 text-[8px] uppercase tracking-[0.18em] text-neutral-500">Gesproken woord</p>
              {active.audioSrc ? <audio controls preload="metadata" src={active.audioSrc} className="h-10 w-full" /> : <div className="flex items-center gap-3" aria-label="Audio wordt later toegevoegd"><button type="button" disabled className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[10px] text-white opacity-65">▶</button><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#9b7d4f]/20"><div className="h-full w-0 bg-[#9b7d4f]" /></div><span className="text-[9px] tabular-nums text-neutral-500">0:00</span></div>}
            </div>
          </div>
          <div className="sm:border-l sm:border-neutral-800/10 sm:pl-6">
            <p className="text-[8px] uppercase tracking-[0.18em] text-neutral-500">In tekst</p>
            <p className="mt-4 whitespace-pre-line font-serif text-base leading-7 text-neutral-700">{active.transcript}</p>
          </div>
        </div>
      </article>
    </div>}
  </>
}

export default VeldExperience
