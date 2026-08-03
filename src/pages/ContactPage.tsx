import { siteDetails } from '../data/siteDetails'

const ContactPage = () => (
  <article className="rounded-2xl bg-white/45 p-7 shadow-soft ring-1 ring-neutral-200/50 md:p-12">
    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Een vraag, ontmoeting of samenwerking</p>
    <h1 className="mt-3 text-2xl font-semibold uppercase tracking-[0.16em]">Contact</h1>
    <div className="mt-8 max-w-2xl space-y-7 text-sm leading-7 text-neutral-700">
      <p>
        Wil je iets weten over een werk, Jannie uitnodigen voor een markt of evenement,
        of samen een nieuwe draad oppakken? Schrijf gerust. We lezen ieder bericht met aandacht.
      </p>
      <section className="rounded-xl border border-neutral-800/10 bg-white/30 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em]">E-mail</h2>
        <a className="mt-2 inline-block text-base underline decoration-neutral-800/25 underline-offset-4 hover:decoration-neutral-800" href={`mailto:${siteDetails.email}`}>
          {siteDetails.email}
        </a>
        <p className="mt-4 text-xs text-neutral-500">Stilte &amp; Draad · maker en verteller: {siteDetails.maker}</p>
        <p className="text-xs text-neutral-500">Verkoper: {siteDetails.legalOwner} · {siteDetails.legalEntity}</p>
        <p className="text-xs text-neutral-500">KvK {siteDetails.chamberOfCommerce} · btw-ID {siteDetails.vatNumber}</p>
        <address className="mt-3 text-xs not-italic text-neutral-500">
          {siteDetails.address.street}<br />
          {siteDetails.address.postalCode} {siteDetails.address.city}<br />
          {siteDetails.address.country}
        </address>
        <p className="mt-3 text-xs text-neutral-500">Afhalen vindt uitsluitend op afspraak plaats in {siteDetails.pickupLocation}; dit is niet het zakelijke vestigingsadres.</p>
      </section>
    </div>
  </article>
)

export default ContactPage
