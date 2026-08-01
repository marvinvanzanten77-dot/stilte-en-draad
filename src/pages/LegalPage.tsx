import { siteDetails } from '../data/siteDetails'

type LegalPageProps = { type: 'privacy' | 'terms' }

const LegalPage = ({ type }: LegalPageProps) => {
  const privacy = type === 'privacy'
  return (
    <article className="rounded-2xl bg-white/45 p-7 shadow-soft ring-1 ring-neutral-200/50 md:p-12">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Concept · nog juridisch controleren</p>
      <h1 className="mt-3 text-2xl font-semibold uppercase tracking-[0.16em]">{privacy ? 'Privacyverklaring' : 'Algemene voorwaarden'}</h1>
      <div className="mt-8 space-y-7 text-sm leading-7 text-neutral-700">
        {privacy ? <>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Welke gegevens</h2><p className="mt-2">Voor een bestelling verwerken we naam, e-mailadres, eventueel telefoonnummer, bezorgadres, gekozen werken en een optioneel bericht. Voor een donatie verwerken we het bedrag, e-mailadres en—tenzij je anoniem doneert—je naam. Winkelmand en favorieten blijven lokaal in je browser.</p></section>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Betalingen via Mollie</h2><p className="mt-2">Mollie verwerkt de betaling en de daarvoor noodzakelijke betaalgegevens als betaaldienstverlener. Stilte &amp; Draad ontvangt geen bank- of kaartgegevens en bewaart alleen de betaalreferentie en geverifieerde status die nodig zijn voor bestelling, levering en administratie.</p></section>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Doel en bewaartermijn</h2><p className="mt-2">Persoonsgegevens worden alleen gebruikt om bestellingen, ophalen, verzending en donaties uit te voeren en aan wettelijke verplichtingen te voldoen. Definitieve fiscale en administratieve bewaartermijnen worden voor de livegang juridisch vastgelegd.</p></section>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Jouw rechten en contact</h2><p className="mt-2">Je kunt vragen om inzage, correctie, verwijdering, overdracht of beperking van persoonsgegevens. Neem hiervoor contact op via <a className="underline underline-offset-4" href={`mailto:${siteDetails.email}`}>{siteDetails.email}</a>. Verwerkingsverantwoordelijke is {siteDetails.name}, door {siteDetails.owner}, KvK {siteDetails.chamberOfCommerce}.</p></section>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Cookies en browseropslag</h2><p className="mt-2">Er worden nu geen advertentie- of analysecookies geplaatst. Functionele browseropslag onthoudt alleen winkelmand, favorieten en je cookievoorkeur. Via “Cookievoorkeuren” onderaan iedere pagina kun je jouw keuze opnieuw openen.</p></section>
        </> : <>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Aanbod</h2><p className="mt-2">Titels, prijzen en beschrijvingen op deze ontwikkelversie zijn voorlopig. Een bestelling ontstaat pas nadat beschikbaarheid, gegevens en betaling definitief zijn bevestigd.</p></section>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Unieke werken</h2><p className="mt-2">Handgemaakte werken kunnen natuurlijke verschillen en onregelmatigheden bevatten. Afbeeldingen kunnen door beeldscherminstellingen afwijken van het werk.</p></section>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Betaling</h2><p className="mt-2">Online betalingen worden veilig via Mollie verwerkt. Een terugkeer uit de bankomgeving geldt niet als betalingsbewijs; de bestelling wordt pas betaald genoemd na server-side bevestiging.</p></section>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Bedenktijd en retourneren</h2><div className="mt-2 space-y-2"><p>Bij een online aankoop heeft een consument in beginsel veertien dagen bedenktijd vanaf de dag na ontvangst. Binnen die termijn kan de overeenkomst zonder opgave van reden worden herroepen via de <a className="underline underline-offset-4" href="/herroepen">digitale herroepingsfunctie</a> of via <a className="underline underline-offset-4" href={`mailto:${siteDetails.email}?subject=Herroeping%20bestelling`}>{siteDetails.email}</a>. Vermeld daarbij naam, bestelnummer en welk werk wordt geretourneerd.</p><p>Na de herroeping moet het werk binnen veertien dagen zorgvuldig en voldoende verzekerd worden teruggestuurd naar {siteDetails.name}, {siteDetails.address.street}, {siteDetails.address.postalCode} {siteDetails.address.city}, {siteDetails.address.country}. De rechtstreekse retourkosten zijn voor de koper. Behandel en verpak het werk uitsluitend zoals nodig om het te kunnen beoordelen; bij verdergaand gebruik kan waardevermindering worden verrekend.</p><p>Bij volledige herroeping betalen we het aankoopbedrag en de kosten van de standaardlevering binnen veertien dagen terug via hetzelfde betaalmiddel. We mogen wachten totdat het werk is ontvangen of totdat bewijs van terugzending is geleverd.</p></div></section>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Levering</h2><p className="mt-2">Verzendgebieden, levertijden, verpakkingswijze en kosten worden vóór de opening van de webshop per werk definitief vastgelegd.</p></section>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Bedrijfsgegevens</h2><p className="mt-2">{siteDetails.name}, door {siteDetails.owner}. Vestigingsadres: {siteDetails.address.street}, {siteDetails.address.postalCode} {siteDetails.address.city}, {siteDetails.address.country}. E-mail: <a className="underline underline-offset-4" href={`mailto:${siteDetails.email}`}>{siteDetails.email}</a>. KvK-nummer: {siteDetails.chamberOfCommerce}. De btw-status wordt vóór de openbare winkelopening aangevuld.</p></section>
        </>}
      </div>
    </article>
  )
}

export default LegalPage
