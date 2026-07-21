import { useMemo, useState } from 'react'
import { formatPrice, productCategories as categories, productThumbnail, products } from '../data/products'
import { useShop } from '../context/ShopContext'

const Webshop = ({ navigate }: { navigate: (path: string) => void }) => {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>('Alles')
  const [cartOpen, setCartOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'verhaal' | 'laag' | 'hoog'>('verhaal')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const { cart, favorites, toggleCart, toggleFavorite, clearCart } = useShop()

  const visibleProducts = useMemo(
    () => products
      .filter((product) => activeCategory === 'Alles' || product.category === activeCategory)
      .filter((product) => !favoritesOnly || favorites.includes(product.id))
      .filter((product) => `${product.title} ${product.description}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => sort === 'laag' ? a.price - b.price : sort === 'hoog' ? b.price - a.price : a.id - b.id),
    [activeCategory, favorites, favoritesOnly, query, sort],
  )

  const cartProducts = cart.map((id) => products.find((product) => product.id === id)!)
  const cartTotal = cartProducts.reduce((total, product) => total + product.price, 0)

  return (
    <div className="min-h-[560px] overflow-hidden rounded-2xl bg-[#e7ddc9] shadow-soft ring-1 ring-neutral-200/40">
      <header className="flex flex-col gap-6 border-b border-neutral-800/10 p-7 md:flex-row md:items-end md:justify-between md:p-10">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">Het atelier</p>
          <h1 className="mt-2 text-2xl font-semibold uppercase tracking-[0.18em] text-neutral-900">Webshop</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-neutral-700">
            Ieder werk draagt een herinnering, een droom of een stukje leven en wacht op een plek om verder te leven.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCartOpen((open) => !open)}
          aria-expanded={cartOpen}
          className="flex items-center justify-between gap-5 self-start rounded-full border border-neutral-800/20 bg-white/35 px-5 py-3 text-xs uppercase tracking-[0.16em] transition hover:bg-white/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700"
        >
          Winkelmand
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white">{cart.length}</span>
        </button>
      </header>

      {cartOpen && (
        <aside className="border-b border-neutral-800/10 bg-white/25 px-7 py-6 md:px-10" aria-label="Winkelmand">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">Jouw gekozen werken</p>
            {cart.length > 0 && <button type="button" onClick={clearCart} className="text-[10px] uppercase tracking-[0.14em] text-neutral-500 underline underline-offset-4">Maak leeg</button>}
          </div>
          {cart.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-600">Je winkelmand is nog leeg.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {cartProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 rounded-lg bg-white/30 p-2">
                  <img src={productThumbnail(product)} alt="" className="h-14 w-14 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.title}</p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">{formatPrice(product.price)}</p>
                  </div>
                  <button type="button" onClick={() => toggleCart(product.id)} aria-label={`Verwijder ${product.title}`} className="h-8 w-8 rounded-full text-neutral-500 hover:bg-white/50">×</button>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-neutral-800/10 pt-4 text-sm">
                <span className="uppercase tracking-[0.14em] text-neutral-500">Totaal</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
              <p className="mt-2 rounded-full border border-neutral-800/15 px-5 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600">Je selectie wordt op dit apparaat bewaard</p>
            </div>
          )}
        </aside>
      )}

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
          <label><span className="sr-only">Sorteer werken</span><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="h-full rounded-full border border-neutral-800/15 bg-white/35 px-4 text-xs uppercase tracking-[0.12em]"><option value="verhaal">Volgorde</option><option value="laag">Prijs laag–hoog</option><option value="hoog">Prijs hoog–laag</option></select></label>
          <button type="button" aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly((value) => !value)} className={`rounded-full border px-4 py-3 text-xs uppercase tracking-[0.12em] ${favoritesOnly ? 'bg-neutral-900 text-white' : 'border-neutral-800/15 bg-white/35'}`}>Favorieten {favorites.length > 0 && `(${favorites.length})`}</button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => {
            const inCart = cart.includes(product.id)
            return (
              <article key={product.id} className="group overflow-hidden rounded-xl border border-white/45 bg-white/25 transition hover:-translate-y-1 hover:bg-white/35 hover:shadow-soft">
                <button type="button" onClick={() => navigate(`/werk/${product.slug}`)} className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-700">
                  <div className="aspect-[4/5] overflow-hidden bg-neutral-200/40">
                    <img src={productThumbnail(product)} alt={product.title} loading="lazy" decoding="async" width="720" height="720" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                  </div>
                  <div className="p-5 pb-3">
                    <p className="text-[10px] uppercase tracking-[0.17em] text-neutral-500">{product.category} · Werk {String(product.id).padStart(2, '0')}</p>
                    <h2 className="mt-2 text-base font-semibold uppercase tracking-[0.12em] text-neutral-900">{product.title}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">{product.description}</p>
                    <p className="mt-4 text-[10px] uppercase tracking-[0.15em] text-neutral-500">Bekijk het verhaal →</p>
                  </div>
                </button>
                <div className="flex items-center justify-between border-t border-neutral-800/10 px-5 py-4">
                  <span className="text-sm font-medium tracking-[0.06em] text-neutral-700">{formatPrice(product.price)}</span>
                  <div className="flex gap-2"><button type="button" onClick={() => toggleFavorite(product.id)} aria-label={`${favorites.includes(product.id) ? 'Verwijder' : 'Voeg toe'} favoriet ${product.title}`} className="h-8 w-8 rounded-full border border-neutral-800/15">{favorites.includes(product.id) ? '♥' : '♡'}</button><button type="button" onClick={() => toggleCart(product.id)} className={`rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.13em] transition ${inCart ? 'bg-neutral-900 text-white' : 'border border-neutral-800/20 hover:bg-white/50'}`}>
                    {inCart ? 'Gekozen ✓' : 'Bewaar werk'}
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
