import { readdir, readFile } from 'node:fs/promises'
import postgres from 'postgres'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { processEmailOutbox } from './email.js'
import {
  applyPaymentStatus,
  createDonation,
  createPurchaseReservation,
  createWithdrawalRequest,
  markCreationFailed,
} from './store.js'

const enabled = Boolean(process.env.DATABASE_URL && process.env.RUN_DATABASE_INTEGRATION_TESTS === 'true')
if (!enabled) {
  console.warn('OVERGESLAGEN: echte PostgreSQL-integratietests vereisen DATABASE_URL en RUN_DATABASE_INTEGRATION_TESTS=true.')
}

vi.setConfig({ testTimeout: 30_000, hookTimeout: 60_000 })
const suite = enabled ? describe.sequential : describe.skip

suite('echte PostgreSQL-database-, voorraad- en concurrencylogica', () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 6, prepare: false })
  const migrationSql = postgres(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!, { max: 1, prepare: false })
  const productIds = [9_900_026, 9_900_027, 9_900_028, 9_900_029, 9_900_030]
  const orderIds = [
    '00000000-0000-4000-8000-000000000261',
    '00000000-0000-4000-8000-000000000262',
    '00000000-0000-4000-8000-000000000263',
    '00000000-0000-4000-8000-000000000264',
    '00000000-0000-4000-8000-000000000265',
    '00000000-0000-4000-8000-000000000266',
    '00000000-0000-4000-8000-000000000267',
    '00000000-0000-4000-8000-000000000268',
    '00000000-0000-4000-8000-000000000272',
  ]
  const withdrawalId = '00000000-0000-4000-8000-000000000269'

  const runMigrations = async () => {
    const directory = new URL('../../database/', import.meta.url)
    const files = (await readdir(directory)).filter((file) => /^\d+_.+\.sql$/.test(file)).sort()
    for (const file of files) await migrationSql.unsafe(await readFile(new URL(file, directory), 'utf8'))
    return files
  }

  const cleanup = async () => {
    await sql`delete from withdrawal_requests where order_id in ${sql(orderIds)}`
    await sql`delete from product_inventory where product_id in ${sql(productIds)}`
    await sql`delete from orders where id in ${sql(orderIds)}`
    await sql`delete from rate_limits where key like 'test-database-%'`
  }

  const reserve = (index: number, productId = productIds[0], overrides: Partial<{
    idempotencyKey: string
    orderNumber: string
  }> = {}) => createPurchaseReservation({
    id: orderIds[index],
    orderNumber: overrides.orderNumber ?? `TEST-CONCURRENCY-${index}`,
    idempotencyKey: overrides.idempotencyKey ?? `test-concurrency-${index}`,
    subtotalCents: 100,
    shippingCents: 0,
    totalCents: 100,
    fulfillment: 'pickup',
    customer: {
      name: 'Database Test', email: 'database-test@example.nl', phone: null, address: null,
      postalCode: null, city: null, country: null, message: null,
    },
    items: [{ productId, title: 'Concurrency-testwerk', unitPriceCents: 100, stock: 1 }],
    reservationMinutes: 15,
  })

  beforeAll(async () => {
    expect(await runMigrations()).toEqual(['001_mollie_checkout.sql', '002_withdrawals.sql', '003_fulfillment.sql'])
    expect(await runMigrations()).toEqual(['001_mollie_checkout.sql', '002_withdrawals.sql', '003_fulfillment.sql'])
    await cleanup()
  })

  afterAll(async () => {
    await cleanup()
    await migrationSql.end()
    await sql.end()
  })

  it('heeft beide migraties en alle vereiste tabellen, statussen en unieke sleutels', async () => {
    const migrations = await sql<{ version: string }[]>`select version from schema_migrations order by version`
    expect(migrations.map((row) => row.version)).toEqual(expect.arrayContaining(['001_mollie_checkout', '002_withdrawals', '003_fulfillment']))

    const requiredTables = [
      'orders', 'order_items', 'product_inventory', 'order_audit_log', 'inventory_audit_log',
      'email_outbox', 'rate_limits', 'withdrawal_requests',
    ]
    const tables = await sql<{ table_name: string }[]>`
      select table_name from information_schema.tables
      where table_schema = 'public' and table_name in ${sql(requiredTables)}
    `
    expect(tables.map((row) => row.table_name).sort()).toEqual(requiredTables.sort())

    const constraints = await sql<{ table_name: string; definition: string }[]>`
      select c.conrelid::regclass::text as table_name, pg_get_constraintdef(c.oid) as definition
      from pg_constraint c
      where c.conrelid in ('orders'::regclass, 'withdrawal_requests'::regclass)
    `
    expect(constraints.some((row) => row.table_name === 'orders' && row.definition.includes('payment_review'))).toBe(true)
    expect(constraints.some((row) => row.table_name === 'orders' && row.definition.includes('idempotency_key'))).toBe(true)
    expect(constraints.some((row) => row.table_name === 'orders' && row.definition.includes('shipping_cents = 695'))).toBe(true)
    expect(constraints.some((row) => row.table_name === 'withdrawal_requests' && row.definition.includes('idempotency_key'))).toBe(true)
  })

  it('bewaart een Nederlandse verzending met exact 695 cent en volledig adres', async () => {
    const created = await createPurchaseReservation({
      id: orderIds[8], orderNumber: 'TEST-SHIPPING-1', idempotencyKey: 'test-shipping-1',
      subtotalCents: 2000, shippingCents: 695, totalCents: 2695, fulfillment: 'shipping',
      customer: {
        name: 'Database Test', email: 'database-test@example.nl', phone: null, address: 'Dorpsstraat 2 A',
        postalCode: '4053 JV', city: 'IJzendoorn', country: 'NL', message: null,
      },
      items: [{ productId: productIds[4], title: 'Verzendtestwerk', unitPriceCents: 2000, stock: 1 }], reservationMinutes: 15,
    })
    expect(created).toBe(true)
    const [order] = await sql<{ fulfillment: string; shipping_cents: number; total_cents: number; address: string; postal_code: string; city: string; country: string }[]>`
      select fulfillment, shipping_cents, total_cents, address, postal_code, city, country from orders where id = ${orderIds[8]}
    `
    expect(order).toEqual({ fulfillment: 'shipping', shipping_cents: 695, total_cents: 2695, address: 'Dorpsstraat 2 A', postal_code: '4053 JV', city: 'IJzendoorn', country: 'NL' })
    await markCreationFailed(orderIds[8])
  })

  it('laat van twee simultane reserveringen van hetzelfde unieke werk exact één slagen', async () => {
    const results = await Promise.allSettled([reserve(0), reserve(1)])
    expect(results.filter((result) => result.status === 'fulfilled' && result.value === true)).toHaveLength(1)
    const rejection = results.find((result) => result.status === 'rejected')
    expect(rejection?.status === 'rejected' ? String(rejection.reason) : '').toContain('CHECKOUT:')

    const [inventory] = await sql<{ reserved_order_id: string; sold_order_id: string | null }[]>`
      select reserved_order_id, sold_order_id from product_inventory where product_id = ${productIds[0]}
    `
    expect(orderIds.slice(0, 2)).toContain(inventory.reserved_order_id)
    expect(inventory.sold_order_id).toBeNull()
    expect(await sql`select id from orders where id in ${sql(orderIds.slice(0, 2))}`).toHaveLength(1)
    await markCreationFailed(inventory.reserved_order_id)
    const [released] = await sql<{ reserved_order_id: string | null }[]>`
      select reserved_order_id from product_inventory where product_id = ${productIds[0]}
    `
    expect(released.reserved_order_id).toBeNull()
  })

  it('geeft een verlopen reservering vrij en zet een late betaling met voorraadconflict op payment_review', async () => {
    await reserve(2)
    await sql`update product_inventory set reserved_until = now() - interval '1 minute' where product_id = ${productIds[0]}`
    await reserve(3)

    expect(await applyPaymentStatus(orderIds[2], 'paid')).toBe('payment_review')
    expect(await applyPaymentStatus(orderIds[2], 'paid')).toBe('payment_review')
    expect(await applyPaymentStatus(orderIds[2], 'pending')).toBe('payment_review')

    const [lateOrder] = await sql<{ status: string; status_reason: string }[]>`
      select status, status_reason from orders where id = ${orderIds[2]}
    `
    const [inventory] = await sql<{ reserved_order_id: string; sold_order_id: string | null }[]>`
      select reserved_order_id, sold_order_id from product_inventory where product_id = ${productIds[0]}
    `
    expect(lateOrder).toEqual({ status: 'payment_review', status_reason: 'late_paid_inventory_conflict' })
    expect(inventory).toEqual({ reserved_order_id: orderIds[3], sold_order_id: null })
    const reviewEvents = await sql`select id from order_audit_log where order_id = ${orderIds[2]} and event_type = 'payment_review_required'`
    const reviewEmails = await sql`select id from email_outbox where order_id = ${orderIds[2]} and message_type = 'payment_review'`
    expect(reviewEvents).toHaveLength(1)
    expect(reviewEmails).toHaveLength(1)
  })

  it('maakt dubbele donatieverzoeken met dezelfde idempotency-key precies eenmaal aan', async () => {
    const input = {
      id: orderIds[4], orderNumber: 'TEST-DONATION-1', idempotencyKey: 'test-donation-idempotency',
      amountCents: 500, name: 'Database Test', email: 'database-test@example.nl', anonymous: false, message: null,
    }
    const results = await Promise.all([
      createDonation(input),
      createDonation(input),
    ])
    expect(results.filter(Boolean)).toHaveLength(1)
    expect(await sql`select id from orders where idempotency_key = ${input.idempotencyKey}`).toHaveLength(1)
    expect(await sql`select id from order_audit_log where order_id in ${sql(orderIds.slice(4, 6))} and event_type = 'order_created'`).toHaveLength(1)
  })

  it('maakt een dubbel aankoopverzoek met dezelfde idempotency-key niet opnieuw aan', async () => {
    expect(await reserve(5, productIds[2], { idempotencyKey: 'test-purchase-idempotency', orderNumber: 'TEST-IDEMPOTENT-PURCHASE' })).toBe(true)
    expect(await reserve(5, productIds[2], { idempotencyKey: 'test-purchase-idempotency', orderNumber: 'TEST-IDEMPOTENT-PURCHASE' })).toBe(false)
    expect(await sql`select id from orders where idempotency_key = 'test-purchase-idempotency'`).toHaveLength(1)
    await markCreationFailed(orderIds[5])
  })

  it('houdt dubbele en vertraagde betaalstatussen idempotent en terminal', async () => {
    const donationId = orderIds[4]
    expect(await applyPaymentStatus(donationId, 'paid')).toBe('paid')
    expect(await applyPaymentStatus(donationId, 'paid')).toBe('paid')
    expect(await applyPaymentStatus(donationId, 'pending')).toBe('paid')
    expect(await sql`select id from order_audit_log where order_id = ${donationId} and to_status = 'paid'`).toHaveLength(1)
    expect(await sql`select id from email_outbox where order_id = ${donationId} and message_type = 'donation_confirmed'`).toHaveLength(1)
  })

  it('blokkeert reservering van een reeds verkocht uniek werk', async () => {
    await reserve(6, productIds[1])
    expect(await applyPaymentStatus(orderIds[6], 'paid')).toBe('paid')
    await expect(reserve(7, productIds[1])).rejects.toThrow('heeft al een thuis gevonden')
    const [inventory] = await sql<{ sold_order_id: string }[]>`
      select sold_order_id from product_inventory where product_id = ${productIds[1]}
    `
    expect(inventory.sold_order_id).toBe(orderIds[6])
  })

  it('houdt een tweede exemplaar beschikbaar na de eerste verkoop', async () => {
    const productId = productIds[3]
    const first = createPurchaseReservation({
      id: orderIds[7], orderNumber: 'TEST-STOCK-2-A', idempotencyKey: 'test-stock-2-a',
      subtotalCents: 100, shippingCents: 0, totalCents: 100, fulfillment: 'pickup',
      customer: { name: 'Database Test', email: 'database-test@example.nl', phone: null, address: null, postalCode: null, city: null, country: null, message: null },
      items: [{ productId, title: 'Werk met twee exemplaren', unitPriceCents: 100, stock: 2 }], reservationMinutes: 15,
    })
    expect(await first).toBe(true)
    expect(await applyPaymentStatus(orderIds[7], 'paid')).toBe('paid')
    const [afterFirst] = await sql<{ stock: number; sold_at: Date | null }[]>`select stock, sold_at from product_inventory where product_id = ${productId}`
    expect(afterFirst).toEqual({ stock: 1, sold_at: null })
  })

  it('maakt een herroepingsverzoek idempotent aan en verwerkt de bevestiging via de outbox', async () => {
    const input = {
      id: withdrawalId,
      requestNumber: 'HER-TEST-0001',
      idempotencyKey: '00000000-0000-4000-8000-000000000270',
      orderNumber: 'TEST-CONCURRENCY-6',
      email: 'database-test@example.nl',
      scope: 'full' as const,
      itemDescription: null,
    }
    const first = await createWithdrawalRequest(input)
    const duplicate = await createWithdrawalRequest({ ...input, id: '00000000-0000-4000-8000-000000000271', requestNumber: 'HER-TEST-DUPLICATE' })
    expect(duplicate.request_number).toBe(first.request_number)
    expect(await sql`select id from withdrawal_requests where idempotency_key = ${input.idempotencyKey}`).toHaveLength(1)
    expect(await sql`select id from order_audit_log where order_id = ${orderIds[6]} and event_type = 'withdrawal_received'`).toHaveLength(1)

    const [queued] = await sql<{ id: number; order_id: string; message_type: 'withdrawal_received'; recipient_email: string; payload: Record<string, unknown> }[]>`
      select id, order_id, message_type, recipient_email, payload from email_outbox
      where order_id = ${orderIds[6]} and message_type = 'withdrawal_received'
    `
    const sent: string[] = []
    await processEmailOutbox({ send: async (message) => { sent.push(message.type) } }, {
      pending: async () => [{ outboxId: queued.id, orderId: queued.order_id, type: queued.message_type, recipient: queued.recipient_email, payload: queued.payload }],
      sent: async (outboxId) => { await sql`update email_outbox set status = 'sent', attempts = 1 where id = ${outboxId}` },
      failed: async () => undefined,
    }, 1)
    expect(sent).toContain('withdrawal_received')
    const [outbox] = await sql<{ status: string }[]>`
      select status from email_outbox where order_id = ${orderIds[6]} and message_type = 'withdrawal_received'
    `
    expect(outbox.status).toBe('sent')
  })
})
