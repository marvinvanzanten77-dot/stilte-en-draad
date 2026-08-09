import { productImageDisclosure } from '../data/productPresentation'

const ProductImageDisclosure = () => (
  <aside aria-label="Toelichting bij het productbeeld" className="border-t border-neutral-800/10 bg-white/20 px-5 py-4 text-xs leading-5 text-neutral-600 sm:px-6">
    {productImageDisclosure}
  </aside>
)

export default ProductImageDisclosure
