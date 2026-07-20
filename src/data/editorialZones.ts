export type EditorialZone = {
  eyebrow: string
  title: string
  question: string
  coreLine: string
  introduction: string
  heroImage: string
  heroAlt: string
  chapters: { number: string; title: string; prompt: string }[]
  audioLabel: string
  spokenWordId?: 'de-eerste-draad' | 'de-laatste-draad'
  interactionTitle: string
  interactionText: string
  interactionType: 'portal' | 'field' | 'dream' | 'thread' | 'ritual' | 'silence'
  relatedProductSlug: string
  relatedProductTitle: string
}

export const editorialZones: Record<'de-eerste-draad' | 'veld' | 'droom' | 'textiel' | 'ritueel' | 'stilte', EditorialZone> = {
  'de-eerste-draad': {
    eyebrow: 'De toegang', title: 'De Eerste Draad', question: 'Waarom zou ik binnenstappen?', coreLine: 'Alles begint met één draad.', introduction: 'Plaats hier later Jannies korte welkomstwoord: maximaal vijftig woorden over het begin van haar wereld.', heroImage: '/photos/jannie-2.jpg', heroAlt: 'Jannie als ingang tot het verhaal van Stilte & Draad',
    chapters: [{ number: '01', title: 'Het begin', prompt: 'Hoe begon Jannie met maken?' }, { number: '02', title: 'De draad', prompt: 'Wat betekent de draad in haar leven?' }, { number: '03', title: 'Stap binnen', prompt: 'Wat mag de bezoeker hier ontdekken?' }],
    audioLabel: 'De Eerste Draad · spoken word', spokenWordId: 'de-eerste-draad', interactionTitle: 'De portalen openen', interactionText: 'Deze ruimte kan later de zones één voor één zichtbaar maken.', interactionType: 'portal', relatedProductSlug: 'zacht-begin', relatedProductTitle: 'Zacht Begin',
  },
  veld: {
    eyebrow: 'De oorsprong', title: 'Veld', question: 'Waar komt Jannie vandaan?', coreLine: 'Hier liggen de wortels van iedere draad.', introduction: 'Plaats hier later een korte introductie over landschap, jeugd, familie en de plekken die in Jannies werk voortleven.', heroImage: '/mood-board/Ethereal_Textile_Garden_Stillness.png', heroAlt: 'Een verstild textiellandschap als verbeelding van Jannies oorsprong',
    chapters: [{ number: '01', title: 'De plek', prompt: 'Beschrijf één plaats die Jannie direct voor zich ziet.' }, { number: '02', title: 'De herinnering', prompt: 'Vertel een concrete herinnering die vaak terugkeert.' }, { number: '03', title: 'De kleur', prompt: 'Verbind die plek aan een kleur, materiaal of werk.' }],
    audioLabel: 'Geluid van het veld', interactionTitle: 'Herinneringen in het landschap', interactionText: 'Later kunnen hier betekenisvolle plekken als punten in een veld worden geopend.', interactionType: 'field', relatedProductSlug: 'veld-in-de-wind', relatedProductTitle: 'Veld in de Wind',
  },
  droom: {
    eyebrow: 'De binnenwereld', title: 'Droom', question: 'Wat probeert vorm te krijgen?', coreLine: 'Sommige werken bestaan al voordat ik ze maak.', introduction: 'Plaats hier later een korte tekst over intuïtie, terugkerende beelden, verlangens en werken die nog gemaakt willen worden.', heroImage: '/photos/jannie-1.jpg', heroAlt: 'Jannie in een verstild moment van verbeelding',
    chapters: [{ number: '01', title: 'Wat ik zag', prompt: 'Een droom, beeld of kleur die bleef hangen.' }, { number: '02', title: 'Wat ik voelde', prompt: 'Het gevoel onder het beeld, zonder het uit te leggen.' }, { number: '03', title: 'Wat nog komt', prompt: 'Een werk of wens die nog geen vorm heeft.' }],
    audioLabel: 'Een droom in Jannies stem', interactionTitle: 'De droomtafel', interactionText: 'Later kunnen losse woorden, kleuren en vormen hier langzaam samenkomen.', interactionType: 'dream', relatedProductSlug: 'dromen-van-water', relatedProductTitle: 'Dromen van Water',
  },
  textiel: {
    eyebrow: 'Het ambacht', title: 'Textiel', question: 'Hoe wordt een gevoel tastbaar?', coreLine: 'Mijn handen weten soms eerder wat er moet gebeuren.', introduction: 'Plaats hier later de concrete uitleg over materiaal, techniek, kleurkeuze, fouten, herhaling en het moment waarop een werk voltooid voelt.', heroImage: '/mood-board/Crochet_Hands_Warm_Earth.png', heroAlt: 'Handen aan het werk met draad en textiel',
    chapters: [{ number: '01', title: 'Kiezen', prompt: 'Hoe worden kleur en materiaal gekozen?' }, { number: '02', title: 'Maken', prompt: 'Welke handelingen en technieken bouwen het werk op?' }, { number: '03', title: 'Loslaten', prompt: 'Wanneer is het werk klaar om te vertrekken?' }],
    audioLabel: 'Klanken van het atelier', interactionTitle: 'Volg de draad', interactionText: 'Later kan de bezoeker hier stap voor stap door het maakproces bewegen.', interactionType: 'thread', relatedProductSlug: 'levenslijnen', relatedProductTitle: 'Levenslijnen',
  },
  ritueel: {
    eyebrow: 'Het ritme', title: 'Ritueel', question: 'Welke handelingen geven betekenis?', coreLine: 'Het werk begint voordat de eerste steek wordt gemaakt.', introduction: 'Plaats hier later Jannies vaste ritme: gaan zitten, materiaal neerleggen, beginnen, herhalen, kijken, benoemen en overdragen.', heroImage: '/mood-board/Golden_Atelier_Morning.png', heroAlt: 'Warm ochtendlicht in een rustig atelier',
    chapters: [{ number: '01', title: 'Voorbereiden', prompt: 'Hoe begint een dag aan de werktafel?' }, { number: '02', title: 'Herhalen', prompt: 'Welke handeling brengt rust en concentratie?' }, { number: '03', title: 'Overdragen', prompt: 'Wat gebeurt er wanneer een werk het atelier verlaat?' }],
    audioLabel: 'Het ritme van de werktafel', interactionTitle: 'Zeven handelingen', interactionText: 'Later kan iedere stap van het maak- en overdrachtsritueel afzonderlijk worden geopend.', interactionType: 'ritual', relatedProductSlug: 'aan-de-tak', relatedProductTitle: 'Aan de Tak',
  },
  stilte: {
    eyebrow: 'De ademruimte', title: 'Stilte', question: 'Wat blijft wanneer het maken stopt?', coreLine: 'Stilte is de ruimte waarin een nieuwe draad kan beginnen.', introduction: 'Plaats hier later slechts enkele regels. Deze pagina hoeft niet uit te leggen; zij mag de bezoeker laten vertragen en kijken.', heroImage: '/mood-board/Golden_Atelier_Morning.png', heroAlt: 'Een stil atelier in zacht gouden licht',
    chapters: [{ number: '01', title: 'Stoppen', prompt: 'Wat gebeurt er wanneer de handen stilvallen?' }, { number: '02', title: 'Kijken', prompt: 'Wat ziet Jannie pas wanneer zij afstand neemt?' }, { number: '03', title: 'Opnieuw', prompt: 'Welke eerste gedachte kondigt een nieuwe draad aan?' }],
    audioLabel: 'Stilte & Draad · instrumentaal', interactionTitle: 'Blijf nog even', interactionText: 'Deze ruimte wordt later een eenvoudige adempauze zonder verdere opdracht.', interactionType: 'silence', relatedProductSlug: 'nachtgetij', relatedProductTitle: 'Nachtgetij',
  },
}
