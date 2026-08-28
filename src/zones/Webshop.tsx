import { useMemo, useState } from 'react'
import { productCategories as categories, productThumbnail, products } from '../data/products'
import { useShop } from '../context/ShopContext'
import { useProductAvailability } from '../hooks/useProductAvailability'
import { formatCents } from '../utils/money'
import { companionStoryLong } from '../data/companionStory'

const Webshop = ({ navigate }: { navigate: (path: string) => void }) => {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>('Alles')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'verhaal' | 'laag' | 'hoog' | 'beschikbaar' | 'verkocht'>('verhaal')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const { cart, favorites, openCart, toggleCart, toggleFavorite } = useShop()
  const availability = useProductAvailability(products.map((product) => product.id))

  const visibleProducts = useMemo(
    () => products
      .filter((product) => activeCategory === 'Alles' || product.category === activeCategory)
      .filter((product) => !favoritesOnly || favorites.includes(product.id))
      .filter((product) => `${product.title} ${product.description}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sort === 'laag') return a.price - b.price
        if (sort === 'hoog') return b.price - a.price
        if (sort === 'beschikbaar' || sort === 'verkocht') {
          const aSold = a.status === 'verkocht' || a.readiness === 'sold' || availability[a.id] === 'sold'
          const bSold = b.status === 'verkocht' || b.readiness === 'sold' || availability[b.id] === 'sold'
          if (aSold !== bSold) return sort === 'verkocht' ? Number(bSold) - Number(aSold) : Number(aSold) - Number(bSold)
        }
        return a.id - b.id
      }),
    [activeCategory, availability, favorites, favoritesOnly, query, sort],
  )

  return (
    <div className="min-h-[560px] overflow-hidden rounded-2xl bg-[#e7ddc9] shadow-soft ring-1 ring-neutral-200/40">
      <header className="flex flex-col gap-6 border-b border-neutral-800/10 p-7 md:flex-row md:items-end md:justify-between md:p-10">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">Het atelier</p>
          <h1 className="mt-2 text-2xl font-semibold uppercase tracking-[0.18em] text-neutral-900">Webshop · handgemaakte textielkunst</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-neutral-700">
            Ieder werk draagt een herinnering, een droom of een stukje leven en wacht op een plek om verder te leven.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-700">{companionStoryLong}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-700">Ontdek unieke haakwerken, gehaakte wanddecoratie, dromenvangers en handgemaakte tassen uit Jannies atelier in IJzendoorn.</p>
        </div>
      </header>

      <div className="p-7 md:p-10">
        <div className="flex flex-wrap gap-2" aria-label="Productcategorieën">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
              className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 ${activeCategory === category ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-800/20 bg-white/20 text-neutral-700 hover:bg-white/45'}`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-2 rounded-xl border border-white/45 bg-white/20 p-4 text-center text-[10px] uppercase tracking-[0.13em] text-neutral-600 sm:grid-cols-3"><span>Unieke werken</span><span>Handgemaakt door Jannie</span><span>Een verhaal bij ieder werk</span></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <label><span className="sr-only">Zoek werken</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek op titel of verhaal…" className="w-full rounded-full border border-neutral-800/15 bg-white/35 px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-neutral-700" /></label>
          <label><span className="sr-only">Sorteer werken</span><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="h-full rounded-full border border-neutral-800/15 bg-white/35 px-4 text-xs uppercase tracking-[0.12em]"><option value="verhaal">Volgorde</option><option value="beschikbaar">Niet verkocht eerst</option><option value="verkocht">Verkocht eerst</option><option value="laag">Prijs laag–hoog</option><option value="hoog">Prijs hoog–laag</option></select></label>
          <button type="button" aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly((value) => !value)} className={`rounded-full border px-4 py-3 text-xs uppercase tracking-[0.12em] ${favoritesOnly ? 'bg-neutral-900 text-white' : 'border-neutral-800/15 bg-white/35'}`}>Favorieten {favorites.length > 0 && `(${favorites.length})`}</button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => {
            const inCart = cart.includes(product.id)
            const productStatus = availability[product.id] ?? 'available'
            const readyToBuy = product.readiness === 'purchasable'
            const sold = product.status === 'verkocht' || product.readiness === 'sold' || productStatus === 'sold'
            return (
              <article key={product.id} className="group overflow-hidden rounded-xl border border-white/45 bg-white/25 transition hover:-translate-y-1 hover:bg-white/35 hover:shadow-soft">
                <button type="button" aria-label={`Bekijk ${product.title}`} onClick={() => navigate(`/werk/${product.slug}`)} className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-700">
                  <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200/40">
                    <img src={productThumbnail(product)} alt={product.title} loading="lazy" decoding="async" width="720" height="720" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                    {sold && <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/20" aria-label="Dit werk is verkocht"><span className="border-y border-white/75 bg-neutral-950/55 px-5 py-3 text-lg font-bold uppercase tracking-[0.22em] text-white shadow-lg backdrop-blur-[1px]">Verkocht</span></div>}
                  </div>
                  <div className="p-5 pb-3">
                    <p className="text-[10px] uppercase tracking-[0.17em] text-neutral-500">{product.category} · Werk {String(product.id).padStart(2, '0')}</p>
                    <h2 className="mt-2 text-base font-semibold uppercase tracking-[0.12em] text-neutral-900">{product.title}</h2>
                    {(sold || !readyToBuy || productStatus !== 'available') && <p className="mt-2 text-[9px] uppercase tracking-[0.15em] text-[#8a6b43]">{sold ? 'Heeft een thuis gevonden' : !readyToBuy ? 'Binnenkort bestelbaar' : 'Tijdelijk bewaard'}</p>}
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">{product.description}</p>
                    <p className="mt-4 text-[10px] uppercase tracking-[0.15em] text-neutral-500">Bekijk het verhaal →</p>
                  </div>
                </button>
                <div className="flex items-center justify-between border-t border-neutral-800/10 px-5 py-4">
                  <span className="text-sm font-medium tracking-[0.06em] text-neutral-700">{formatCents(product.price * 100)}</span>
                  <div className="flex gap-2"><button type="button" onClick={() => toggleFavorite(product.id)} aria-label={`${favorites.includes(product.id) ? 'Verwijder' : 'Voeg toe'} favoriet ${product.title}`} className="h-8 w-8 rounded-full border border-neutral-800/15">{favorites.includes(product.id) ? '♥' : '♡'}</button><button type="button" disabled={sold || !readyToBuy || (productStatus !== 'available' && !inCart)} onClick={() => { toggleCart(product.id); if (!inCart) openCart() }} className={`rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.13em] transition disabled:cursor-not-allowed disabled:opacity-45 ${inCart ? 'bg-neutral-900 text-white' : 'border border-neutral-800/20 hover:bg-white/50'}`}>
                    {sold ? 'Verkocht' : inCart ? 'Uit winkelmand' : !readyToBuy ? 'Binnenkort' : productStatus === 'reserved' ? 'Gereserveerd' : 'In winkelmand'}
                  </button></div>
                </div>
              </article>
            )
          })}
        </div>
        {visibleProducts.length === 0 && <p className="py-16 text-center text-sm text-neutral-500">Geen werken gevonden. Pas je zoekopdracht of filters aan.</p>}
      </div>
    </div>
  )
}

export default Webshop
