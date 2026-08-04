import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { donationConfig } from '../_lib/config.js'
import { enforceOrigin, enforceRateLimit, json, method, safeError } from '../_lib/http.js'
import { createMolliePayment } from '../_lib/mollie.js'
import { newOrderIdentity } from '../_lib/orders.js'
import { attachPayment, canResumePaymentCreation, createDonation, findByIdempotencyKey, getOrder } from '../_lib/store.js'
import type { StoredOrder } from '../_lib/store.js'
import { processPendingEmailsSafely } from '../_lib/email-dispatch.js'

export const donationSchema = z.object({
  amountCents: z.number().int().positive(),
  name: z.string().trim().max(120).optional().default(''),
  email: z.union([z.email().max(254), z.literal('')]).optional().default(''),
  anonymous: z.boolean().default(false),
  message: z.string().trim().max(500).optional().default(''),
  confirmedAmountCents: z.number().int().positive().optional(),
  idempotencyKey: z.uuid(),
}).superRefine((data, context) => {
  if (!data.anonymous && !data.name) context.addIssue({ code: 'custom', path: ['name'], message: 'Vul je naam in of kies anoniem.' })
  if (!data.email) context.addIssue({ code: 'custom', path: ['email'], message: 'Een e-mailadres is nodig voor de bevestiging.' })
})
export type DonationInput = z.infer<typeof donationSchema>

type DonationConfig = { confirmationThresholdCents: number }
export type DonationDependencies = {
  findByKey: typeof findByIdempotencyKey
  canResume: typeof canResumePaymentCreation
  createOrder: typeof createDonation
  getOrderById: typeof getOrder
  createPayment: typeof createMolliePayment
  savePayment: typeof attachPayment
  identity: typeof newOrderIdentity
}
const donationDependencies: DonationDependencies = {
  findByKey: findByIdempotencyKey, canResume: canResumePaymentCreation, createOrder: createDonation,
  getOrderById: getOrder, createPayment: createMolliePayment, savePayment: attachPayment, identity: newOrderIdentity,
}

export const processDonation = async (input: DonationInput, config: DonationConfig, dependencies: DonationDependencies = donationDependencies) => {
  if (input.amountCents >= config.confirmationThresholdCents && input.confirmedAmountCents !== input.amountCents) {
    throw new Error('DONATION_CONFIRMATION_REQUIRED')
  }
  const existing = await dependencies.findByKey(input.idempotencyKey)
  if (existing?.checkout_url) return { created: false, orderId: existing.id, orderNumber: existing.order_number, checkoutUrl: existing.checkout_url, qrCodeUrl: existing.qr_code_url ?? undefined }
  if (existing?.status === 'draft') {
    if (!await dependencies.canResume(existing)) throw new Error('CHECKOUT:Deze eerdere donatiepoging kan niet worden hervat.')
    const payment = await dependencies.createPayment(existing)
    await dependencies.savePayment(existing.id, payment.id, payment.checkoutUrl, payment.qrCodeUrl)
    return { created: false, orderId: existing.id, orderNumber: existing.order_number, checkoutUrl: payment.checkoutUrl, qrCodeUrl: payment.qrCodeUrl }
  }
  const { id, orderNumber } = dependencies.identity('DON')
  const created = await dependencies.createOrder({
    id, orderNumber, idempotencyKey: input.idempotencyKey, amountCents: input.amountCents,
    name: input.anonymous ? null : input.name, email: input.email.toLowerCase(), anonymous: input.anonymous,
    message: input.message || null,
  })
  if (!created) {
    const duplicate = await dependencies.findByKey(input.idempotencyKey)
    if (duplicate?.checkout_url) return { created: false, orderId: duplicate.id, orderNumber: duplicate.order_number, checkoutUrl: duplicate.checkout_url, qrCodeUrl: duplicate.qr_code_url ?? undefined }
    throw new Error('CHECKOUT:Deze donatie wordt al verwerkt.')
  }
  const order = await dependencies.getOrderById(id) as StoredOrder
  const payment = await dependencies.createPayment(order)
  await dependencies.savePayment(id, payment.id, payment.checkoutUrl, payment.qrCodeUrl)
  return { created: true, orderId: id, orderNumber, checkoutUrl: payment.checkoutUrl, qrCodeUrl: payment.qrCodeUrl }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!method(request, response, 'POST')) return
  try {
    const config = donationConfig()
    if (!enforceOrigin(request, response, config.baseUrl)) return
    if (!await enforceRateLimit(request, response, 'donation')) return
    const input = donationSchema.parse(request.body)
    let result
    try {
      result = await processDonation(input, config)
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message === 'DONATION_CONFIRMATION_REQUIRED') {
        return json(response, 400, { error: 'Bevestig het exacte donatiebedrag voordat je verdergaat.' })
      }
      throw error
    }
    await processPendingEmailsSafely()
    return json(response, result.created ? 201 : 200, result)
  } catch (error) {
    return safeError(response, error)
  }
}
