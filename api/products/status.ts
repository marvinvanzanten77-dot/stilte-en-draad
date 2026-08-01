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
    return json(response, 200, { products: await getProductAvailability(validIds) })
  } catch (error) {
    return safeError(response, error)
  }
}
