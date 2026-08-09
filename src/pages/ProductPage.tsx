import { productImage, products, type Product } from '../data/products'
import { formatCents } from '../utils/money'
import { useShop } from '../context/ShopContext'
import { useProductAvailability } from '../hooks/useProductAvailability'
import { companionStoryShort } from '../data/companionStory'

type ProductPageProps = { product: Product; navigate: (path: string) => void; certificate?: boolean }

const ProductPage = ({ product, navigate, certificate = false }: ProductPageProps) => {
  const { cart, favorites, openCart, toggleCart, toggleFavorite } = useShop()
  const availability = useProductAvailability([product.id])[product.id] ?? 'available'
  const readyToBuy = product.readiness === 'purchasable'
  const sold = product.status === 'verkocht' || product.readiness === 'sold' || availability === 'sold'
  const measurements = [
    product.heightCm && product.widthCm ? `${product.heightCm} × ${product.widthCm} cm` : null,
    product.diameterCm ? `doorsnede ${product.diameterCm} cm` : null,
    product.depthCm ? `${product.category === 'Woontextiel' ? 'dikte' : 'diepte'} ${product.depthCm} cm` : product.depthNotApplicable ? `${product.category === 'Woontextiel' ? 'dikte' : 'diepte'} niet van toepassing` : null,
  ].filter(Boolean).join(' · ')
  if (certificate) return (
    <article className="relative overflow-hidden rounded-2xl border border-[#c6a978] bg-[#f8f4ec] p-8 text-center shadow-soft md:p-14">
      <div aria-hidden="true" className="thread-line absolute -left-20 top-0 h-full w-48" />
      <img src="/logo.png" alt="" className="mx-auto h-20 w-20 object-contain" />
      <p className="mt-5 text-xs uppercase tracking-[0.24em]">Stilte &amp; Draad · door Jannie</p>
      <h1 className="mt-10 text-2xl uppercase tracking-[0.2em]">Digitaal werkcertificaat</h1>
      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-neutral-500">Het verhaal achter één uniek werk</p>
      <div className="mx-auto mt-10 max-w-lg rounded-xl bg-[#e7ddc9]/55 p-7 text-left text-sm leading-7">
        <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3"><dt>Titel</dt><dd>{product.title}</dd><dt>Uniek nummer</dt><dd>S&amp;D-{String(product.id).padStart(4, '0')}</dd><dt>Status</dt><dd className="capitalize">{product.status}</dd>{measurements && <><dt>Afmetingen</dt><dd>{measurements}</dd></>}{product.materials?.length ? <><dt>Materiaal</dt><dd>{product.materials.join(' · ')}</dd></> : null}<dt>Herkomst</dt><dd>Handgemaakt door Jannie van Zanten</dd><dt>Karakter</dt><dd>{product.unique ? 'Eenmalig en uniek' : `Kleine oplage van ${product.stock}`}</dd></dl>
      </div>
      <p className="mx-auto mt-10 max-w-xl text-sm italic leading-7">Iedere draad draagt een stukje van mijn leven. Samen vormen zij een verhaal in kleuren en vormen.</p>
      <button type="button" onClick={() => navigate(`/werk/${product.slug}`)} className="mt-8 text-xs uppercase tracking-[0.16em] underline underline-offset-4">Terug naar het werk</button>
    </article>
  )

  const related = products.filter((item) => item.category === product.category && item.id !== product.id && item.duplicateOfProductId === null).slice(0, 3)
  return (
    <div className="space-y-7">
      <article className="overflow-hidden rounded-2xl bg-[#e7ddc9] shadow-soft"><div className="grid md:grid-cols-2">
        <div className="relative min-h-0 overflow-hidden">
          <img src={productImage(product)} alt={product.title} className="h-full max-h-[760px] w-full object-cover" />
          {sold && <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/20" aria-label="Dit werk is verkocht"><span className="border-y-2 border-white/75 bg-neutral-950/55 px-8 py-4 text-2xl font-bold uppercase tracking-[0.24em] text-white shadow-lg backdrop-blur-[1px] md:text-4xl">Verkocht</span></div>}
        </div>
        <div className="flex flex-col p-8 md:p-12"><p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">{product.category} · S&amp;D-{String(product.id).padStart(4, '0')}</p><h1 className="mt-5 text-3xl font-semibold uppercase tracking-[0.14em]">{product.title}</h1><div className="my-7 h-px w-12 bg-[#c6a978]" /><p className="text-sm leading-7 text-neutral-700">{product.description}</p>{measurements && <p className="mt-4 text-xs uppercase tracking-[0.14em] text-neutral-500">{measurements}</p>}{product.materials?.length ? <p className="mt-2 text-xs uppercase tracking-[0.14em] text-neutral-500">Materiaal: {product.materials.join(' · ')}</p> : null}{product.careInstructions ? <p className="mt-2 text-xs leading-5 text-neutral-600">Onderhoud: {product.careInstructions}</p> : null}{product.handmadeVariationNotice ? <p className="mt-2 text-xs leading-5 text-neutral-600">Handgemaakt: {product.handmadeVariationNotice}</p> : null}{product.fragile ? <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#8a6b43]">Fragiel werk</p> : null}<p className="mt-6 text-sm italic leading-7 text-neutral-600">Iedere draad draagt een stukje van mijn leven. Samen vormen zij een verhaal in kleuren en vormen.</p><div className="mt-auto pt-10"><p className="text-2xl font-semibold">{formatCents(product.price * 100)}</p><p className="mt-2 text-xs uppercase tracking-[0.14em] text-neutral-500">{sold ? 'Heeft een thuis gevonden' : availability === 'reserved' ? 'Tijdelijk voor iemand bewaard' : readyToBuy ? product.unique ? 'Handgemaakt · uniek werk' : 'Handgemaakt · beperkte voorraad' : 'Tentoonstellingswerk · binnenkort bestelbaar'}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" disabled={sold || !readyToBuy || (availability !== 'available' && !cart.includes(product.id))} onClick={() => { const adding = !cart.includes(product.id); toggleCart(product.id); if (adding) openCart() }} className="rounded-full bg-neutral-900 px-4 py-3 text-xs uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-45">{sold ? 'Verkocht' : cart.includes(product.id) ? 'Uit winkelmand' : !readyToBuy ? 'Binnenkort bestelbaar' : availability === 'reserved' ? 'Gereserveerd' : 'In winkelmand'}</button><button type="button" onClick={() => toggleFavorite(product.id)} className="rounded-full border border-neutral-800/20 px-4 py-3 text-xs uppercase tracking-[0.14em]">{favorites.includes(product.id) ? 'Favoriet ♥' : 'Bewaar ♡'}</button></div>{readyToBuy && <p className="mt-4 rounded-xl border border-neutral-800/10 bg-white/25 p-4 text-xs leading-5 text-neutral-600">{companionStoryShort}</p>}<button type="button" onClick={() => navigate(`/certificaat/${product.slug}`)} className="mt-5 text-[10px] uppercase tracking-[0.16em] underline underline-offset-4">Bekijk digitaal certificaat</button></div></div>
      </div></article>
      <section><h2 className="text-xs uppercase tracking-[0.18em] text-neutral-500">Verwante werken</h2><div className="mt-4 grid gap-4 sm:grid-cols-3">{related.map((item) => <button key={item.id} type="button" onClick={() => navigate(`/werk/${item.slug}`)} className="overflow-hidden rounded-xl bg-white/35 text-left"><img src={productImage(item)} alt="" loading="lazy" className="aspect-square w-full object-cover" /><span className="block p-4 text-xs uppercase tracking-[0.13em]">{item.title}</span></button>)}</div></section>
      {!certificate && <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-neutral-800/10 bg-white/25 p-5 text-xs leading-6 text-neutral-600"><h2 className="font-semibold uppercase tracking-[0.14em] text-neutral-700">Ontvangst van het werk</h2><p className="mt-2">Je kunt dit werk binnen Nederland laten verzenden voor €6,95 of gratis ophalen op afspraak in IJzendoorn. Tijdens het afrekenen kies je wat het beste bij je past.</p></section>
        <section className="rounded-xl border border-neutral-800/10 bg-white/25 p-5 text-xs leading-6 text-neutral-600"><h2 className="font-semibold uppercase tracking-[0.14em] text-neutral-700">Bedenktijd en retour</h2><p className="mt-2">Bij een online aankoop heb je in beginsel veertien dagen bedenktijd na ontvangst. De rechtstreekse retourkosten zijn voor de koper.</p><div className="mt-3 flex flex-wrap gap-4"><button type="button" onClick={() => navigate('/herroepen')} className="uppercase tracking-[0.13em] underline underline-offset-4">Bestelling herroepen</button><button type="button" onClick={() => navigate('/algemene-voorwaarden')} className="uppercase tracking-[0.13em] underline underline-offset-4">Volledige retourinformatie</button></div></section>
      </div>}
    </div>
  )
}

export default ProductPage
