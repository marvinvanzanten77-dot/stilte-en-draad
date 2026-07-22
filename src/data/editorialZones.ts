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
  readingText?: string
  spokenWordId?: 'de-eerste-draad' | 'stilte-en-draad' | 'stilte' | 'de-laatste-draad'
  interactionTitle: string
  interactionText: string
  interactionType: 'portal' | 'field' | 'dream' | 'thread' | 'ritual' | 'silence'
  relatedProductSlug: string
  relatedProductTitle: string
}

export const editorialZones: Record<'de-eerste-draad' | 'veld' | 'droom' | 'ritueel' | 'stilte', EditorialZone> = {
  'de-eerste-draad': {
    eyebrow: 'De toegang', title: 'De Eerste Draad', question: 'Waarom zou ik binnenstappen?', coreLine: 'Alles begint met één draad.', introduction: 'Welkom in mijn wereld van stilte, kleur en draad. Hier groeit ieder werk langzaam vanuit een gevoel, een herinnering of een droom. De eerste draad weet nog niet waar hij eindigt — en juist daarin begint het verhaal.', heroImage: '/photos/jannie-2.jpg', heroAlt: 'Jannie als ingang tot het verhaal van Stilte & Draad',
    chapters: [{ number: '01', title: 'Het begin', prompt: 'Beginnen vraagt niet om zekerheid. Alleen om inspiratie en de moed om de eerste draad vast te pakken.' }, { number: '02', title: 'De draad', prompt: 'Ik leid de draad en de draad leidt mij. Zo ontstaat de vorm terwijl ik haar maak.' }, { number: '03', title: 'Stap binnen', prompt: 'Kijk niet alleen naar wat het geworden is. Volg de kleuren, vormen en gedachten waaruit het groeide.' }],
    audioLabel: 'De Eerste Draad · spoken word', spokenWordId: 'de-eerste-draad', interactionTitle: 'Weef je eerste draad', interactionText: 'Begin zonder te weten waar je eindigt. Houd de draad vast en beweeg vrij; iedere bocht en kruising brengt jouw vorm dichterbij.', interactionType: 'portal', relatedProductSlug: 'zacht-begin', relatedProductTitle: 'Zacht Begin',
  },
  veld: {
    eyebrow: 'De oorsprong', title: 'Veld', question: 'Wat neem ik mee van de wereld om mij heen?', coreLine: 'Hier liggen de wortels van iedere draad.', introduction: 'Ik ben Jannie van Zanten, geboren op 23 december 1954 in Utrecht. Moeder van drie kinderen: een dochter en twee zoons. Ik maak niet los van het leven; wat ik heb liefgehad, geleerd en meegedragen vindt zijn weg naar mijn handen, soms als kleur en soms als vorm.', heroImage: '/mood-board/Ethereal_Textile_Garden_Stillness.png', heroAlt: 'Een verstild textiellandschap als verbeelding van Jannies oorsprong',
    chapters: [{ number: '01', title: 'De plek', prompt: 'Mijn verhaal begon in Utrecht. Een geboorteplek is meer dan een punt op de kaart; het is de eerste grond onder je voeten.' }, { number: '02', title: 'De draden', prompt: 'Als moeder van een dochter en twee zoons weet ik hoe levens met elkaar verbonden raken en ieder toch een eigen richting kiezen.' }, { number: '03', title: 'De kleur', prompt: 'Kleur zegt wat woorden niet altijd kunnen: warmte, verlangen, liefde, verlies en opnieuw beginnen.' }],
    audioLabel: 'Luister naar het veld', interactionTitle: 'Herinneringen in het landschap', interactionText: 'De punten liggen als herinneringen verspreid in een landschap. Afzonderlijk zijn ze klein; samen bepalen ze waar een werk vandaan komt.', interactionType: 'field', relatedProductSlug: 'veld-in-de-wind', relatedProductTitle: 'Veld in de Wind',
  },
  droom: {
    eyebrow: 'De binnenwereld', title: 'Droom', question: 'Wat probeert vorm te krijgen?', coreLine: 'Sommige werken bestaan al voordat ik ze maak.', introduction: 'Ik ben een dromenvanger. Niet omdat iedere droom uitkomt, maar omdat dromen mij in beweging houden. Ik blijf niet alleen hopen; ik zet een stap, pak een draad en geef het onzichtbare langzaam een vorm.', heroImage: '/photos/jannie-1.jpg', heroAlt: 'Jannie in een verstild moment van verbeelding',
    chapters: [{ number: '01', title: 'Wat ik zag', prompt: 'Soms begint een werk als een beeld dat blijft terugkomen. Nog zonder uitleg, maar niet zonder betekenis.' }, { number: '02', title: 'Wat ik voelde', prompt: 'Onder iedere vorm ligt een gevoel. Ik hoef het niet eerst te begrijpen om het te kunnen volgen.' }, { number: '03', title: 'Wat nog komt', prompt: 'Een droom wordt niet kleiner omdat zij nog geen werkelijkheid is. Zij wijst mij waar ik verder kan gaan.' }],
    audioLabel: 'Stilte & Draad · spoken word', spokenWordId: 'stilte-en-draad', interactionTitle: 'De droomtafel', interactionText: 'Twaalf kaarten, twaalf uitnodigingen om jouw droom serieus te nemen. Kies niet met je hoofd; trek de kaart die als eerste naar je toe lijkt te bewegen.', interactionType: 'dream', relatedProductSlug: 'dromen-van-water', relatedProductTitle: 'Dromen van Water',
  },
  ritueel: {
    eyebrow: 'Het ritme', title: 'Ritueel', question: 'Welke handelingen geven betekenis?', coreLine: 'Het werk begint voordat de eerste steek wordt gemaakt.', introduction: 'Ik ga zitten, leg de materialen voor mij neer en maak ruimte voor wat wil ontstaan. Dan begint het ritme: kijken, voelen, maken en opnieuw kijken. Niet om sneller klaar te zijn, maar om dichter te komen bij wat het werk wil zeggen.', heroImage: '/mood-board/Golden_Atelier_Morning.png', heroAlt: 'Warm ochtendlicht in een rustig atelier',
    chapters: [{ number: '01', title: 'Voorbereiden', prompt: 'Eerst vertraag ik. Ik leg klaar wat ik nodig heb en laat de druk om het eind al te kennen los.' }, { number: '02', title: 'Herhalen', prompt: 'In de terugkerende beweging worden mijn handen stil en hoor ik beter welke kant de draad op wil.' }, { number: '03', title: 'Overdragen', prompt: 'Wanneer een werk vertrekt, geef ik niet alleen materiaal door. Ik geef iets mee van de weg die ik erin heb afgelegd.' }],
    audioLabel: 'Het ritme van de werktafel', readingText: 'Lang voor onze tijd gaven volkeren uit de oudheid met rituelen betekenis aan geboorte, oogst, verlies, verandering en een nieuw begin. Toch hoeft een ritueel niet groots, mystiek of uitgesproken spiritueel te zijn. Het kan juist eenvoudig en aards zijn: gaan zitten, de materialen klaarleggen, een kaars aansteken of met aandacht de eerste draad kiezen. Het verschil tussen een gewoonte en een ritueel zit niet in de handeling, maar in het bewustzijn waarmee je haar uitvoert. Een gewoonte gebeurt vanzelf. Een ritueel vraagt je om werkelijk aanwezig te zijn.', interactionTitle: 'De aandacht blijft', interactionText: 'Oude en moderne handelingen spiegelen elkaar. De tijd en de vorm veranderen, maar wanneer wij bewust aanwezig zijn, krijgt het alledaagse opnieuw betekenis.', interactionType: 'ritual', relatedProductSlug: 'aan-de-tak', relatedProductTitle: 'Aan de Tak',
  },
  stilte: {
    eyebrow: 'De ademruimte', title: 'Stilte', question: 'Wat blijft wanneer het maken stopt?', coreLine: 'Stilte is de ruimte waarin een nieuwe draad kan beginnen.', introduction: 'Na ieder einde is het even stil. Geen leegte die gevuld moet worden, maar ruimte om te horen wat het leven terugzegt. Misschien klinkt daar de inspiratie voor een nieuw begin. Misschien gewoon stilte.', heroImage: '/mood-board/Golden_Atelier_Morning.png', heroAlt: 'Een stil atelier in zacht gouden licht',
    chapters: [{ number: '01', title: 'Stoppen', prompt: 'Eindigen is toegeven dat iets goed genoeg mag zijn. Mijn handen vallen stil en de draad laat mij los.' }, { number: '02', title: 'Kijken', prompt: 'Pas op afstand zie ik wat al die afzonderlijke keuzes samen zijn geworden.' }, { number: '03', title: 'Opnieuw', prompt: 'In de stilte wordt altijd weer iets nieuws geboren. Eerst een gedachte. Dan een eerste draad.' }],
    audioLabel: 'Stilte · spoken word', spokenWordId: 'stilte', interactionTitle: 'Dertig seconden ruimte', interactionText: 'Geen opdracht en geen geluid dat iets voor je invult. Alleen een korte, bewuste stilte om op te merken wat er al is.', interactionType: 'silence', relatedProductSlug: 'nachtgetij', relatedProductTitle: 'Nachtgetij',
  },
}
