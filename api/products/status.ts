import type { VercelRequest, VercelResponse } from '@vercel/node'
import { products } from '../../src/data/products.js'
import { json, method, safeError } from '../_lib/http.js'
import { getProductAvailability } from '../_lib/store.js'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!method(request, response, 'GET')) return
  try {
    const raw = Array.isArray(request.query.ids) ? request.query.ids[0] : request.query.ids
    const requested = raw?.split(',').map(Number).filter(Number.isInteger) ?? products.map((product) => product.id)
    const validIds = [...new Set(requested)].filter((id) => products.some((product) => product.id === id)).slice(0, 50)
    const inventoryAvailability = await getProductAvailability(validIds)
    const availability = Object.fromEntries(validIds.map((id) => {
      const product = products.find((candidate) => candidate.id === id)
      const soldInCatalog = product?.status === 'verkocht' || product?.readiness === 'sold' || product?.stock === 0
      return [id, soldInCatalog ? 'sold' : inventoryAvailability[id]]
    }))
    return json(response, 200, { products: availability })
  } catch (error) {
    return safeError(response, error)
  }
}
