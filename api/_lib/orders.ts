import { randomUUID } from 'node:crypto'
import { products } from '../../src/data/products.js'
import { productReadinessIssues } from '../../src/data/productReadiness.js'

export const newOrderIdentity = (prefix: 'SD' | 'DON') => {
  const id = randomUUID()
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return { id, orderNumber: `${prefix}-${date}-${id.slice(0, 8).toUpperCase()}` }
}

export const catalogItem = (productId: number) => products.find((candidate) => candidate.id === productId)

export const SHIPPING_COST_CENTS = 695

export const trustedItems = (productIds: number[]) => {
  const uniqueIds = [...new Set(productIds)]
  if (uniqueIds.length !== productIds.length) throw new Error('CHECKOUT:Een uniek werk kan maar eenmaal in de winkelmand staan.')
  return uniqueIds.map((id) => {
    const product = products.find((candidate) => candidate.id === id)
    if (!product) throw new Error('CHECKOUT:Een gekozen werk bestaat niet.')
    if (product.duplicateOfProductId !== null) throw new Error(`CHECKOUT:${product.title} verwijst naar hetzelfde werk als een andere catalogusvermelding.`)
    if (product.readiness === 'sold' || product.status === 'verkocht' || product.stock < 1) throw new Error(`CHECKOUT:${product.title} heeft al een thuis gevonden.`)
    const missing = productReadinessIssues(product)
    if (product.readiness !== 'purchasable' || missing.length) {
      throw new Error(`CHECKOUT:${product.title} is nog niet bestelbaar. Ontbreekt: ${missing.join(', ') || 'vrijgave als purchasable'}.`)
    }
    return { product, productId: product.id, title: product.title, unitPriceCents: product.price * 100, stock: product.stock }
  })
}

export const shippingFor = (productIds: number[]) => {
  const selected = trustedItems(productIds)
  if (selected.some(({ product }) => !product.shippingAllowed)) throw new Error('CHECKOUT:Een gekozen werk kan niet worden verzonden.')
  return SHIPPING_COST_CENTS
}

export const pickupAllowedFor = (productIds: number[]) => {
  const selected = trustedItems(productIds)
  if (selected.some(({ product }) => !product.pickupAllowed)) throw new Error('CHECKOUT:Afhalen is voor een gekozen werk nog niet beschikbaar.')
}
