import { productImage, products, type Product } from './products'
import { productReadinessIssues } from './productReadiness'
import { siteDetails } from './siteDetails'

export const SHIPPING_COST_CENTS = 695
export const SOCIAL_STORY_LINE = 'Handgemaakt textielwerk met een eigen fysiek verhaal.'
export const COMPOSITE_SYNTHETIC_URI = 'http://cv.iptc.org/newscodes/digitalsourcetype/compositeSynthetic'

export const isMerchantProduct = (product: Product) =>
  product.duplicateOfProductId === null &&
  product.status === 'beschikbaar' &&
  product.readiness === 'purchasable' &&
  product.stock > 0 &&
  product.shippingAllowed &&
  productReadinessIssues(product).length === 0

export const merchantProducts = products.filter(isMerchantProduct)
export const canonicalProductUrl = (product: Product) => `${siteDetails.url}/werk/${product.slug}`
export const absoluteProductImage = (product: Product) => new URL(productImage(product), siteDetails.url).href
export const socialProductImage = (product: Product) => `${siteDetails.url}/social/products/${product.slug}.jpg`

export const buildCampaignUrl = (url: string, source: 'pinterest' | 'facebook' | 'instagram' | 'whatsapp' | 'flyer' | 'kaart' | 'markt' | 'festival', campaign = 'product_verhaal') => {
  const result = new URL(url)
  result.searchParams.set('utm_source', source)
  result.searchParams.set('utm_medium', ['flyer', 'kaart', 'markt', 'festival'].includes(source) ? 'offline' : 'social')
  result.searchParams.set('utm_campaign', campaign)
  return result.toString()
}
