import { useMemo, useRef, useState, type FormEvent } from 'react'
import { useShop } from '../context/ShopContext'
import { productThumbnail, products } from '../data/products'
import { usePaymentAvailability } from '../hooks/usePaymentAvailability'
import { formatCents } from '../utils/money'

type PaymentResponse = { orderId: string; orderNumber: string; checkoutUrl: string; qrCodeUrl?: string }

const CheckoutPage = ({ navigate }: { navigate: (path: string) => void }) => {
  const { cart, toggleCart } = useShop()
  const selected = useMemo(() => cart.map((id) => products.find((product) => product.id === id)).filter(Boolean), [cart])
  const subtotalCents = selected.reduce((sum, product) => sum + product!.price * 100, 0)
  const orderReady = selected.every((product) => product?.readiness === 'purchasable')
  const pickupReady = orderReady && selected.every((product) => product?.pickupAllowed)
  const shippingReady = orderReady && selected.every((product) => product?.shippingAllowed && product.shippingClass)
  const [fulfillment, setFulfillment] = useState<'pickup' | 'shipping'>('pickup')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [payment, setPayment] = useState<PaymentResponse | null>(null)
  const availability = usePaymentAvailability()
  const idempotencyKey = useRef(crypto.randomUUID())

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: cart,
          fulfillment,
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          address: form.get('address'),
          postalCode: form.get('postalCode'),
          city: form.get('city'),
          country: form.get('country'),
          message: form.get('message'),
          idempotencyKey: idempotencyKey.current,
        }),
      })
      const body = await response.json() as PaymentResponse & { error?: string }
      if (!response.ok) {
        if (response.status < 500) idempotencyKey.current = crypto.randomUUID()
        throw new Error(body.error || 'Betalen kon niet worden gestart.')
      }
      sessionStorage.setItem(`payment:${body.orderId}`, JSON.stringify(body))
      if (window.matchMedia('(max-width: 767px)').matches) {
        window.location.assign(body.checkoutUrl)
        return
      }
      setPayment(body)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Betalen kon niet worden gestart.')
      setBusy(false)
    }
  }

  if (payment) return (
    <section className="rounded-2xl bg-[#e7ddc9] p-7 text-center shadow-soft md:p-12" aria-labelledby="ideal-title">
      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Veilig betalen via Mollie{availability.mode === 'test' ? ' · testmodus' : ''}</p>
      <h1 id="ideal-title" className="mt-3 text-2xl font-semibold uppercase tracking-[0.16em]">Open je bankapp</h1>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-neutral-600">Scan de iDEAL-code met je telefoon. Je bank rondt de beveiligde betaling af; daarna keer je terug naar Stilte &amp; Draad.</p>
      {payment.qrCodeUrl ? <img src={payment.qrCodeUrl} alt="iDEAL QR-code voor deze bestelling" className="mx-auto mt-7 w-56 rounded-xl bg-white p-4 shadow-soft" /> : <p className="mx-auto mt-7 max-w-md rounded-xl border border-neutral-800/15 bg-white/30 p-5 text-sm">Voor deze testbetaling is geen QR-code beschikbaar. Ga verder via de beveiligde bankomgeving.</p>}
      <a href={payment.checkoutUrl} className="mx-auto mt-7 block max-w-sm rounded-full bg-neutral-900 px-6 py-4 text-xs uppercase tracking-[0.16em] text-white">Verder met iDEAL</a>
      <p className="mt-5 text-[10px] uppercase tracking-[0.14em] text-neutral-500">Referentie {payment.orderNumber}</p>
    </section>
  )

  return (
    <section className="overflow-hidden rounded-2xl bg-[#e7ddc9] shadow-soft">
      <header className="border-b border-neutral-800/10 p-7 md:p-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Jouw gekozen werk</p>
        <h1 className="mt-3 text-2xl font-semibold uppercase tracking-[0.16em]">Veilig afrekenen</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-600">Je ontvangt het unieke, door Jannie gemaakte exemplaar. De betaling wordt in testmodus verwerkt via Mollie.</p>
      </header>
      {selected.length === 0 ? <div className="p-10 text-center"><p>Je winkelmand is leeg.</p><button type="button" onClick={() => navigate('/webshop')} className="mt-5 rounded-full border border-neutral-800/20 px-5 py-3 text-xs uppercase tracking-[0.14em]">Terug naar de webshop</button></div> : !orderReady ? <div className="p-10 text-center"><p className="text-lg font-semibold uppercase tracking-[0.13em]">Dit werk wordt binnenkort bestelbaar</p><p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-neutral-600">Jannie controleert eerst de afmetingen, materialen en mogelijkheden voor ophalen of verzenden. Je gekozen werk blijft als favoriet en tentoonstellingsobject zichtbaar, maar kan nog niet worden afgerekend.</p><button type="button" onClick={() => navigate('/webshop')} className="mt-6 rounded-full border border-neutral-800/20 px-5 py-3 text-xs uppercase tracking-[0.14em]">Terug naar de webshop</button></div> : (
        <form onSubmit={submit} className="grid lg:grid-cols-[1fr_340px]">
          <div className="space-y-8 p-7 md:p-10">
            <fieldset><legend className="text-xs font-semibold uppercase tracking-[0.15em]">Ontvangst</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className={`rounded-xl border border-neutral-800/15 p-4 ${pickupReady ? 'bg-white/25' : 'cursor-not-allowed opacity-55'}`}><input type="radio" name="fulfillment" disabled={!pickupReady} checked={fulfillment === 'pickup'} onChange={() => setFulfillment('pickup')} /> <span className="ml-2 text-sm font-medium">Ophalen</span><span className="mt-2 block text-xs leading-5 text-neutral-500">{pickupReady ? 'Afspraak en locatie volgen na bevestiging.' : 'Voor dit werk nog niet beschikbaar.'}</span></label>
                <label className={`rounded-xl border border-neutral-800/15 p-4 ${shippingReady ? 'bg-white/25' : 'cursor-not-allowed opacity-55'}`}><input type="radio" name="fulfillment" disabled={!shippingReady} checked={fulfillment === 'shipping'} onChange={() => setFulfillment('shipping')} /> <span className="ml-2 text-sm font-medium">Verzenden</span><span className="mt-2 block text-xs leading-5 text-neutral-500">{shippingReady ? 'Tarief wordt veilig berekend.' : 'Beschikbaar zodra maten en verzendklasse bevestigd zijn.'}</span></label>
              </div>
            </fieldset>
            <fieldset><legend className="text-xs font-semibold uppercase tracking-[0.15em]">Jouw gegevens</legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-xs">Naam<input required name="name" autoComplete="name" className="mt-2 w-full rounded-xl border border-neutral-800/15 bg-white/35 px-4 py-3 text-sm" /></label>
                <label className="text-xs">E-mailadres<input required type="email" name="email" autoComplete="email" className="mt-2 w-full rounded-xl border border-neutral-800/15 bg-white/35 px-4 py-3 text-sm" /></label>
                <label className="text-xs sm:col-span-2">Telefoonnummer <span className="text-neutral-500">(optioneel)</span><input name="phone" autoComplete="tel" className="mt-2 w-full rounded-xl border border-neutral-800/15 bg-white/35 px-4 py-3 text-sm" /></label>
              </div>
            </fieldset>
            <fieldset disabled={fulfillment !== 'shipping'} className={fulfillment !== 'shipping' ? 'opacity-45' : ''}><legend className="text-xs font-semibold uppercase tracking-[0.15em]">Bezorgadres</legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-xs sm:col-span-2">Adres<input required={fulfillment === 'shipping'} name="address" autoComplete="street-address" className="mt-2 w-full rounded-xl border border-neutral-800/15 bg-white/35 px-4 py-3 text-sm" /></label>
                <label className="text-xs">Postcode<input required={fulfillment === 'shipping'} name="postalCode" autoComplete="postal-code" className="mt-2 w-full rounded-xl border border-neutral-800/15 bg-white/35 px-4 py-3 text-sm" /></label>
                <label className="text-xs">Woonplaats<input required={fulfillment === 'shipping'} name="city" autoComplete="address-level2" className="mt-2 w-full rounded-xl border border-neutral-800/15 bg-white/35 px-4 py-3 text-sm" /></label>
                <label className="text-xs sm:col-span-2">Land<select name="country" defaultValue="NL" className="mt-2 w-full rounded-xl border border-neutral-800/15 bg-white/35 px-4 py-3 text-sm"><option value="NL">Nederland</option><option value="BE">België</option><option value="DE">Duitsland</option></select></label>
              </div>
            </fieldset>
            <label className="block text-xs">Persoonlijk bericht <span className="text-neutral-500">(optioneel)</span><textarea name="message" maxLength={500} rows={4} className="mt-2 w-full rounded-xl border border-neutral-800/15 bg-white/35 px-4 py-3 text-sm" /></label>
          </div>
          <aside className="border-t border-neutral-800/10 bg-white/20 p-7 lg:border-l lg:border-t-0">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em]">Overzicht</h2>
            <div className="mt-5 space-y-4">{selected.map((product) => <div key={product!.id} className="flex gap-3"><img src={productThumbnail(product!)} alt="" className="h-16 w-16 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{product!.title}</p><p className="mt-1 text-xs text-neutral-500">{formatCents(product!.price * 100)} · één uniek exemplaar</p></div><button type="button" onClick={() => toggleCart(product!.id)} aria-label={`Verwijder ${product!.title}`} className="self-start text-lg">×</button></div>)}</div>
            <dl className="mt-6 space-y-3 border-t border-neutral-800/10 pt-5 text-sm"><div className="flex justify-between"><dt>Subtotaal</dt><dd>{formatCents(subtotalCents)}</dd></div><div className="flex justify-between"><dt>{fulfillment === 'pickup' ? 'Ophalen' : 'Verzending'}</dt><dd>{fulfillment === 'pickup' ? formatCents(0) : 'Nog te bepalen'}</dd></div><div className="flex justify-between border-t border-neutral-800/10 pt-3 font-semibold"><dt>Totaal</dt><dd>{formatCents(subtotalCents)}</dd></div></dl>
            <div className="mt-6 rounded-xl border border-neutral-800/10 bg-white/30 p-4"><p className="text-[9px] uppercase tracking-[0.15em] text-neutral-500">Betaalmethode</p><p className="mt-2 text-sm font-medium">iDEAL · via Mollie</p></div>
            {error && <p role="alert" className="mt-5 rounded-xl border border-red-900/20 bg-red-50/45 p-4 text-sm text-red-900">{error}</p>}
            {!availability.loading && !availability.available && <div role="status" className="mt-5 rounded-xl border border-[#9b7d4f]/20 bg-white/30 p-4 text-sm leading-6 text-neutral-600"><p>{availability.message}</p>{availability.configuration && <details className="mt-3 text-xs"><summary className="cursor-pointer">Configuratie voor ontwikkeling</summary><ul className="mt-2 list-disc space-y-1 pl-5">{availability.configuration.map((item) => <li key={item}>{item}</li>)}</ul></details>}</div>}
            <button disabled={busy || availability.loading || !availability.available} className="mt-6 w-full rounded-full bg-neutral-900 px-6 py-4 text-xs uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-50">{availability.loading ? 'Beschikbaarheid controleren…' : busy ? 'Betaling voorbereiden…' : availability.available ? 'Veilig betalen met iDEAL' : 'Online betalen binnenkort beschikbaar'}</button>
          </aside>
        </form>
      )}
    </section>
  )
}

export default CheckoutPage
