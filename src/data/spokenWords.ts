export type SpokenWordId = 'de-eerste-draad' | 'stilte-en-draad' | 'de-laatste-draad'

export type SpokenWord = {
  id: SpokenWordId
  title: string
  audioSrc: string
  status: 'verified'
  lyrics: string
}

export const spokenWords: Record<SpokenWordId, SpokenWord> = {
  'de-eerste-draad': {
    id: 'de-eerste-draad', title: 'De Eerste Draad', audioSrc: '/audio/de-eerste-draad.mp3', status: 'verified',
    lyrics: `De eerste draad
Het minst opvallend straks als het af is
Maar toch de draad die de vorm bepaalt

Het eerste resultaat
Het meest opwindend straks als het af is
Voelt het als het einde van een verhaal
Maar alles wat begint moet nu eenmaal een einde hebben
Dat noemen we het plot

Met elke draad die ik verbind kom ik iets dichter bij dat einde
Ik noem dat het lot
Na elk einde is het even stil
Maar in die stilte wordt altijd weer iets nieuws geboren
Een nieuw idee, een nieuw concept
Na elk einde begint het weer van voren

Maar nu, dit is pas het begin
Ik leid de draad, de draad leidt mij
Dat is hoe ik verbind
Hier met mezelf in de stilte
Alleen ik en de haak
Ik ben benieuwd wat het gaat worden

Dit is de eerste draad
(Hmm-mm-mm)
(Hmm-mm-mm)
(Hmm-mm-mm)
(Hmm-mm-mm)`,
  },
  'stilte-en-draad': {
    id: 'stilte-en-draad', title: 'Stilte & Draad', audioSrc: '/audio/stilte-en-draad.wav', status: 'verified',
    lyrics: `Als dromen in de wind.
Dromen vangend, want ik ben een dromenvanger.
Altijd vooruitstreven.

Ik ben dankbaar voor mijn dromen.
Zij houden mij levend.
En of ze ooit uitkomen, dat is aan mij.

Elke stap die ik zet: een stap dichterbij.
Elke draad die ik weef is een draad geweest van mijn leven.
Zelfs al was ik de draad soms even kwijt.

Elke draad die ik weef is een verhaal,
verpakt in kleuren en vormen.
Daarom verkoop ik geen producten.
Ik verkoop mij.

Als dromen in de wind.
Nog niet bereid om mijn dromen te laten varen.
Ik blijf dromen zolang ik adem.
Want dromen heeft een mens nodig,
zelfs als ze nooit uitkomen.

Blijf dromen, want dromen is streven.
En streven is beter dan nooit te zijn gegaan.

Blijf niet alleen hopen,
want hopen is smeken
en dan blijf je daar maar staan.

Blijf lopen, want lopen is helend.
De zon op je huid, zelfs de regen.

Blijf open, want zodra je hart is gesloten,
dan passeert het leven aan je voorbij.

Stilte en draad.
Stilte en draad.
Stilte en draad.`,
  },
  'de-laatste-draad': {
    id: 'de-laatste-draad', title: 'De Laatste Draad', audioSrc: '/audio/de-laatste-draad.mp3', status: 'verified',
    lyrics: `Eindigen is loslaten,
dus we zijn liever nooit klaar.

Eindigen is bepalen wanneer het goed genoeg is,
dus we zijn liever nooit klaar.

Eindigen is toegeven dat alles een begin en een eind heeft.
Ook wij.
We zijn liever nooit klaar.

De laatste draad, wat komt erna?

De stilte…
De leegte…

Beginnen is makkelijker, het eist slechts inspiratie.
Eindigen is moeilijker, het eist volharding,
vertrouwen, geduld, motivatie.

Ik weef zoals ik het leven beleef.
Soms recht, soms scheef,
maar altijd echt, altijd mij.

Eindigen is moeilijk, maar ik omarm het eind.

Ben klaar voor de stilte…
De leegte…

Want daar in die stilte
hoor ik leven spreken.

Wellicht de stem van inspiratie voor een nieuw begin.
Wellicht gewoon stilte…`,
  },
}
