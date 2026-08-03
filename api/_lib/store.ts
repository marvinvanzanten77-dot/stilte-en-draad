import postgres from 'postgres'
import { rateLimitAllowed } from './security.js'
import type { EmailMessage, EmailMessageType, EmailOutboxRepository } from './email.js'

export type OrderStatus = 'draft' | 'pending' | 'paid' | 'failed' | 'canceled' | 'expired' | 'refunded' | 'payment_review'
export type StoredOrder = {
  id: string
  order_number: string
  kind: 'purchase' | 'donation'
  status: OrderStatus
  total_cents: number
  subtotal_cents: number
  shipping_cents: number
  fulfillment: 'shipping' | 'pickup' | 'none'
  customer_name: string | null
  customer_email: string | null
  address: string | null
  postal_code: string | null
  city: string | null
  country: string | null
  anonymous: boolean
  mollie_payment_id: string | null
  checkout_url: string | null
  qr_code_url: string | null
  items: Array<{ productId: number; title: string; unitPriceCents: number; stock?: number }>
}

let client: ReturnType<typeof postgres> | null = null
const db = () => {
  if (!client) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('Serverconfiguratie ontbreekt: DATABASE_URL')
    client = postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 10, prepare: false })
  }
  return client
}

export const hasInventoryConflict = (
  inventory: Array<{ reserved_order_id: string | null; reserved_until: Date | null; sold_order_id: string | null }>,
  orderId: string,
  now = new Date(),
) => inventory.some((item) =>
  (item.sold_order_id !== null && item.sold_order_id !== orderId) ||
  (item.reserved_order_id !== null && item.reserved_order_id !== orderId && item.reserved_until !== null && item.reserved_until > now)
)

export const keepTerminalStatus = (current: OrderStatus, incoming: OrderStatus) =>
  (current === 'refunded') ||
  (current === 'paid' && incoming !== 'refunded') ||
  (current === 'payment_review' && incoming !== 'refunded') ||
  (['failed', 'canceled', 'expired'].includes(current) && incoming === 'pending')

export const rateLimit = async (key: string, limit: number, seconds: number) => {
  const sql = db()
  const [row] = await sql<{ count: number }[]>`
    insert into rate_limits (key, window_started_at, count)
    values (${key}, now(), 1)
    on conflict (key) do update set
      count = case when rate_limits.window_started_at < now() - (${seconds} * interval '1 second') then 1 else rate_limits.count + 1 end,
      window_started_at = case when rate_limits.window_started_at < now() - (${seconds} * interval '1 second') then now() else rate_limits.window_started_at end
    returning count
  `
  return rateLimitAllowed(row.count, limit)
}

export const findByIdempotencyKey = async (key: string) => {
  const [order] = await db()<StoredOrder[]>`
    select o.*, coalesce(json_agg(json_build_object('productId', oi.product_id, 'title', oi.title, 'unitPriceCents', oi.unit_price_cents))
      filter (where oi.id is not null), '[]') as items
    from orders o left join order_items oi on oi.order_id = o.id
    where o.idempotency_key = ${key} group by o.id
  `
  return order
}

export const createPurchaseReservation = async (input: {
  id: string
  orderNumber: string
  idempotencyKey: string
  subtotalCents: number
  shippingCents: number
  totalCents: number
  fulfillment: 'shipping' | 'pickup'
  customer: Record<string, string | null>
  items: Array<{ productId: number; title: string; unitPriceCents: number; stock: number }>
  reservationMinutes: number
}) => db().begin(async (sql) => {
  const existing = await sql<{ id: string }[]>`select id from orders where idempotency_key = ${input.idempotencyKey}`
  if (existing.length) return false

  for (const item of input.items) {
    await sql`insert into product_inventory (product_id, stock) values (${item.productId}, ${item.stock ?? 1}) on conflict (product_id) do nothing`
    const [inventory] = await sql<{ stock: number; sold_at: Date | null; reserved_order_id: string | null; reserved_until: Date | null }[]>`
      select stock, sold_at, reserved_order_id, reserved_until from product_inventory where product_id = ${item.productId} for update
    `
    if (inventory.stock < 1 || inventory.sold_at) throw new Error(`CHECKOUT:${item.title} heeft al een thuis gevonden.`)
    if (inventory.reserved_order_id && inventory.reserved_until && inventory.reserved_until > new Date()) {
      throw new Error(`CHECKOUT:${item.title} wordt tijdelijk voor iemand anders bewaard.`)
    }
  }

  await sql`
    insert into orders (
      id, order_number, idempotency_key, kind, status, subtotal_cents, shipping_cents, total_cents, fulfillment,
      customer_name, customer_email, customer_phone, address, postal_code, city, country, message
    ) values (
      ${input.id}, ${input.orderNumber}, ${input.idempotencyKey}, 'purchase', 'draft', ${input.subtotalCents},
      ${input.shippingCents}, ${input.totalCents}, ${input.fulfillment}, ${input.customer.name}, ${input.customer.email},
      ${input.customer.phone}, ${input.customer.address}, ${input.customer.postalCode}, ${input.customer.city},
      ${input.customer.country}, ${input.customer.message}
    )
  `
  for (const item of input.items) {
    await sql`insert into order_items (order_id, product_id, title, unit_price_cents, quantity) values (${input.id}, ${item.productId}, ${item.title}, ${item.unitPriceCents}, 1)`
    await sql`
      update product_inventory set reserved_order_id = ${input.id},
        reserved_until = now() + (${input.reservationMinutes} * interval '1 minute')
      where product_id = ${item.productId} and sold_order_id is null
    `
    await sql`insert into inventory_audit_log (product_id, order_id, event_type, reason) values (${item.productId}, ${input.id}, 'reserved', 'checkout_started')`
  }
  await sql`insert into order_audit_log (order_id, event_type, to_status, reason) values (${input.id}, 'order_created', 'draft', 'purchase_reservation_created')`
  return true
})

export const createDonation = async (input: {
  id: string
  orderNumber: string
  idempotencyKey: string
  amountCents: number
  name: string | null
  email: string | null
  anonymous: boolean
  message: string | null
}) => {
  const inserted = await db()<Array<{ id: string }>>`
    insert into orders (
      id, order_number, idempotency_key, kind, status, subtotal_cents, shipping_cents, total_cents,
      fulfillment, customer_name, customer_email, anonymous, message
    ) values (
      ${input.id}, ${input.orderNumber}, ${input.idempotencyKey}, 'donation', 'draft', ${input.amountCents}, 0,
      ${input.amountCents}, 'none', ${input.name}, ${input.email}, ${input.anonymous}, ${input.message}
    ) on conflict (idempotency_key) do nothing returning id
  `
  if (inserted.length) {
    await db()`insert into order_audit_log (order_id, event_type, to_status, reason) values (${input.id}, 'order_created', 'draft', 'donation_started')`
  }
  return inserted.length > 0
}

export const attachPayment = async (orderId: string, paymentId: string, checkoutUrl: string, qrCodeUrl?: string) => {
  await db().begin(async (sql) => {
    const updated = await sql<Array<Pick<StoredOrder, 'customer_email' | 'kind' | 'fulfillment' | 'shipping_cents' | 'address' | 'postal_code' | 'city' | 'country'>>>`
      update orders set status = 'pending', mollie_payment_id = ${paymentId}, checkout_url = ${checkoutUrl},
        qr_code_url = ${qrCodeUrl ?? null}, updated_at = now()
      where id = ${orderId} and status = 'draft'
      returning customer_email, kind, fulfillment, shipping_cents, address, postal_code, city, country
    `
    if (!updated.length) return
    await sql`insert into order_audit_log (order_id, event_type, from_status, to_status, reason) values (${orderId}, 'payment_created', 'draft', 'pending', 'mollie_payment_attached')`
    if (updated[0].kind === 'purchase' && updated[0].customer_email) {
      await sql`insert into email_outbox (order_id, message_type, recipient_email, payload)
        values (${orderId}, 'order_received', ${updated[0].customer_email}, ${sql.json({ orderId, fulfillment: updated[0].fulfillment, shippingCents: updated[0].shipping_cents, address: updated[0].address, postalCode: updated[0].postal_code, city: updated[0].city, country: updated[0].country })})
        on conflict (order_id, message_type) do nothing`
    }
  })
}

export const markCreationFailed = async (orderId: string) => {
  await db().begin(async (sql) => {
    await sql`update orders set status = 'failed', updated_at = now() where id = ${orderId} and status = 'draft'`
    const released = await sql<{ product_id: number }[]>`select product_id from product_inventory where reserved_order_id = ${orderId} for update`
    await sql`update product_inventory set reserved_order_id = null, reserved_until = null where reserved_order_id = ${orderId}`
    for (const item of released) await sql`insert into inventory_audit_log (product_id, order_id, event_type, reason) values (${item.product_id}, ${orderId}, 'released', 'payment_creation_failed')`
    await sql`insert into order_audit_log (order_id, event_type, from_status, to_status, reason) values (${orderId}, 'status_changed', 'draft', 'failed', 'payment_creation_failed')`
  })
}

export const getOrder = async (orderId: string) => {
  const [order] = await db()<StoredOrder[]>`
    select o.*, coalesce(json_agg(json_build_object('productId', oi.product_id, 'title', oi.title, 'unitPriceCents', oi.unit_price_cents))
      filter (where oi.id is not null), '[]') as items
    from orders o left join order_items oi on oi.order_id = o.id
    where o.id = ${orderId} group by o.id
  `
  return order
}

export const getOrderByPayment = async (paymentId: string) => {
  const [order] = await db()<StoredOrder[]>`select * from orders where mollie_payment_id = ${paymentId}`
  return order
}

export const createWithdrawalRequest = async (input: {
  id: string
  requestNumber: string
  idempotencyKey: string
  orderNumber: string
  email: string
  scope: 'full' | 'partial'
  itemDescription: string | null
}) => db().begin(async (sql) => {
  const existing = await sql<Array<{ request_number: string; received_at: Date }>>`
    select request_number, received_at from withdrawal_requests where idempotency_key = ${input.idempotencyKey}
  `
  if (existing.length) return existing[0]

  const [order] = await sql<Array<{ id: string; customer_email: string | null; fulfillment: 'pickup' | 'shipping'; shipping_cents: number; address: string | null; postal_code: string | null; city: string | null; country: string | null }>>`
    select id, customer_email, fulfillment, shipping_cents, address, postal_code, city, country from orders
    where upper(order_number) = upper(${input.orderNumber})
      and lower(customer_email) = lower(${input.email})
      and kind = 'purchase'
      and status in ('paid', 'payment_review')
    for update
  `
  if (!order?.customer_email) {
    throw new Error('WITHDRAWAL:We konden deze betaalde bestelling niet met de ingevulde gegevens verbinden. Controleer het bestelnummer en e-mailadres.')
  }

  const [request] = await sql<Array<{ request_number: string; received_at: Date }>>`
    insert into withdrawal_requests (
      id, request_number, idempotency_key, order_id, customer_email, scope, item_description
    ) values (
      ${input.id}, ${input.requestNumber}, ${input.idempotencyKey}, ${order.id}, ${order.customer_email},
      ${input.scope}, ${input.itemDescription}
    )
    returning request_number, received_at
  `
  await sql`
    insert into order_audit_log (order_id, event_type, reason, actor, details)
    values (
      ${order.id}, 'withdrawal_received', 'customer_withdrawal_submitted', 'customer',
      ${sql.json({ requestNumber: input.requestNumber, scope: input.scope })}
    )
  `
  await sql`
    insert into email_outbox (order_id, message_type, recipient_email, payload)
    values (
      ${order.id}, 'withdrawal_received', ${order.customer_email},
      ${sql.json({ requestNumber: input.requestNumber, scope: input.scope, receivedAt: request.received_at.toISOString(), fulfillment: order.fulfillment, shippingCents: order.shipping_cents, address: order.address, postalCode: order.postal_code, city: order.city, country: order.country })}
    )
    on conflict (order_id, message_type) do update set
      payload = excluded.payload,
      status = 'pending',
      next_attempt_at = now(),
      updated_at = now()
  `
  return request
})

export const canResumePaymentCreation = async (order: StoredOrder) => {
  if (order.kind === 'donation') return order.status === 'draft'
  if (order.status !== 'draft') return false
  const [result] = await db()<Array<{ valid: boolean }>>`
    select bool_and(pi.stock > 0 and pi.reserved_order_id = ${order.id} and pi.reserved_until > now() and pi.sold_order_id is null) as valid
    from order_items oi join product_inventory pi on pi.product_id = oi.product_id
    where oi.order_id = ${order.id}
  `
  return result?.valid === true
}

export const applyPaymentStatus = async (orderId: string, status: OrderStatus) => db().begin(async (sql) => {
  const [order] = await sql<Array<Pick<StoredOrder, 'status' | 'kind' | 'customer_email' | 'fulfillment' | 'shipping_cents' | 'address' | 'postal_code' | 'city' | 'country'>>>`select status, kind, customer_email, fulfillment, shipping_cents, address, postal_code, city, country from orders where id = ${orderId} for update`
  if (!order) return null
  if (keepTerminalStatus(order.status, status)) return order.status

  if (order.kind === 'purchase' && status === 'paid') {
    const items = await sql<{ product_id: number }[]>`select product_id from order_items where order_id = ${orderId} order by product_id`
    for (const item of items) {
      await sql`insert into product_inventory (product_id, stock) values (${item.product_id}, 1) on conflict (product_id) do nothing`
    }
    const inventory = await sql<{ product_id: number; stock: number; reserved_order_id: string | null; reserved_until: Date | null; sold_order_id: string | null }[]>`
      select product_id, stock, reserved_order_id, reserved_until, sold_order_id
      from product_inventory where product_id in ${sql(items.map((item) => item.product_id))}
      order by product_id for update
    `
    const conflict = hasInventoryConflict(inventory, orderId)
    if (conflict) {
      await sql`update orders set status = 'payment_review', status_reason = 'late_paid_inventory_conflict', payment_status_checked_at = now(), updated_at = now() where id = ${orderId}`
      for (const item of inventory) await sql`insert into inventory_audit_log (product_id, order_id, event_type, reason) values (${item.product_id}, ${orderId}, 'payment_conflict', 'late_paid_inventory_conflict')`
      await sql`insert into order_audit_log (order_id, event_type, from_status, to_status, reason) values (${orderId}, 'payment_review_required', ${order.status}, 'payment_review', 'late_paid_inventory_conflict')`
      if (order.customer_email) await sql`insert into email_outbox (order_id, message_type, recipient_email, payload)
        values (${orderId}, 'payment_review', ${order.customer_email}, ${sql.json({ orderId })})
        on conflict (order_id, message_type) do nothing`
      return 'payment_review' as OrderStatus
    }
    await sql`
      update product_inventory set
        stock = stock - 1,
        sold_order_id = case when stock - 1 = 0 then ${orderId}::uuid else null end,
        sold_at = case when stock - 1 = 0 then now() else null end,
        reserved_order_id = null,
        reserved_until = null
      where product_id in ${sql(items.map((item) => item.product_id))} and stock > 0
    `
    for (const item of items) await sql`insert into inventory_audit_log (product_id, order_id, event_type, reason) values (${item.product_id}, ${orderId}, 'sold', 'verified_paid_payment')`
    await sql`update orders set status = 'paid', status_reason = null, payment_status_checked_at = now(), updated_at = now() where id = ${orderId}`
    await sql`insert into order_audit_log (order_id, event_type, from_status, to_status, reason) values (${orderId}, 'status_changed', ${order.status}, 'paid', 'verified_paid_payment')`
    if (order.customer_email) await sql`insert into email_outbox (order_id, message_type, recipient_email, payload)
      values (${orderId}, 'payment_succeeded', ${order.customer_email}, ${sql.json({ orderId, fulfillment: order.fulfillment, shippingCents: order.shipping_cents, address: order.address, postalCode: order.postal_code, city: order.city, country: order.country })})
      on conflict (order_id, message_type) do nothing`
    return 'paid' as OrderStatus
  }

  await sql`update orders set status = ${status}, status_reason = null, payment_status_checked_at = now(), updated_at = now() where id = ${orderId}`
  await sql`insert into order_audit_log (order_id, event_type, from_status, to_status, reason) values (${orderId}, 'status_changed', ${order.status}, ${status}, 'mollie_status_verified')`
  if (order.kind === 'purchase' && ['failed', 'canceled', 'expired'].includes(status)) {
    const released = await sql<{ product_id: number }[]>`select product_id from product_inventory where reserved_order_id = ${orderId} and sold_at is null for update`
    await sql`update product_inventory set reserved_order_id = null, reserved_until = null where reserved_order_id = ${orderId} and sold_at is null`
    for (const item of released) await sql`insert into inventory_audit_log (product_id, order_id, event_type, reason) values (${item.product_id}, ${orderId}, 'released', ${`payment_${status}`})`
  }
  const messageType = order.kind === 'donation' && status === 'paid'
    ? 'donation_confirmed'
    : ['failed', 'canceled', 'expired'].includes(status) ? 'payment_failed_or_canceled'
      : status === 'paid' ? 'payment_succeeded' : null
  if (messageType && order.customer_email) await sql`insert into email_outbox (order_id, message_type, recipient_email, payload)
    values (${orderId}, ${messageType}, ${order.customer_email}, ${sql.json({ orderId })})
    on conflict (order_id, message_type) do nothing`
  return status
})

export const getProductAvailability = async (productIds: number[]) => {
  const sql = db()
  await sql.begin(async (transaction) => {
    const expired = await transaction<{ product_id: number; reserved_order_id: string }[]>`
      select product_id, reserved_order_id from product_inventory
      where sold_at is null and reserved_until <= now() for update
    `
    await transaction`update product_inventory set reserved_order_id = null, reserved_until = null where sold_at is null and reserved_until <= now()`
    for (const item of expired) await transaction`insert into inventory_audit_log (product_id, order_id, event_type, reason) values (${item.product_id}, ${item.reserved_order_id}, 'released', 'reservation_expired')`
  })
  const rows = await sql<{ product_id: number; stock: number; sold_at: Date | null; reserved_until: Date | null }[]>`
    select product_id, stock, sold_at, reserved_until from product_inventory where product_id in ${sql(productIds)}
  `
  return Object.fromEntries(productIds.map((id) => {
    const row = rows.find((candidate) => candidate.product_id === id)
    const status = (row && row.stock < 1) || row?.sold_at ? 'sold' : row?.reserved_until && row.reserved_until > new Date() ? 'reserved' : 'available'
    return [id, status]
  }))
}

export const claimPendingEmails = async (limit: number): Promise<EmailMessage[]> => db().begin(async (sql) => {
  const rows = await sql<Array<{
    id: number
    order_id: string
    message_type: EmailMessageType
    recipient_email: string
    payload: Record<string, unknown>
  }>>`
    with candidates as (
      select id from email_outbox
      where status in ('pending', 'failed') and next_attempt_at <= now()
      order by next_attempt_at, id
      for update skip locked
      limit ${limit}
    )
    update email_outbox e set status = 'processing', attempts = attempts + 1, updated_at = now()
    from candidates where e.id = candidates.id
    returning e.id, e.order_id, e.message_type, e.recipient_email, e.payload
  `
  return rows.map((row) => ({
    outboxId: row.id,
    orderId: row.order_id,
    type: row.message_type,
    recipient: row.recipient_email,
    payload: row.payload,
  }))
})

export const markEmailSent = async (outboxId: number) => {
  await db()`update email_outbox set status = 'sent', last_error_code = null, updated_at = now() where id = ${outboxId} and status = 'processing'`
}

export const markEmailFailed = async (outboxId: number, retryAt: Date, errorCode: string) => {
  await db()`update email_outbox set status = 'failed', next_attempt_at = ${retryAt}, last_error_code = ${errorCode}, updated_at = now() where id = ${outboxId} and status = 'processing'`
}

export const emailOutboxRepository: EmailOutboxRepository = {
  pending: claimPendingEmails,
  sent: markEmailSent,
  failed: markEmailFailed,
}
