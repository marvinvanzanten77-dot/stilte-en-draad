type LegalPageProps = { type: 'privacy' | 'terms' }

const LegalPage = ({ type }: LegalPageProps) => {
  const privacy = type === 'privacy'
  return (
    <article className="rounded-2xl bg-white/45 p-7 shadow-soft ring-1 ring-neutral-200/50 md:p-12">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Concept · nog juridisch controleren</p>
      <h1 className="mt-3 text-2xl font-semibold uppercase tracking-[0.16em]">{privacy ? 'Privacyverklaring' : 'Algemene voorwaarden'}</h1>
      <div className="mt-8 space-y-7 text-sm leading-7 text-neutral-700">
        {privacy ? <>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Welke gegevens</h2><p className="mt-2">De website bewaart momenteel alleen jouw winkelmand en favorieten lokaal in je browser. Zodra contactformulieren, betalingen, verzending of statistieken worden toegevoegd, wordt hier precies beschreven welke persoonsgegevens worden verwerkt.</p></section>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Doel en bewaartermijn</h2><p className="mt-2">Persoonsgegevens worden alleen gebruikt om aanvragen en bestellingen uit te voeren, aan wettelijke verplichtingen te voldoen en—na toestemming—nieuws te sturen. Definitieve bewaartermijnen volgen bij ingebruikname van deze functies.</p></section>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Jouw rechten</h2><p className="mt-2">Je kunt vragen om inzage, correctie, verwijdering, overdracht of beperking van persoonsgegevens. De definitieve contactgegevens van de verantwoordelijke worden voor publicatie toegevoegd.</p></section>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Cookies en browseropslag</h2><p className="mt-2">Er worden nu geen advertentie- of analysecookies geplaatst. Functionele browseropslag onthoudt alleen winkelmand, favorieten en je cookievoorkeur. Via “Cookievoorkeuren” onderaan iedere pagina kun je jouw keuze opnieuw openen.</p></section>
        </> : <>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Aanbod</h2><p className="mt-2">Titels, prijzen en beschrijvingen op deze ontwikkelversie zijn voorlopig. Een bestelling ontstaat pas nadat beschikbaarheid, gegevens en betaling definitief zijn bevestigd.</p></section>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Unieke werken</h2><p className="mt-2">Handgemaakte werken kunnen natuurlijke verschillen en onregelmatigheden bevatten. Afbeeldingen kunnen door beeldscherminstellingen afwijken van het werk.</p></section>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Betaling, levering en retour</h2><p className="mt-2">Betaalmethoden, verzendgebieden, levertijden, kosten, herroepingsrecht en uitzonderingen worden vóór de opening van de webshop definitief vastgelegd.</p></section>
          <section><h2 className="font-semibold uppercase tracking-[0.12em]">Bedrijfsgegevens</h2><p className="mt-2">Handelsnaam, adres, e-mailadres, KvK-nummer en btw-gegevens moeten vóór publicatie worden toegevoegd.</p></section>
        </>}
      </div>
    </article>
  )
}

export default LegalPage
