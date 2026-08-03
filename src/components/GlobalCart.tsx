import { useRef } from 'react'
import { useShop } from '../context/ShopContext'
import { productThumbnail, products } from '../data/products'
import { useDialogFocus } from '../hooks/useDialogFocus'
import { formatCents } from '../utils/money'

const GlobalCart = ({ navigate }: { navigate: (path: string) => void }) => {
  const { cart, cartOpen, clearCart, closeCart, openCart, toggleCart } = useShop()
  const dialogRef = useRef<HTMLElement>(null)
  useDialogFocus(cartOpen, dialogRef, closeCart)
  const cartProducts = cart.flatMap((id) => {
    const product = products.find((candidate) => candidate.id === id)
    return product ? [product] : []
  })
  const totalCents = cartProducts.reduce((total, product) => total + product.price * 100, 0)
  const goToCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  return (
    <>
      <button type="button" onClick={openCart} aria-expanded={cartOpen} aria-controls="globale-winkelmand" className="shrink-0 rounded-full border border-neutral-800/20 bg-white/65 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-800 backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 sm:text-xs">
        Winkelmand {cart.length}
      </button>
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/25 backdrop-blur-[1px]" role="presentation">
          <button type="button" onClick={closeCart} aria-label="Sluit winkelmand" className="absolute inset-0 cursor-default" />
          <aside ref={dialogRef} id="globale-winkelmand" role="dialog" aria-modal="true" aria-labelledby="globale-winkelmand-titel" className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-[#f3ecdf] p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-neutral-800/10 pb-5">
              <div><p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">Jouw selectie</p><h2 id="globale-winkelmand-titel" className="mt-1 text-lg font-semibold uppercase tracking-[0.14em]">Winkelmand {cart.length}</h2></div>
              <button type="button" onClick={closeCart} aria-label="Sluit winkelmand" className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800/15 text-xl">×</button>
            </div>
            {cartProducts.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center"><p className="text-sm text-neutral-600">Je winkelmand is nog leeg.</p><button type="button" onClick={() => { closeCart(); navigate('/webshop') }} className="mt-5 rounded-full border border-neutral-800/20 px-5 py-3 text-xs uppercase tracking-[0.14em]">Bekijk de werken</button></div>
            ) : (
              <div className="flex flex-1 flex-col">
                <div className="mt-5 space-y-3">
                  {cartProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 rounded-xl bg-white/40 p-3">
                      <img src={productThumbnail(product)} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{product.title}</p><p className="mt-1 text-xs text-neutral-500">{formatCents(product.price * 100)}</p></div>
                      <button type="button" onClick={() => toggleCart(product.id)} aria-label={`Verwijder ${product.title} uit winkelmand`} className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-neutral-500 hover:bg-white/60">×</button>
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-8">
                  <div className="flex items-center justify-between border-t border-neutral-800/10 pt-5 text-sm"><span className="uppercase tracking-[0.14em] text-neutral-500">Totaal</span><strong>{formatCents(totalCents)}</strong></div>
                  <p className="mt-4 text-xs leading-5 text-neutral-600">Je haalt het werk op afspraak op in IJzendoorn, doorgaans binnen twee tot vijf werkdagen. Na je bestelling nemen we persoonlijk contact met je op om een geschikt moment af te spreken.</p>
                  <button type="button" onClick={goToCheckout} className="mt-5 w-full rounded-full bg-neutral-900 px-5 py-4 text-xs uppercase tracking-[0.16em] text-white">Naar veilig afrekenen</button>
                  <button type="button" onClick={clearCart} className="mt-4 w-full text-[10px] uppercase tracking-[0.14em] text-neutral-500 underline underline-offset-4">Maak winkelmand leeg</button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  )
}

export default GlobalCart
