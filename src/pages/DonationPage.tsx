import { useCallback, useRef, useState, type FormEvent } from 'react'
import { usePaymentAvailability } from '../hooks/usePaymentAvailability'
import { useDialogFocus } from '../hooks/useDialogFocus'
import { formatCents, parseEuroAmountToCents } from '../utils/money'

type PaymentResponse = { orderId: string; orderNumber: string; checkoutUrl: string; qrCodeUrl?: string }
type DonationRequest = {
  amountCents: number
  name: FormDataEntryValue | null
  email: FormDataEntryValue | null
  anonymous: boolean
  message: FormDataEntryValue | null
}

const DonationPage = () => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [payment, setPayment] = useState<PaymentResponse | null>(null)
  const [pendingConfirmation, setPendingConfirmation] = useState<DonationRequest | null>(null)
  const availability = usePaymentAvailability()
  const idempotencyKey = useRef(crypto.randomUUID())
  const confirmationRef = useRef<HTMLDivElement>(null)
  const closeConfirmation = useCallback(() => setPendingConfirmation(null), [])
  useDialogFocus(pendingConfirmation !== null, confirmationRef, closeConfirmation)

  const createDonation = async (request: DonationRequest, confirmed = false) => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/donations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...request,
          confirmedAmountCents: confirmed ? request.amountCents : undefined,
          idempotencyKey: idempotencyKey.current,
        }),
      })
      const body = await response.json() as PaymentResponse & { error?: string }
      if (!response.ok) {
        if (response.status < 500) idempotencyKey.current = crypto.randomUUID()
        throw new Error(body.error || 'De donatie kon niet worden gestart.')
      }
      if (window.matchMedia('(max-width: 767px)').matches) { window.location.assign(body.checkoutUrl); return }
      setPayment(body)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'De donatie kon niet worden gestart.')
      setBusy(false)
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    setError('')
    const data = new FormData(event.currentTarget)
    const amountCents = parseEuroAmountToCents(String(data.get('amount') ?? ''))
    if (amountCents === null || amountCents < 1) {
      setError('Vul een positief bedrag in met maximaal twee decimalen.')
      return
    }
    const request = {
      amountCents,
      name: data.get('name'),
      email: data.get('email'),
      anonymous: data.get('anonymous') === 'on',
      message: data.get('message'),
    }
    const threshold = availability.donationConfirmThresholdCents ?? 50_000
    if (amountCents >= threshold) {
      setPendingConfirmation(request)
      return
    }
    void createDonation(request)
  }

  if (payment) return <section className="rounded-2xl bg-[#d8cbb4] p-7 text-center shadow-soft md:p-12"><p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Rijdend atelier · veilig via Mollie{availability.mode === 'test' ? ' · testmodus' : ''}</p><h1 className="mt-3 text-2xl font-semibold uppercase tracking-[0.16em]">Geef je draad mee</h1><p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-neutral-600">Scan met je bankapp of ga verder naar de beveiligde iDEAL-omgeving. Daarna kom je terug op onze eigen bedankpagina.</p>{payment.qrCodeUrl && <img src={payment.qrCodeUrl} alt="iDEAL QR-code voor deze donatie" className="mx-auto mt-7 w-56 rounded-xl bg-white p-4 shadow-soft" />}<a href={payment.checkoutUrl} className="mx-auto mt-7 block max-w-sm rounded-full bg-neutral-900 px-6 py-4 text-xs uppercase tracking-[0.16em] text-white">Verder met iDEAL</a></section>

  return <section className="overflow-hidden rounded-2xl bg-[#d8cbb4] shadow-soft"><header className="border-b border-neutral-800/10 p-7 md:p-10"><p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Bouw mee aan het rijdende atelier</p><h1 className="mt-3 text-2xl font-semibold uppercase tracking-[0.16em]">Geef een draad mee</h1><p className="mt-4 max-w-xl text-sm leading-7 text-neutral-600">Jouw bijdrage is bestemd voor de aanschaf van de bus en de verbouwing ervan tot het rijdende atelier van Stilte &amp; Draad.</p></header><form onSubmit={submit} className="mx-auto max-w-2xl space-y-5 p-7 md:p-10">
    <label className="block text-xs">Bedrag in euro’s <span className="text-neutral-500">(kies zelf)</span><input required name="amount" inputMode="decimal" placeholder="0,00" className="mt-2 w-full rounded-xl border border-neutral-800/15 bg-white/35 px-4 py-4 text-lg" /></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs">Naam<input name="name" autoComplete="name" className="mt-2 w-full rounded-xl border border-neutral-800/15 bg-white/35 px-4 py-3 text-sm" /></label><label className="text-xs">E-mailadres<input required type="email" name="email" autoComplete="email" className="mt-2 w-full rounded-xl border border-neutral-800/15 bg-white/35 px-4 py-3 text-sm" /></label></div>
    <label className="flex items-center gap-3 rounded-xl border border-neutral-800/10 bg-white/20 p-4 text-sm"><input type="checkbox" name="anonymous" /> Toon mijn donatie als anoniem</label>
    <label className="block text-xs">Een kort bericht <span className="text-neutral-500">(optioneel)</span><textarea name="message" maxLength={500} rows={4} className="mt-2 w-full rounded-xl border border-neutral-800/15 bg-white/35 px-4 py-3 text-sm" /></label>
    <div className="rounded-xl border border-neutral-800/10 bg-white/25 p-4"><p className="text-[9px] uppercase tracking-[0.15em] text-neutral-500">Betaalmethode</p><p className="mt-2 text-sm font-medium">iDEAL · veilig verwerkt via Mollie</p></div>
    {error && <p role="alert" className="rounded-xl border border-red-900/20 bg-red-50/45 p-4 text-sm text-red-900">{error}</p>}
    {pendingConfirmation && <div ref={confirmationRef} role="alertdialog" aria-modal="true" aria-labelledby="donation-confirm-title" className="rounded-xl border border-[#8a6b43]/30 bg-[#f8f4ec] p-5 shadow-soft">
      <h2 id="donation-confirm-title" className="text-sm font-semibold">Controleer je bedrag</h2>
      <p className="mt-3 text-sm leading-6">Je staat op het punt {formatCents(pendingConfirmation.amountCents)} bij te dragen aan Stilte &amp; Draad. Klopt dit bedrag?</p>
      <div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => { const request = pendingConfirmation; setPendingConfirmation(null); void createDonation(request, true) }} className="rounded-full bg-neutral-900 px-5 py-3 text-xs uppercase tracking-[0.14em] text-white disabled:opacity-50">Ja, dit bedrag klopt</button><button type="button" disabled={busy} onClick={closeConfirmation} className="rounded-full border border-neutral-800/20 px-5 py-3 text-xs uppercase tracking-[0.14em]">Bedrag aanpassen</button></div>
    </div>}
    {!availability.loading && !availability.donationAvailable && <div role="status" className="rounded-xl border border-[#9b7d4f]/20 bg-white/30 p-4 text-sm leading-6 text-neutral-600"><p>Online doneren wordt zorgvuldig voorbereid en is tijdelijk nog niet beschikbaar.</p>{availability.donationConfiguration && <details className="mt-3 text-xs"><summary className="cursor-pointer">Configuratie voor ontwikkeling</summary><ul className="mt-2 list-disc space-y-1 pl-5">{availability.donationConfiguration.map((item) => <li key={item}>{item}</li>)}</ul></details>}</div>}
    <button disabled={busy || pendingConfirmation !== null || availability.loading || !availability.donationAvailable} className="w-full rounded-full bg-neutral-900 px-6 py-4 text-xs uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-50">{availability.loading ? 'Beschikbaarheid controleren…' : busy ? 'Donatie voorbereiden…' : availability.donationAvailable ? 'Doneer veilig met iDEAL' : 'Online doneren binnenkort beschikbaar'}</button>
  </form></section>
}

export default DonationPage
