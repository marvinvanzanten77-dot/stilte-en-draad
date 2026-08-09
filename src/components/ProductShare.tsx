import { useState } from 'react'
import type { Product } from '../data/products'
import { buildCampaignUrl, canonicalProductUrl, socialProductImage } from '../data/reach'

const ProductShare = ({ product }: { product: Product }) => {
  const [copied, setCopied] = useState(false)
  const base = canonicalProductUrl(product)
  const text = `${product.title} van Stilte & Draad — handgemaakt door Jannie, met een eigen verhaal.`
  const links = [
    { label: 'Pinterest', href: `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(buildCampaignUrl(base, 'pinterest'))}&media=${encodeURIComponent(socialProductImage(product))}&description=${encodeURIComponent(text)}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildCampaignUrl(base, 'facebook'))}` },
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${text} ${buildCampaignUrl(base, 'whatsapp')}`)}` },
  ]
  const copy = async () => {
    const url = buildCampaignUrl(base, 'instagram')
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2500)
  }
  return <section className="rounded-xl border border-neutral-800/10 bg-white/25 p-5" aria-labelledby="deel-dit-werk">
    <h2 id="deel-dit-werk" className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-700">Deel dit werk</h2>
    <p className="mt-2 text-xs leading-5 text-neutral-600">Stuur het naar iemand die hier misschien iets in herkent.</p>
    <div className="mt-4 flex flex-wrap gap-2">
      {links.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="rounded-full border border-neutral-800/20 px-4 py-2 text-[11px] uppercase tracking-[0.12em]">{link.label}</a>)}
      <button type="button" onClick={copy} className="rounded-full border border-neutral-800/20 px-4 py-2 text-[11px] uppercase tracking-[0.12em]" aria-live="polite">{copied ? 'Link gekopieerd' : 'Kopieer link'}</button>
    </div>
    <p className="mt-3 text-[11px] leading-5 text-neutral-500">Voor Instagram: kopieer de link en plak hem in je bericht of profiel.</p>
  </section>
}

export default ProductShare
