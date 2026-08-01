import { createMollieClient, type MollieClient, type Payment, type PaymentCreateParams, type PaymentGetParams } from '@mollie/api-client'
import { serverConfig } from './config.js'
import { applyPaymentStatus, getOrderByPayment, type OrderStatus, type StoredOrder } from './store.js'
import { parseEuroAmountToCents } from '../../src/utils/money.js'

let client: MollieClient | null = null
const mollie = () => {
  if (!client) client = createMollieClient({ apiKey: serverConfig().apiKey })
  return client
}

export const createMolliePayment = async (order: Pick<StoredOrder, 'id' | 'order_number' | 'total_cents' | 'kind'>) => {
  const config = serverConfig()
  const parameters: PaymentCreateParams = {
    amount: { currency: 'EUR', value: (order.total_cents / 100).toFixed(2) },
    description: order.kind === 'donation' ? `Donatie ${order.order_number}` : `Bestelling ${order.order_number}`,
    method: 'ideal' as PaymentCreateParams['method'],
    redirectUrl: `${config.baseUrl}/betaling/${order.id}`,
    cancelUrl: `${config.baseUrl}/betaling/${order.id}?geannuleerd=1`,
    webhookUrl: config.webhookUrl,
    metadata: { orderId: order.id, orderNumber: order.order_number, kind: order.kind },
    include: 'details.qrCode' as PaymentCreateParams['include'],
    idempotencyKey: order.id,
  }
  const payment = await (mollie().payments.create(parameters) as Promise<Payment>)
  const details = payment.details as { qrCode?: { src?: string } } | null
  return {
    id: payment.id,
    checkoutUrl: payment.getCheckoutUrl(),
    qrCodeUrl: details?.qrCode?.src,
  }
}

export const mapStatus = (status: string): OrderStatus => {
  if (status === 'paid') return 'paid'
  if (status === 'failed') return 'failed'
  if (status === 'canceled') return 'canceled'
  if (status === 'expired') return 'expired'
  return 'pending'
}

type PaymentSnapshot = {
  status: string
  amount: { value: string }
  amountRefunded?: { value: string } | null
  metadata?: unknown
}

export const synchronizePaymentWith = async (
  paymentId: string,
  dependencies: {
    retrievePayment: (id: string) => Promise<PaymentSnapshot>
    findOrder: typeof getOrderByPayment
    applyStatus: typeof applyPaymentStatus
  },
) => {
  const payment = await dependencies.retrievePayment(paymentId)
  const order = await dependencies.findOrder(paymentId)
  if (!order) throw new Error('Onbekende betaling')
  const metadata = payment.metadata as { orderId?: string } | null
  const amountMatches = parseEuroAmountToCents(payment.amount.value) === order.total_cents
  if (metadata?.orderId !== order.id || !amountMatches) throw new Error('Betalingscontrole mislukt')

  const refundedCents = payment.amountRefunded ? parseEuroAmountToCents(payment.amountRefunded.value) : 0
  if (refundedCents === null) throw new Error('Betalingscontrole mislukt')
  const status = refundedCents >= order.total_cents ? 'refunded' : mapStatus(payment.status)
  return await dependencies.applyStatus(order.id, status)
}

export const synchronizePayment = async (paymentId: string) => synchronizePaymentWith(paymentId, {
  retrievePayment: async (id) => {
    const getParameters: PaymentGetParams = { include: 'details.qrCode' as PaymentGetParams['include'] }
    return await (mollie().payments.get(id, getParameters) as Promise<Payment>)
  },
  findOrder: getOrderByPayment,
  applyStatus: applyPaymentStatus,
})
