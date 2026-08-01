import { useEffect, useState } from 'react'
import { useShop } from '../context/ShopContext'
import { formatPrice } from '../data/products'

type OrderResult = {
  orderNumber: string
  kind: 'purchase' | 'donation'
  status: 'draft' | 'pending' | 'paid' | 'failed' | 'canceled' | 'expired' | 'refunded' | 'payment_review'
  totalCents: number
  fulfillment: 'shipping' | 'pickup' | 'none'
  items: Array<{ productId: number; title: string; unitPriceCents: number }>
}

const PaymentStatusPage = ({ orderId, navigate }: { orderId: string; navigate: (path: string) => void }) => {
  const { clearCart } = useShop()
  const [result, setResult] = useState<OrderResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let stopped = false
    let timer: number | undefined
    const load = async () => {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, { cache: 'no-store' })
        const body = await response.json() as OrderResult & { error?: string }
        if (!response.ok) throw new Error(body.error || 'Status niet beschikbaar.')
        if (stopped) return
        setResult(body)
        if (body.status === 'paid' && body.kind === 'purchase') clearCart()
        if (['draft', 'pending'].includes(body.status)) timer = window.setTimeout(load, 2500)
      } catch (cause) {
        if (!stopped) setError(cause instanceof Error ? cause.message : 'Status niet beschikbaar.')
      }
    }
    load()
    return () => { stopped = true; if (timer) window.clearTimeout(timer) }
  }, [clearCart, orderId])

  const pending = !result || ['draft', 'pending'].includes(result.status)
  const paid = result?.status === 'paid'
  const donation = result?.kind === 'donation'
  const review = result?.status === 'payment_review'
  return <section className="rounded-2xl bg-[#e7ddc9] p-7 text-center shadow-soft md:p-12" aria-live="polite">
    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">{donation ? 'Donatie' : 'Bestelling'} · veilige statuscontrole</p>
    <h1 className="mt-4 text-2xl font-semibold uppercase tracking-[0.16em]">{pending ? 'We controleren je betaling' : paid ? (donation ? 'Dank je voor je bijdrage' : 'Dit werk krijgt een nieuw thuis') : review ? 'Je betaling vraagt persoonlijke controle' : result?.status === 'refunded' ? 'Betaling teruggestort' : 'Betaling niet voltooid'}</h1>
    {pending && <><div className="mx-auto mt-7 h-10 w-10 animate-spin rounded-full border-2 border-neutral-800/15 border-t-neutral-800" /><p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-neutral-600">Een terugkeer uit de bankomgeving is nog geen betalingsbewijs. We vragen de definitieve status rechtstreeks bij Mollie op.</p></>}
    {paid && <div className="mx-auto mt-7 max-w-lg rounded-xl border border-[#9b7d4f]/25 bg-white/30 p-6 text-left"><p className="text-sm font-medium">Referentie {result.orderNumber}</p>{result.items.length > 0 && <ul className="mt-4 space-y-2 text-sm text-neutral-600">{result.items.map((item) => <li key={item.productId} className="flex justify-between gap-4"><span>{item.title}</span><span>{formatPrice(item.unitPriceCents / 100)}</span></li>)}</ul>}<p className="mt-4 border-t border-neutral-800/10 pt-4 text-sm">Totaal: {formatPrice(result.totalCents / 100)}</p><p className="mt-4 text-xs leading-5 text-neutral-500">{donation ? 'Je bijdrage gaat naar de aanschaf en verbouwing van de bus.' : result.fulfillment === 'pickup' ? 'We nemen contact op om het ophalen af te spreken.' : 'Je ontvangt vervolginformatie over de verzending.'}</p></div>}
    {review && <p className="mx-auto mt-6 max-w-lg rounded-xl border border-[#9b7d4f]/25 bg-white/30 p-5 text-sm leading-7 text-neutral-600">Mollie heeft een betaling bevestigd nadat de oorspronkelijke reservering was verlopen, terwijl het unieke werk intussen opnieuw was gereserveerd of verkocht. We wijzigen de voorraad niet automatisch en nemen persoonlijk contact op.</p>}
    {!pending && !paid && !review && <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-neutral-600">Er is niets als betaald geregistreerd. Je kunt veilig terugkeren en het opnieuw proberen; een tijdelijke reservering wordt automatisch vrijgegeven.</p>}
    {error && <p role="alert" className="mx-auto mt-6 max-w-lg text-sm text-red-900">{error}</p>}
    <div className="mt-8 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => navigate(donation ? '/evenementen' : '/webshop')} className="rounded-full border border-neutral-800/20 px-6 py-3 text-xs uppercase tracking-[0.14em]">Terug naar {donation ? 'evenementen' : 'de webshop'}</button>{paid && !donation && <button type="button" onClick={() => navigate('/herroepen')} className="rounded-full border border-neutral-800/20 px-6 py-3 text-xs uppercase tracking-[0.14em]">Bestelling herroepen</button>}</div>
  </section>
}

export default PaymentStatusPage
