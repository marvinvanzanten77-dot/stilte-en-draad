import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { serverConfig } from '../_lib/config.js'
import { enforceOrigin, enforceRateLimit, json, method, safeError } from '../_lib/http.js'
import { createMolliePayment } from '../_lib/mollie.js'
import { newOrderIdentity, pickupAllowedFor, shippingFor, trustedItems } from '../_lib/orders.js'
import { attachPayment, canResumePaymentCreation, createPurchaseReservation, findByIdempotencyKey, getOrder } from '../_lib/store.js'
import type { StoredOrder } from '../_lib/store.js'
import { processPendingEmailsSafely } from '../_lib/email-dispatch.js'

const checkoutBase = z.strictObject({
  productIds: z.array(z.number().int().positive()).min(1).max(24),
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z.string().trim().max(40).optional().default(''),
  message: z.string().trim().max(500).optional().default(''),
  idempotencyKey: z.uuid(),
})
const dutchPostalCode = z.string().trim().toUpperCase().regex(/^\d{4}\s?[A-Z]{2}$/, 'Vul een geldige Nederlandse postcode in.')
export const checkoutSchema = z.discriminatedUnion('fulfillment', [
  checkoutBase.extend({ fulfillment: z.literal('pickup') }),
  checkoutBase.extend({
    fulfillment: z.literal('shipping'),
    street: z.string().trim().min(2).max(120),
    houseNumber: z.string().trim().min(1).max(12),
    addition: z.string().trim().max(12).optional().default(''),
    postalCode: dutchPostalCode,
    city: z.string().trim().min(2).max(100),
    country: z.literal('NL'),
  }),
])
export type CheckoutInput = z.infer<typeof checkoutSchema>

type CheckoutConfig = { reservationMinutes: number }
export type CheckoutDependencies = {
  findByKey: typeof findByIdempotencyKey
  canResume: typeof canResumePaymentCreation
  reserve: typeof createPurchaseReservation
  getOrderById: typeof getOrder
  createPayment: typeof createMolliePayment
  savePayment: typeof attachPayment
  identity: typeof newOrderIdentity
  itemsFor: typeof trustedItems
  shippingCost: typeof shippingFor
  validatePickup: typeof pickupAllowedFor
}
const checkoutDependencies: CheckoutDependencies = {
  findByKey: findByIdempotencyKey, canResume: canResumePaymentCreation, reserve: createPurchaseReservation,
  getOrderById: getOrder, createPayment: createMolliePayment, savePayment: attachPayment, identity: newOrderIdentity,
  itemsFor: trustedItems, shippingCost: shippingFor, validatePickup: pickupAllowedFor,
}

export const processCheckout = async (input: CheckoutInput, config: CheckoutConfig, dependencies: CheckoutDependencies = checkoutDependencies) => {
  const existing = await dependencies.findByKey(input.idempotencyKey)
  if (existing?.checkout_url) {
    return { created: false, orderId: existing.id, orderNumber: existing.order_number, checkoutUrl: existing.checkout_url, qrCodeUrl: existing.qr_code_url ?? undefined }
  }
  if (existing?.status === 'draft') {
    if (!await dependencies.canResume(existing)) throw new Error('CHECKOUT:De eerdere reservering is verlopen. Vernieuw de pagina en probeer opnieuw.')
    const payment = await dependencies.createPayment(existing)
    await dependencies.savePayment(existing.id, payment.id, payment.checkoutUrl, payment.qrCodeUrl)
    return { created: false, orderId: existing.id, orderNumber: existing.order_number, checkoutUrl: payment.checkoutUrl, qrCodeUrl: payment.qrCodeUrl }
  }

  const items = dependencies.itemsFor(input.productIds)
  const subtotalCents = items.reduce((total, item) => total + item.unitPriceCents, 0)
  const shippingCents = input.fulfillment === 'shipping' ? dependencies.shippingCost(input.productIds) : 0
  if (input.fulfillment === 'pickup') dependencies.validatePickup(input.productIds)
  const { id, orderNumber } = dependencies.identity('SD')
  const customer = {
    name: input.name, email: input.email.toLowerCase(), phone: input.phone || null,
    address: input.fulfillment === 'shipping' ? `${input.street} ${input.houseNumber}${input.addition ? ` ${input.addition}` : ''}` : null,
    postalCode: input.fulfillment === 'shipping' ? input.postalCode.replace(/\s/g, '').replace(/^(\d{4})([A-Z]{2})$/, '$1 $2') : null,
    city: input.fulfillment === 'shipping' ? input.city : null,
    country: input.fulfillment === 'shipping' ? 'NL' : null,
    message: input.message || null,
  }
  const created = await dependencies.reserve({
    id, orderNumber, idempotencyKey: input.idempotencyKey, subtotalCents, shippingCents,
    totalCents: subtotalCents + shippingCents, fulfillment: input.fulfillment, customer, items,
    reservationMinutes: config.reservationMinutes,
  })
  if (!created) {
    const duplicate = await dependencies.findByKey(input.idempotencyKey)
    if (duplicate?.checkout_url) return { created: false, orderId: duplicate.id, orderNumber: duplicate.order_number, checkoutUrl: duplicate.checkout_url, qrCodeUrl: duplicate.qr_code_url ?? undefined }
    throw new Error('CHECKOUT:Deze betaalpoging wordt al verwerkt.')
  }
  const order = await dependencies.getOrderById(id) as StoredOrder
  const payment = await dependencies.createPayment(order)
  await dependencies.savePayment(id, payment.id, payment.checkoutUrl, payment.qrCodeUrl)
  return { created: true, orderId: id, orderNumber, checkoutUrl: payment.checkoutUrl, qrCodeUrl: payment.qrCodeUrl }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!method(request, response, 'POST')) return
  try {
    const config = serverConfig()
    if (!enforceOrigin(request, response, config.baseUrl)) return
    if (!await enforceRateLimit(request, response, 'checkout')) return
    const input = checkoutSchema.parse(request.body)
    const result = await processCheckout(input, config)
    await processPendingEmailsSafely()
    return json(response, result.created ? 201 : 200, result)
  } catch (error) {
    return safeError(response, error)
  }
}
