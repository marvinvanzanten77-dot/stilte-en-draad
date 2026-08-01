import type { VercelRequest, VercelResponse } from '@vercel/node'
import { enforceRateLimit, json, method, safeError } from '../../_lib/http.js'
import { synchronizePayment } from '../../_lib/mollie.js'
import { getOrder } from '../../_lib/store.js'

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!method(request, response, 'GET')) return
  try {
    if (!await enforceRateLimit(request, response, 'order-status', 40, 60)) return
    const orderId = Array.isArray(request.query.orderId) ? request.query.orderId[0] : request.query.orderId
    if (!orderId) return json(response, 400, { error: 'Ordernummer ontbreekt.' })
    let order = await getOrder(orderId)
    if (!order) return json(response, 404, { error: 'Bestelling niet gevonden.' })
    if (order.mollie_payment_id && ['draft', 'pending'].includes(order.status)) {
      await synchronizePayment(order.mollie_payment_id)
      order = await getOrder(orderId)
    }
    return json(response, 200, {
      orderId: order.id,
      orderNumber: order.order_number,
      kind: order.kind,
      status: order.status,
      subtotalCents: order.subtotal_cents,
      shippingCents: order.shipping_cents,
      totalCents: order.total_cents,
      fulfillment: order.fulfillment,
      items: order.items,
    })
  } catch (error) {
    return safeError(response, error)
  }
}
