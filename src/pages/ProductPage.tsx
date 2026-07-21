import { useEffect } from 'react'
import { formatPrice, productImage, products, type Product } from '../data/products'
import { useShop } from '../context/ShopContext'

type ProductPageProps = { product: Product; navigate: (path: string) => void; certificate?: boolean }

const ProductPage = ({ product, navigate, certificate = false }: ProductPageProps) => {
  const { cart, favorites, toggleCart, toggleFavorite } = useShop()
  useEffect(() => { document.title = `${product.title} · Stilte & Draad` }, [product])
  if (certificate) return (
    <article className="relative overflow-hidden rounded-2xl border border-[#c6a978] bg-[#f8f4ec] p-8 text-center shadow-soft md:p-14">
      <div aria-hidden="true" className="thread-line absolute -left-20 top-0 h-full w-48" />
      <img src="/logo.png" alt="" className="mx-auto h-20 w-20 object-contain" />
      <p className="mt-5 text-xs uppercase tracking-[0.24em]">Stilte &amp; Draad · door Jannie</p>
      <h1 className="mt-10 text-2xl uppercase tracking-[0.2em]">Digitaal werkcertificaat</h1>
      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-neutral-500">Het verhaal achter één uniek werk</p>
      <div className="mx-auto mt-10 max-w-lg rounded-xl bg-[#e7ddc9]/55 p-7 text-left text-sm leading-7">
        <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3"><dt>Titel</dt><dd>{product.title}</dd><dt>Uniek nummer</dt><dd>S&amp;D-{String(product.id).padStart(4, '0')}</dd><dt>Status</dt><dd className="capitalize">{product.status}</dd><dt>Herkomst</dt><dd>Handgemaakt door Jannie van Zanten</dd><dt>Karakter</dt><dd>Eenmalig en uniek</dd></dl>
      </div>
      <p className="mx-auto mt-10 max-w-xl text-sm italic leading-7">Iedere draad draagt een stukje van mijn leven. Samen vormen zij een verhaal in kleuren en vormen.</p>
      <button type="button" onClick={() => navigate(`/werk/${product.slug}`)} className="mt-8 text-xs uppercase tracking-[0.16em] underline underline-offset-4">Terug naar het werk</button>
    </article>
  )

  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3)
  return (
    <div className="space-y-7">
      <article className="overflow-hidden rounded-2xl bg-[#e7ddc9] shadow-soft"><div className="grid md:grid-cols-2">
        <img src={productImage(product)} alt={product.title} className="h-full max-h-[760px] w-full object-cover" />
        <div className="flex flex-col p-8 md:p-12"><p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">{product.category} · S&amp;D-{String(product.id).padStart(4, '0')}</p><h1 className="mt-5 text-3xl font-semibold uppercase tracking-[0.14em]">{product.title}</h1><div className="my-7 h-px w-12 bg-[#c6a978]" /><p className="text-sm leading-7 text-neutral-700">{product.description}</p><p className="mt-6 text-sm italic leading-7 text-neutral-600">Iedere draad draagt een stukje van mijn leven. Samen vormen zij een verhaal in kleuren en vormen.</p><div className="mt-auto pt-10"><p className="text-2xl font-semibold">{formatPrice(product.price)}</p><p className="mt-2 text-xs uppercase tracking-[0.14em] text-neutral-500">Handgemaakt · uniek werk</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => toggleCart(product.id)} className="rounded-full bg-neutral-900 px-4 py-3 text-xs uppercase tracking-[0.14em] text-white">{cart.includes(product.id) ? 'Uit winkelmand' : 'In winkelmand'}</button><button type="button" onClick={() => toggleFavorite(product.id)} className="rounded-full border border-neutral-800/20 px-4 py-3 text-xs uppercase tracking-[0.14em]">{favorites.includes(product.id) ? 'Favoriet ♥' : 'Bewaar ♡'}</button></div><button type="button" onClick={() => navigate(`/certificaat/${product.slug}`)} className="mt-5 text-[10px] uppercase tracking-[0.16em] underline underline-offset-4">Bekijk digitaal certificaat</button></div></div>
      </div></article>
      <section><h2 className="text-xs uppercase tracking-[0.18em] text-neutral-500">Verwante werken</h2><div className="mt-4 grid gap-4 sm:grid-cols-3">{related.map((item) => <button key={item.id} type="button" onClick={() => navigate(`/werk/${item.slug}`)} className="overflow-hidden rounded-xl bg-white/35 text-left"><img src={productImage(item)} alt="" loading="lazy" className="aspect-square w-full object-cover" /><span className="block p-4 text-xs uppercase tracking-[0.13em]">{item.title}</span></button>)}</div></section>
    </div>
  )
}

export default ProductPage
