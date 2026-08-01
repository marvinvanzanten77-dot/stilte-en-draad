import { useRef, useState, type FormEvent } from 'react'
import { siteDetails } from '../data/siteDetails'

type WithdrawalResponse = {
  requestNumber: string
  receivedAt: string
  confirmationQueued: boolean
  error?: string
}

const WithdrawalPage = () => {
  const [scope, setScope] = useState<'full' | 'partial'>('full')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<WithdrawalResponse | null>(null)
  const idempotencyKey = useRef(crypto.randomUUID())

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    const data = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/withdrawals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: data.get('orderNumber'),
          email: data.get('email'),
          scope,
          itemDescription: data.get('itemDescription'),
          idempotencyKey: idempotencyKey.current,
        }),
      })
      const body = await response.json() as WithdrawalResponse
      if (!response.ok) throw new Error(body.error || 'De herroeping kon niet worden vastgelegd.')
      setResult(body)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'De herroeping kon niet worden vastgelegd.')
      setBusy(false)
    }
  }

  if (result) return (
    <section className="rounded-2xl bg-[#e7ddc9] p-7 text-center shadow-soft md:p-12" aria-live="polite">
      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Herroeping ontvangen</p>
      <h1 className="mt-4 text-2xl font-semibold uppercase tracking-[0.16em]">Je melding is vastgelegd</h1>
      <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-600">Bewaar referentie <strong>{result.requestNumber}</strong>. De automatische ontvangstbevestiging wordt naar het e-mailadres van de bestelling gestuurd.</p>
      <div className="mx-auto mt-7 max-w-xl rounded-xl border border-neutral-800/10 bg-white/30 p-5 text-left text-sm leading-7 text-neutral-600">
        <p>Stuur het werk pas terug volgens de instructies in de bevestiging en verpak het zorgvuldig.</p>
        <p className="mt-2">Retouradres: {siteDetails.address.street}, {siteDetails.address.postalCode} {siteDetails.address.city}.</p>
      </div>
    </section>
  )

  return (
    <section className="overflow-hidden rounded-2xl bg-[#e7ddc9] shadow-soft">
      <header className="border-b border-neutral-800/10 p-7 md:p-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Een online aankoop ongedaan maken</p>
        <h1 className="mt-3 text-2xl font-semibold uppercase tracking-[0.16em]">Bestelling herroepen</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600">Gebruik dit formulier om binnen de wettelijke bedenktijd ondubbelzinnig te melden dat je de gehele bestelling of een deel daarvan wilt herroepen. Je hoeft geen reden op te geven.</p>
      </header>
      <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5 p-7 md:p-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs">Bestelnummer<input required name="orderNumber" autoComplete="off" placeholder="SD-…" className="mt-2 w-full rounded-xl border border-neutral-800/15 bg-white/35 px-4 py-3 text-sm uppercase" /></label>
          <label className="text-xs">E-mailadres van de bestelling<input required type="email" name="email" autoComplete="email" className="mt-2 w-full rounded-xl border border-neutral-800/15 bg-white/35 px-4 py-3 text-sm" /></label>
        </div>
        <fieldset>
          <legend className="text-xs">Wat wil je herroepen?</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-neutral-800/10 bg-white/25 p-4 text-sm"><input type="radio" name="scope" checked={scope === 'full'} onChange={() => setScope('full')} /> De gehele bestelling</label>
            <label className="flex items-center gap-3 rounded-xl border border-neutral-800/10 bg-white/25 p-4 text-sm"><input type="radio" name="scope" checked={scope === 'partial'} onChange={() => setScope('partial')} /> Een deel van de bestelling</label>
          </div>
        </fieldset>
        {scope === 'partial' && <label className="block text-xs">Welk werk wil je retourneren?<textarea required name="itemDescription" maxLength={500} rows={3} className="mt-2 w-full rounded-xl border border-neutral-800/15 bg-white/35 px-4 py-3 text-sm" /></label>}
        <div className="rounded-xl border border-neutral-800/10 bg-white/25 p-4 text-xs leading-6 text-neutral-600">
          Na verzending leggen we het tijdstip vast. Je ontvangt een bevestiging die je kunt bewaren. De rechtstreekse retourkosten zijn voor de koper.
        </div>
        {error && <p role="alert" className="rounded-xl border border-red-900/20 bg-red-50/45 p-4 text-sm text-red-900">{error}</p>}
        <button disabled={busy} className="w-full rounded-full bg-neutral-900 px-6 py-4 text-xs uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Herroeping vastleggen…' : 'Herroeping verzenden'}</button>
      </form>
    </section>
  )
}

export default WithdrawalPage
