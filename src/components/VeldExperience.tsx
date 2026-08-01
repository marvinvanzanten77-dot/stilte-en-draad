import { useCallback, useEffect, useRef, useState } from 'react'
import { useDialogFocus } from '../hooks/useDialogFocus'

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
  videoPoster?: string
}

const memories: Memory[] = [
  { id: 'utrecht', country: 'Nederland', place: 'Utrecht', x: 47, y: 24, accent: '#9b6b45', title: 'Waar mijn leven begon', text: 'Utrecht is de plek waar ik als gevoelig meisje opgroeide, moeder werd en uiteindelijk besloot mijn eigen leven werkelijk aan te gaan.', transcript: `Ik ben 71 jaar geleden geboren in een klein steegje aan de Westerkade in Utrecht. Als klein meisje trok ik veel op met een vriend uit de buurt. Ook was ik vaak te vinden bij tantes, neven en andere kinderen thuis.

Bij ons thuis heerste, vooral door mijn vader, veel discipline. Ik was juist een vrij kind dat wilde spelen, ontdekken en beleven. Daarom kwam ik graag bij gezinnen waar het wat losser en ongedwongener was.

Toen ik zes jaar was, verhuisden we naar de Roerstraat. Daar heb ik het grootste deel van mijn jeugd doorgebracht. Van de vier kinderen was ik het gevoelige en kwetsbare type. Ik was graag op mezelf, schuchter en verlegen. Veel van wat ik voelde, hield ik binnen.

Ik bleef in de Roerstraat wonen tot ik trouwde met de vader van mijn oudste kind, mijn dochter Josien. Dat huwelijk duurde vijf jaar. We pasten niet bij elkaar. Ik voelde mij niet gezien en kon binnen die relatie steeds minder mezelf zijn. Hij richtte zich vooral op zijn werk, terwijl ik behoefte had aan warmte, nabijheid en samen leven.

Na het einde van dat huwelijk begon mijn vrije periode. Het werd een ontdekkingsreis waarin ik langzaam losbrak van het onzekere en verlegen meisje dat ik altijd was geweest. Ik besloot het leven niet langer vanaf de zijlijn te bekijken, maar het werkelijk aan te gaan — met alles wat mooi, moeilijk en onverwacht kon zijn.

In die periode ontmoette ik de vader van mijn twee zoons. Eerst werd Marvin geboren en daarna Melton, mijn jongste. Uiteindelijk kwamen we terecht in een huis in Hoograven. Dat werd de plek waar wij samenwoonden en waar onze kinderen als gezin verder opgroeiden.

Utrecht is daardoor niet één herinnering of één huis. Het is de plek waar ik als gevoelig meisje begon, waar ik moeder werd en waar ik voor het eerst bewust koos om mijn eigen leven te leiden.`, videoSrc: '/videos/kaart/utrecht.mp4?v=optimized-20260801', videoPoster: '/videos/kaart/utrecht-poster.webp?v=optimized-20260801' },
  { id: 'zeist', country: 'Nederland', place: 'Zeist', x: 47, y: 24, accent: '#6f7957', title: 'Opnieuw ruimte voor mijzelf', text: 'In Zeist veranderde mijn rol binnen de familie. Na jaren intensief zorgen ontstond er opnieuw ruimte om dichter bij mijzelf te komen en mijn eigen leven vorm te geven.', transcript: `Toen mijn kinderen oud genoeg waren om op zichzelf te wonen, verhuisde ik naar een rustigere en intiemere plek in Zeist. Mijn dochter woonde met haar twee kinderen in hetzelfde gebouw. Dat maakte de afstand tussen ons klein, niet alleen letterlijk, maar ook in ons dagelijks leven.

Omdat de vader van haar kinderen niet aanwezig was, speelde ik tijdens hun eerste jaren een grote rol in de verzorging en opvoeding. Ik was veel bij hen en mocht hun ontwikkeling van heel dichtbij meemaken. Ook zag ik hoe mijn dochter groeide in haar rol als moeder. Die periode heeft ons bijzonder hecht gemaakt en ik ben dankbaar dat ik zoveel van hun jonge leven heb mogen delen.

Later kreeg mijn dochter een nieuwe partner. Als moeder en grootmoeder vond ik het niet altijd eenvoudig om mijn positie binnen het gezin te zien veranderen. De plek die jarenlang zo vanzelfsprekend had gevoeld, kreeg een andere vorm. Toch bracht die verandering mij ook iets waardevols: de kans om weer dichter bij mijzelf te komen en mijn eigen leven opnieuw invulling te geven.

In Zeist nam ik een Jack Russell in huis. Ze heette Dushi. Met haar kwam er opnieuw beweging en gezelschap in een huis dat plotseling leger en stiller voelde. Dankzij haar bleef ik naar buiten gaan en ontstonden er onderweg vanzelf kleine contacten met andere mensen.

Mijn twee zoons woonden allebei nog in Utrecht. Zij waren druk bezig hun eigen weg te vinden. Zo ging ieder van ons steeds meer een eigen richting op. Voor mij werd Zeist de plek waar zorgen voor anderen langzaam weer plaats mocht maken voor aandacht voor mijn eigen leven.`, videoSrc: '/videos/kaart/zeist.mp4?v=optimized-20260801', videoPoster: '/videos/kaart/zeist-poster.webp?v=optimized-20260801' },
  { id: 'ijzendoorn', country: 'Nederland', place: 'IJzendoorn', x: 47, y: 24, accent: '#b78a42', title: 'Waar ik de draad terugvond', text: 'In IJzendoorn leerde ik de stilte niet langer als leegte te zien. Hier ontdekte ik opnieuw dat ik een maker ben en vond de beweging van mijn leven een plek in mijn handen.', transcript: `Ik woon nu zeven jaar in IJzendoorn. Misschien een vreemde keuze voor een vrouw die altijd van het bruisende leven heeft gehouden: salsa, dansen, feesten, flirten en avontuur.

Blijkbaar werd ook ik ouder. Niet per se saaier, maar wel uitgekeken op het idee dat ik het leven altijd buiten mijzelf moest zoeken. Ik koos voor een plek waar ik nog sterker met de leegte en de stilte werd geconfronteerd. Voor het eerst woonde ik niet meer in de buurt van mijn kinderen. Ik verruilde de hele regio Utrecht voor een klein dorp in de Betuwe. Helemaal alleen was ik niet; in het nabijgelegen Tiel woont nog een zus van mij.

De coronaperiode bracht mij nog verder naar binnen. Gek genoeg ben ik daar achteraf dankbaar voor. In die tijd maakte ik kennis met een nieuwe kant van mijzelf: een stillere, wijzere en stabielere vrouw, die niet voortdurend iets buiten zichzelf nodig had om te voelen dat zij leefde.

Tijdens een cursus leerde ik haken. Daarmee leerde ik ook om werkelijk stil te zitten. Terwijl mijn handen bezig waren, herontdekte ik iets wat altijd al in mij had gezeten: ik ben een maker. Iemand die iets in beweging moet zetten.

Vroeger bracht ik vooral de mensen om mij heen in beweging, met mijn humor, gastvrijheid, energie en passie. In IJzendoorn begon ik de draad in beweging te brengen. Steek voor steek ontstonden kleuren, vormen en verhalen onder mijn handen.

Misschien was dit wel de rode draad die ik mijn hele leven in de buitenwereld had gezocht. Niet iets wat ik nog hoefde te vinden, maar iets wat al die tijd in mij aanwezig was en alleen op voldoende stilte had gewacht om zichtbaar te worden.`, videoSrc: '/videos/kaart/ijzendoorn.mp4?v=optimized-20260801', videoPoster: '/videos/kaart/ijzendoorn-poster.webp?v=optimized-20260801' },
  { id: 'marokko', country: 'Marokko', place: 'Fez', x: 44, y: 48, accent: '#b56b45', title: 'Een draad zonder antwoord', text: 'In Fez ontdekte Jannie opnieuw dat oprechte aandacht soms genoeg is om iemand te herinneren aan de mogelijkheden die hij zelf niet meer zag.', transcript: `Ook naar Fez reisde ik alleen.

Na Suriname was ik eraan gewend geraakt om zelfstandig op weg te gaan. Toch verdween de spanning nooit helemaal. Iedere reis begon met hetzelfde dubbele gevoel: vertrouwen in wat ik inmiddels kon, en onzekerheid over alles wat ik nog niet kende.

Misschien is dat wat reizen voor mij betekent.

Niet wachten tot de angst verdwenen is,
maar vertrekken terwijl zij nog naast me loopt.

In Fez had ik een kookworkshop geregeld. Ik wilde de Marokkaanse cultuur niet alleen bekijken, maar haar ook proeven. Zelf leren hoe de gerechten werden gemaakt, welke kruiden bij elkaar hoorden en hoeveel aandacht er in iedere handeling zat.

Ik vind het mooier om iets zelf te leren maken dan het alleen voorgeschoteld te krijgen. Dat geldt voor eten, maar eigenlijk ook voor het leven. Ik wil niet alleen ontvangen wat al klaarstaat. Ik wil begrijpen waar het vandaan komt, mijn handen gebruiken en ontdekken hoe afzonderlijke ingrediënten samen iets nieuws kunnen vormen.

De plek waar ik verbleef was prachtig. Een traditioneel Marokkaans ingericht pand, vol patronen, kleuren en details, met in het midden een stille binnentuin. Een beschutte wereld achter de drukte van de stad.

In het pand werkte een jonge Afrikaanse man. Zoals wel vaker tijdens mijn reizen ontstond er binnen korte tijd een bijzondere vriendschap. Eerst waren er de gewone gesprekken, maar al snel vertelde hij mij dat hij in Marokko was gestrand. Hij werkte er lange dagen voor veel te weinig geld en wist niet goed hoe hij verder moest.

We spraken niet alleen over zijn omstandigheden, maar vooral over de persoon die daaronder verborgen zat. Over wat hij wilde, waar hij bang voor was en het leven dat hij misschien nog niet voor zichzelf durfde voor te stellen.

Ik zag mogelijkheden in hem die hij zelf nog niet volledig leek te kunnen zien. Daarom probeerde ik hem te blijven aanmoedigen. Niet door te bepalen welke weg hij moest nemen, maar door hem te laten zien dat er überhaupt nog een weg was.

Ook na mijn terugkeer hielden we regelmatig contact.

Na verloop van tijd kreeg ik een bericht van hem. Hij had besloten zijn werk en die plek achter zich te laten en ergens anders opnieuw te beginnen.

Misschien had hij alleen iemand nodig die hem even een spiegel voorhield.

Niet om hem te vertellen wie hij moest worden,
maar om hem te herinneren aan wie hij al was.

Die directe, ongefilterde manier van communiceren heeft altijd in mij gezeten. Soms is het een kracht, soms maakt het het leven ingewikkelder. Maar bij hem leek het iets te openen. Boven alles voelde ik zijn verlangen om gezien en gehoord te worden.

En misschien was dat het belangrijkste wat ik hem kon geven:

geen oplossing,
geen uitgestippelde route,
maar oprechte aandacht.

Een plek waarin zijn verhaal even mocht bestaan.

Ik weet niet waar zijn reis hem uiteindelijk heeft gebracht. Soms vraag ik me nog af hoe het nu met hem gaat. Of hij zijn plaats heeft gevonden. Of hij inmiddels zelf kan zien wat ik toen al in hem zag.

Sommige mensen lopen maar kort met je mee.

Toch laten ze een draad achter
die niet zomaar breekt.

Een draad zonder antwoord,
gespannen tussen Fez en hier.

En zo nu en dan,
wanneer het stil genoeg is,
vraag ik me af
waar die draad hem naartoe heeft geleid.`, videoSrc: '/videos/kaart/marokko.mp4?v=optimized-20260801', videoPoster: '/videos/kaart/marokko-poster.webp?v=optimized-20260801' },
  { id: 'suriname', country: 'Suriname', x: 27, y: 64, accent: '#657750', title: 'Wat er achter de onzekerheid wachtte', text: 'Een reis die moeilijk begon, maar Jannie leerde dat een onzeker begin niet hoeft te bepalen hoe de rest van het verhaal verloopt.', transcript: `Voor het eerst in mijn leven besloot ik een grote stap te zetten.

Een kleine stap voor sommigen.
Een onmogelijke stap voor anderen.

Ik besloot zes weken alleen naar Suriname te reizen.

Zes weken waarin ik op mezelf moest vertrouwen.
Zes weken waarin ik mijn gezin voor het eerst zo lang achterliet.
Als vrouw van midden vijftig, alleen naar een onbekend land.

Blijkbaar was de roeping in mijn hart om de wereld te ontdekken groter dan mijn angst.

Mijn oorspronkelijke plan was om als vrijwilliger te werken in een tehuis voor kinderen met een lichamelijke of verstandelijke beperking. In de ochtend zou ik werken. Vanaf de middag zou de dag van mij zijn.

Maar al snel ontdekte ik dat de werkelijkheid anders was dan ik had gehoopt.

De kinderen werden ruw en hardhandig behandeld. Aandacht en warmte leken te ontbreken. Ook ik werd ergens in een kamer geplaatst, zonder veel uitleg of hartelijkheid.

Na vier dagen besloot ik weg te gaan.

Mijn hart brak om de omstandigheden waarin deze kinderen moesten leven. Nog wekenlang dacht ik na over de mogelijkheid om een van hen te adopteren. Vooral één kind had mij diep geraakt.

Maar ergens wist ik dat het ook de redder in mij was die sprak.

De vrouw die de hele wereld op haar schouders probeerde te dragen, zoals mijn vader altijd zei.

Bovendien waren mijn eigen omstandigheden niet stabiel genoeg om werkelijk voor adoptie in aanmerking te komen. Langzaam begon ik te begrijpen dat je eerst jezelf moet helpen voordat je een ander werkelijk kunt dragen.

Een les die ik helaas pas laat leerde.

Toen ik het tehuis verliet, stond ik daar plotseling.

Met mijn koffer op straat.
Zonder verblijf.
Zonder plan.
In een land dat ik nauwelijks kende.

Ik kon opgeven.
Ik kon huilen.
Ik kon teruggaan naar Nederland.

Even voelde dat als de enige mogelijkheid.

Maar toen kwam er iets anders naar boven.

Een kracht die zei:

Nu ben ik hier.
En ik ga er iets van maken ook.

Ik belde een Surinaamse kennis in Nederland. Hij gaf mij het adres van zijn zus, bij wie ik mocht verblijven. De rest van mijn reis logeerde ik in een kleine benedenwoning.

Later ontmoette ik een taxichauffeur die mij hielp Suriname werkelijk te ontdekken. Hij bracht mij naar lokale plekken in Paramaribo, waaronder de Waterkant: de oude straat langs de Surinamerivier.

Zo begon de reis opnieuw.

Ik ontmoette mensen die tijdelijk vrienden werden. Ik proefde de cultuur en merkte hoe anders de tijd er leek te bewegen. Langzamer dan in Nederland. Alsof er meer ruimte bestond om te ademen.

Ik lag in hangmatten.
Ik voelde de warmte.
Ik zag de natuur.
En ik genoot.

De vijf weken die volgden, werden enkele van de mooiste weken van mijn leven.

Suriname leerde mij dat een moeilijk begin niet betekent dat de rest van het verhaal ook moeilijk moet zijn.

Ik bleef, terwijl ik geen plan had.
Ik bleef, terwijl ik geen onderdak had.
Ik bleef, terwijl alles in mij onzeker was.

En juist doordat ik bleef, mocht ik ervaren wat er achter die onzekerheid op mij wachtte.

Een reis die ik nooit had kunnen maken
als ik bij het moeilijke begin
al had besloten dat het voorbij was.`, videoSrc: '/videos/kaart/suriname.mp4?v=optimized-20260801', videoPoster: '/videos/kaart/suriname-poster.webp?v=optimized-20260801' },
  { id: 'griekenland', country: 'Griekenland', place: 'Corfu', x: 59, y: 40, accent: '#58778b', title: 'De reis die nog altijd verdergaat', text: 'Corfu werd een plek van vriendschap, herinnering en een reis die ooit door de bergen mag worden voltooid voor Melton.', transcript: `Ook deze reis begon ik alleen.

Met een koffer vol kleding, een hoofd vol gedachten en dat vertrouwde verlangen om te ontdekken wat er achter het bekende lag, vertrok ik naar Corfu. Ik verbleef in een appartement in de stad, op een plek waar niemand mij kende en waar iedere dag nog open voor me lag.

Al op de eerste dag raakte ik aan de praat met een jong stel dat in de bar werkte. Sommige mensen ontmoet je zonder ernaar te zoeken. Er is geen uitleg nodig, geen lange aanloop. Er is alleen iets wat klopt.

Ze werden al snel goede vrienden. Bijna iedere avond at ik met hen. Aan tafel deelden we niet alleen ons eten, maar ook onze verhalen, onze lach en de kleine gebeurtenissen van de dag.

Het valt mij vaker op dat ik gemakkelijk contact maak met mensen die twintig of dertig jaar jonger zijn dan ik. Misschien omdat veel mensen van mijn eigen leeftijd ouder zijn geworden dan hun jaren. Niet in hun gezicht, maar in hun manier van leven. Alsof nieuwsgierigheid iets is wat je op een bepaald moment hoort achter te laten.

Maar een mens is niet alleen zo oud als de tijd zegt.

Een mens is ook zo oud als de dromen die nog in haar leven.

Blijkbaar leeft er in mij nog altijd iets dat zich herkent in mensen die de wereld open tegemoet treden. Mensen die nog niet alles denken te weten. Die nog kunnen lachen zonder reden en vertrekken zonder precies te weten waarheen.

Na mijn thuiskomst bleef ik contact houden met het stel. Een maand later keerde ik terug naar Corfu. Ditmaal reisde ik niet alleen. Mijn zoon Melton ging met mij mee.

We kwamen terug bij dezelfde mensen, dezelfde warmte en dezelfde plek die in korte tijd vertrouwd was geworden. Melton kon het bijzonder goed vinden met de man van het stel. Hij wilde graag een quad huren en daarmee door de bergen van Corfu rijden. De wegen waren niet overal veilig en de rit werd ons afgeraden.

Melton vond dat verschrikkelijk jammer.

Op dat moment leek het niet meer dan een plan dat moest wachten. Iets voor later. Want wanneer iemand naast je staat, geloof je dat er altijd een later zal zijn.

Maar een paar jaar na onze reis kwam Melton om het leven bij een auto-ongeluk.

Daardoor veranderde Corfu.

Het bleef het eiland van de zon, de vriendschap en de avonden samen aan tafel. Maar het werd ook de plek van een herinnering die nergens anders bestaat. Een plek waar Melton nog door de straten loopt. Waar zijn stem nog klinkt. Waar die ene rit door de bergen nog altijd op hem wacht.

Mijn andere zoon, Marvin, bewaart de as van zijn broertje. Hij heeft zichzelf beloofd ooit naar Corfu terug te keren. Om de quad te huren waarop Melton toen zo graag wilde rijden. Om dezelfde bergen in te gaan en daar een deel van zijn as aan de wind toe te vertrouwen.

Misschien eindigen sommige reizen niet wanneer je naar huis gaat.

Misschien blijft er een draad achter,
gespannen tussen toen en later.

Een draad die wacht
tot iemand haar weer oppakt
en het laatste deel van de reis aflegt.

Niet om afscheid te nemen.

Maar om Melton alsnog
door de bergen van Corfu
te laten rijden.` },
  { id: 'ibiza', country: 'Ibiza', x: 49, y: 43, accent: '#765b79', title: 'Waar deze reis is begonnen', text: 'Vijf dagen met Marvin lieten Jannie niet alleen een eiland zien, maar ook een vrijere manier van leven waarnaar zij ooit wil terugkeren.', transcript: `Ibiza.

Een plek waarvan mensen zeggen dat je er minstens één keer geweest moet zijn. Het eiland van feesten, muziek en nachten die pas eindigen wanneer de zon alweer opkomt.

Maar daarvoor gingen wij niet.

Ik reisde samen met mijn oudste zoon, Marvin. We hadden slechts vijf dagen, omdat hij kort daarna aan een nieuwe baan bij de NPO en NOS zou beginnen. Veel te kort om een heel eiland te leren kennen, maar lang genoeg om nieuwsgierig te worden naar alles waarvoor we geen tijd meer zouden hebben.

We huurden een auto, zodat we zelf konden bepalen waar we heen gingen en hoe lang we ergens bleven. Geen vast programma en niemand die ons vertelde welke route we moesten volgen. Alleen een weg, een eiland en vijf dagen om te ontdekken wat er achter de volgende bocht lag.

We bezochten de stad, de grotten en natuurlijk de bekende hippiemarkt. Stiekem zijn mijn zoon en ik allebei nog een beetje hippie. Misschien niet in hoe we eruitzien, maar wel in ons verlangen naar vrijheid. Naar plekken waar mensen minder bezig lijken met hoe het hoort en meer met hoe het voelt.

Marvin stelde voor om niet in een hotel, maar in een hostel te verblijven. Tijdens zijn eerdere backpackreizen had hij gemerkt dat hostels vaak levendiger waren. Je kwam er gemakkelijker met anderen in contact en hoorde verhalen van mensen die allemaal ergens vandaan kwamen en weer ergens anders naartoe gingen.

Van buiten en van binnen zag ons hostel er prachtig uit. Toch ontdekten we al snel dat de meeste gasten er vooral kwamen om te feesten. Overal waren jonge mensen, muziek en weinig kleding — wat op Ibiza blijkbaar even vanzelfsprekend is als zonlicht.

Het voelde soms wat vreemd om daar als oudere vrouw tussen al die halfnaakte jonge dames rond te lopen, samen met mijn volwassen zoon. Gelukkig is Marvin net zo min een feestbeest als ik. We brachten onze tijd daarom vooral buiten het hostel door, op zoek naar het Ibiza dat achter de feesten lag.

Slechts één keer gingen we bij het zwembad zitten.

Medewerkers deelden gratis shotjes uit. Ik drink normaal gesproken nooit alcohol, maar die ene keer besloot ik mee te doen. De verbazing op Marvins gezicht was waarschijnlijk leuker dan het drankje zelf.

Het werd geen lange reis en misschien ook niet mijn grootste avontuur. Toch liet Ibiza iets bij mij achter wat groter was dan die vijf dagen.

Het hielp me om scherper te zien naar welk leven ik verlang.

Een leven dichter bij de natuur.
Met warmte op mijn huid en muziek in de lucht.
Op een plek waar mensen vrijer lijken te bewegen
en het leven minder snel wordt dichtgeregeld.

Misschien zoek ik niet alleen een ander land of een warmer eiland.

Misschien zoek ik een manier van leven
waarin meer ruimte bestaat om mezelf te zijn.

Ibiza liet mij daar even iets van zien.

Niet tijdens een groot feest,
maar onderweg in onze huurauto,
bij de markt, in de grotten
en op de wegen tussen alles in.

Vijf dagen waren niet genoeg.

Daarom wil ik ooit terug.

Niet om dezelfde reis opnieuw te maken,
maar om verder te gaan
waar deze is begonnen.`, videoSrc: '/videos/kaart/ibiza.mp4?v=optimized-20260801', videoPoster: '/videos/kaart/ibiza-poster.webp?v=optimized-20260801' },
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
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeActive = useCallback(() => setActive(null), [])
  useDialogFocus(active !== null, dialogRef, closeActive)

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

    {active && <div ref={dialogRef} className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2e271f]/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="memory-title" onMouseDown={(event) => event.target === event.currentTarget && closeActive()}>
      <article className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#c6a978]/60 bg-[#eee5d6] shadow-2xl">
        <header className="flex items-start justify-between gap-5 border-b border-neutral-800/10 px-6 py-5">
          <div><p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">{active.country}{active.place ? ` · ${active.place}` : ''}</p><h3 id="memory-title" className="mt-2 text-lg font-semibold uppercase tracking-[0.14em]">{active.title}</h3></div>
          <button type="button" onClick={closeActive} aria-label="Sluit venster" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-800/20 text-lg text-neutral-600 hover:bg-white/50">×</button>
        </header>
        <div className="grid gap-6 p-6 sm:grid-cols-[1.08fr_.92fr]">
          <div>
            {active.videoSrc ? <video controls muted playsInline preload="metadata" src={active.videoSrc} poster={active.videoPoster} onVolumeChange={(event) => { event.currentTarget.muted = true }} aria-label={`Stille video-impressie van ${active.place ?? active.country}`} className="aspect-video w-full rounded-xl bg-neutral-900 object-cover" /> : <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-[#39342e] text-[#eee5d6] shadow-inner"><span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 pl-0.5 text-sm">▶</span><span className="mt-3 text-[8px] uppercase tracking-[0.2em] text-white/60">Filmfragment volgt</span></div>}
            <p className="mt-4 text-sm leading-6 text-neutral-600">{active.text}</p>
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
