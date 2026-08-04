import { afterEach, describe, expect, it, vi } from 'vitest'
import { configurationState, donationConfigurationState } from './config.js'
import { mapStatus, synchronizePaymentWith } from './mollie.js'
import { catalogItem, SHIPPING_COST_CENTS, shippingFor, trustedItems } from './orders.js'
import { hasInventoryConflict, keepTerminalStatus, type StoredOrder } from './store.js'
import { checkoutSchema, processCheckout, type CheckoutDependencies } from '../checkout/create.js'
import { donationSchema, processDonation, type DonationDependencies } from '../donations/create.js'
import { paymentId } from '../mollie/webhook.js'
import { isAllowedOrigin, rateLimitAllowed } from './security.js'

const originalEnvironment = { ...process.env }
afterEach(() => {
  process.env = { ...originalEnvironment }
})

describe('betrouwbare productbron en productgereedheid', () => {
  it('haalt de prijs uitsluitend uit de servercatalogus', () => {
    expect(catalogItem(1)?.price).toBe(49)
  })

  it('weigert een onbekend product', () => {
    expect(() => trustedItems([9999])).toThrow('bestaat niet')
  })

  it('weigert hetzelfde unieke werk tweemaal', () => {
    expect(() => trustedItems([1, 1])).toThrow('maar eenmaal')
  })

  it('houdt een incompleet tentoonstellingswerk uit de checkout', () => {
    expect(() => trustedItems([11])).toThrow('Ontbreekt: afmetingen')
  })

  it('rekent verzending eenmaal per volledige bestelling', () => {
    expect(shippingFor([2])).toBe(SHIPPING_COST_CENTS)
    expect(shippingFor([2, 3])).toBe(SHIPPING_COST_CENTS)
  })
})

describe('invoervalidatie', () => {
  it('weigert een clientprijs of client-verzendbedrag in het checkoutcontract', () => {
    expect(() => checkoutSchema.parse({
      productIds: [1], fulfillment: 'pickup', name: 'Test Persoon', email: 'test@example.nl',
      idempotencyKey: '13ad03c7-8f80-4bbc-8d35-89da69781913', price: 1, shippingCents: 0,
    })).toThrow()
  })

  it('weigert verzending zonder volledig Nederlands adres', () => {
    expect(() => checkoutSchema.parse({
      productIds: [2], fulfillment: 'shipping', name: 'Test Persoon', email: 'test@example.nl',
      country: 'NL', idempotencyKey: crypto.randomUUID(),
    })).toThrow()
  })

  it('accepteert afhalen zonder bezorgadres en verzending alleen naar Nederland', () => {
    expect(checkoutSchema.parse({
      productIds: [2], fulfillment: 'pickup', name: 'Test Persoon', email: 'test@example.nl',
      idempotencyKey: crypto.randomUUID(),
    }).fulfillment).toBe('pickup')
    expect(checkoutSchema.parse({
      productIds: [2], fulfillment: 'shipping', name: 'Test Persoon', email: 'test@example.nl',
      street: 'Dorpsstraat', houseNumber: '2', postalCode: '4053JV', city: 'IJzendoorn', country: 'NL',
      idempotencyKey: crypto.randomUUID(),
    }).fulfillment).toBe('shipping')
    expect(() => checkoutSchema.parse({
      productIds: [2], fulfillment: 'shipping', name: 'Test Persoon', email: 'test@example.nl',
      street: 'Rue Exemple', houseNumber: '2', postalCode: '75001', city: 'Paris', country: 'FR',
      idempotencyKey: crypto.randomUUID(),
    })).toThrow()
  })

  it('vereist e-mail en identiteit of anoniem bij donaties', () => {
    expect(() => donationSchema.parse({ amountCents: 500, name: '', email: '', anonymous: false, idempotencyKey: crypto.randomUUID() })).toThrow()
    expect(donationSchema.parse({ amountCents: 500, name: '', email: 'gever@example.nl', anonymous: true, idempotencyKey: crypto.randomUUID() }).anonymous).toBe(true)
  })

  it('weigert cross-site betaalverzoeken', () => {
    expect(isAllowedOrigin('https://www.stilte-en-draad.nl', 'https://www.stilte-en-draad.nl')).toBe(true)
    expect(isAllowedOrigin('https://kwaad.example', 'https://www.stilte-en-draad.nl')).toBe(false)
  })

  it('begrensd betaalverzoeken atomair op de teruggegeven teller', () => {
    expect(rateLimitAllowed(8, 8)).toBe(true)
    expect(rateLimitAllowed(9, 8)).toBe(false)
  })
})

describe('strikte configuratiescheiding', () => {
  it('is rustig niet beschikbaar zonder configuratie', () => {
    process.env = { NODE_ENV: 'test' }
    const state = configurationState()
    expect(state.ready).toBe(false)
    expect(state.issues).toContain('MOLLIE_API_KEY ontbreekt')
  })

  it('weigert een live-key buiten productie', () => {
    process.env = {
      PAYMENTS_ENABLED: 'true', DATABASE_URL: 'postgres://example', MOLLIE_API_KEY: 'live_example',
      MOLLIE_MODE: 'live', APP_BASE_URL: 'https://example.nl', MOLLIE_WEBHOOK_URL: 'https://example.nl/api/mollie/webhook',
    }
    expect(configurationState().issues).toContain('Een live-key mag niet buiten Vercel Production worden gebruikt')
  })

  it('vereist alleen een bevestigingsdrempel en geen donatiegrenzen', () => {
    process.env = {
      PAYMENTS_ENABLED: 'true', DATABASE_URL: 'postgres://example', MOLLIE_API_KEY: 'test_example',
      MOLLIE_MODE: 'test', APP_BASE_URL: 'http://localhost:3000', MOLLIE_WEBHOOK_URL: 'https://example.nl/api/mollie/webhook',
    }
    expect(donationConfigurationState().issues).toContain('DONATION_CONFIRM_THRESHOLD ontbreekt of is ongeldig')
  })
})

describe('Mollie-statusverificatie en webhookvolgorde', () => {
  it.each([
    ['paid', 'paid'], ['failed', 'failed'], ['canceled', 'canceled'], ['expired', 'expired'],
    ['open', 'pending'], ['pending', 'pending'], ['authorized', 'pending'], ['unknown', 'pending'],
  ])('behandelt %s veilig als %s', (source, expected) => {
    expect(mapStatus(source)).toBe(expected)
  })

  it('controleert metadata en bedrag voordat paid wordt toegepast', async () => {
    const statuses: string[] = []
    const order = { id: 'order-1', total_cents: 8900 } as StoredOrder
    const result = await synchronizePaymentWith('tr_test', {
      retrievePayment: async () => ({ status: 'paid', amount: { value: '89.00' }, metadata: { orderId: 'order-1' } }),
      findOrder: async () => order,
      applyStatus: async (_id, status) => { statuses.push(status); return status },
    })
    expect(result).toBe('paid')
    expect(statuses).toEqual(['paid'])
  })

  it('weigert een gemanipuleerd bedrag', async () => {
    const order = { id: 'order-1', total_cents: 8900 } as StoredOrder
    await expect(synchronizePaymentWith('tr_test', {
      retrievePayment: async () => ({ status: 'paid', amount: { value: '1.00' }, metadata: { orderId: 'order-1' } }),
      findOrder: async () => order,
      applyStatus: async (_id, status) => status,
    })).rejects.toThrow('Betalingscontrole')
  })

  it('blijft idempotent bij een dubbele paid-webhook', async () => {
    let current = 'pending'
    const order = { id: 'order-1', total_cents: 8900 } as StoredOrder
    const run = () => synchronizePaymentWith('tr_test', {
      retrievePayment: async () => ({ status: 'paid', amount: { value: '89.00' }, metadata: { orderId: 'order-1' } }),
      findOrder: async () => order,
      applyStatus: async (_id, status) => { if (current !== 'paid') current = status; return current as 'paid' },
    })
    await run()
    await run()
    expect(current).toBe('paid')
  })

  it('laat een te late pending-status terminale statussen niet terugdraaien', () => {
    expect(keepTerminalStatus('paid', 'pending')).toBe(true)
    expect(keepTerminalStatus('failed', 'pending')).toBe(true)
    expect(keepTerminalStatus('expired', 'pending')).toBe(true)
    expect(keepTerminalStatus('pending', 'paid')).toBe(false)
  })

  it('ondersteunt Mollies formulier- en JSON-webhook', () => {
    expect(paymentId('id=tr_form')).toBe('tr_form')
    expect(paymentId({ id: 'tr_json' })).toBe('tr_json')
    expect(paymentId({ status: 'paid' })).toBeNull()
  })
})

describe('race conditions voor unieke werken', () => {
  const now = new Date('2026-07-26T12:00:00Z')
  it('detecteert een gelijktijdige actieve reservering', () => {
    expect(hasInventoryConflict([{ reserved_order_id: 'order-b', reserved_until: new Date('2026-07-26T12:10:00Z'), sold_order_id: null }], 'order-a', now)).toBe(true)
  })

  it('laat dezelfde order zijn eigen reservering afronden', () => {
    expect(hasInventoryConflict([{ reserved_order_id: 'order-a', reserved_until: new Date('2026-07-26T12:10:00Z'), sold_order_id: null }], 'order-a', now)).toBe(false)
  })

  it('laat een verlopen reservering vrij zonder een late betaling blind te laten overschrijven', () => {
    expect(hasInventoryConflict([{ reserved_order_id: 'order-b', reserved_until: new Date('2026-07-26T11:59:00Z'), sold_order_id: null }], 'order-a', now)).toBe(false)
    expect(hasInventoryConflict([{ reserved_order_id: null, reserved_until: null, sold_order_id: 'order-b' }], 'order-a', now)).toBe(true)
  })
})

describe('volledige checkoutorkestratie met mocks', () => {
  const orderId = '11111111-1111-4111-8111-111111111111'
  const input = checkoutSchema.parse({
    productIds: [1], fulfillment: 'pickup', name: 'Test Persoon', email: 'test@example.nl',
    idempotencyKey: '13ad03c7-8f80-4bbc-8d35-89da69781913',
  })

  const dependencies = () => {
    const reserve = vi.fn(async () => true)
    const createPayment = vi.fn(async () => ({ id: 'tr_mock', checkoutUrl: 'https://pay.example/checkout', qrCodeUrl: 'https://pay.example/qr' }))
    const savePayment = vi.fn(async () => undefined)
    const deps: CheckoutDependencies = {
      findByKey: async () => undefined,
      canResume: async () => true,
      reserve,
      getOrderById: async () => ({ id: orderId, order_number: 'SD-TEST', total_cents: 8900, kind: 'purchase' } as StoredOrder),
      createPayment,
      savePayment,
      identity: () => ({ id: orderId, orderNumber: 'SD-TEST' }),
      itemsFor: () => [{ product: catalogItem(1)!, productId: 1, title: 'Zacht Begin', unitPriceCents: 8900, stock: 1 }],
      shippingCost: () => 0,
      validatePickup: () => undefined,
    }
    return { deps, reserve, createPayment, savePayment }
  }

  it('maakt order, reservering, Mollie-betaling en koppeling in volgorde', async () => {
    const { deps, reserve, createPayment, savePayment } = dependencies()
    const result = await processCheckout(input, { reservationMinutes: 15 }, deps)
    expect(result).toMatchObject({ created: true, orderId, checkoutUrl: 'https://pay.example/checkout' })
    expect(reserve).toHaveBeenCalledWith(expect.objectContaining({ subtotalCents: 8900, totalCents: 8900 }))
    expect(createPayment).toHaveBeenCalledOnce()
    expect(savePayment).toHaveBeenCalledWith(orderId, 'tr_mock', 'https://pay.example/checkout', 'https://pay.example/qr')
  })

  it('maakt bij een herhaalde klik geen tweede Mollie-betaling', async () => {
    const { deps, reserve, createPayment } = dependencies()
    deps.findByKey = async () => ({
      id: 'order-1', order_number: 'SD-TEST', status: 'pending', checkout_url: 'https://pay.example/existing',
      qr_code_url: null,
    } as StoredOrder)
    const result = await processCheckout(input, { reservationMinutes: 15 }, deps)
    expect(result.created).toBe(false)
    expect(result.checkoutUrl).toBe('https://pay.example/existing')
    expect(reserve).not.toHaveBeenCalled()
    expect(createPayment).not.toHaveBeenCalled()
  })

  it('hervat een draftorder met dezelfde Mollie-idempotency', async () => {
    const { deps, createPayment, savePayment } = dependencies()
    deps.findByKey = async () => ({ id: 'order-1', order_number: 'SD-TEST', status: 'draft', checkout_url: null } as StoredOrder)
    const result = await processCheckout(input, { reservationMinutes: 15 }, deps)
    expect(result.created).toBe(false)
    expect(createPayment).toHaveBeenCalledOnce()
    expect(savePayment).toHaveBeenCalledOnce()
  })

  it('neemt exact eenmaal 695 cent mee in order- en Mollie-totaal', async () => {
    const { deps, reserve, createPayment } = dependencies()
    deps.shippingCost = () => 695
    deps.itemsFor = () => [
      { product: catalogItem(2)!, productId: 2, title: 'Dromen van Water', unitPriceCents: 6900, stock: 1 },
      { product: catalogItem(3)!, productId: 3, title: 'Vrije Lucht', unitPriceCents: 7900, stock: 1 },
    ]
    deps.getOrderById = async () => ({ id: orderId, order_number: 'SD-TEST', total_cents: 15_495, kind: 'purchase' } as StoredOrder)
    const shippingInput = checkoutSchema.parse({
      productIds: [2, 3], fulfillment: 'shipping', name: 'Test Persoon', email: 'test@example.nl',
      street: 'Dorpsstraat', houseNumber: '2', addition: 'A', postalCode: '4053JV', city: 'IJzendoorn', country: 'NL',
      idempotencyKey: crypto.randomUUID(),
    })
    await processCheckout(shippingInput, { reservationMinutes: 15 }, deps)
    expect(reserve).toHaveBeenCalledWith(expect.objectContaining({
      subtotalCents: 14_800, shippingCents: 695, totalCents: 15_495, fulfillment: 'shipping',
      customer: expect.objectContaining({ address: 'Dorpsstraat 2 A', postalCode: '4053 JV', city: 'IJzendoorn', country: 'NL' }),
    }))
    expect(createPayment).toHaveBeenCalledWith(expect.objectContaining({ total_cents: 15_495 }))
  })
})

describe('volledige donatieorkestratie met mocks', () => {
  const orderId = '22222222-2222-4222-8222-222222222222'
  const input = donationSchema.parse({
    amountCents: 500, name: '', email: 'gever@example.nl', anonymous: true,
    idempotencyKey: '91c60561-0db7-460e-b346-b2868864bfa9',
  })
  const dependencies = () => {
    const createOrder = vi.fn(async () => true)
    const createPayment = vi.fn(async () => ({ id: 'tr_donation', checkoutUrl: 'https://pay.example/donation', qrCodeUrl: undefined }))
    const savePayment = vi.fn(async () => undefined)
    const deps: DonationDependencies = {
      findByKey: async () => undefined,
      canResume: async () => true,
      createOrder,
      getOrderById: async () => ({ id: orderId, order_number: 'DON-TEST', total_cents: 500, kind: 'donation' } as StoredOrder),
      createPayment,
      savePayment,
      identity: () => ({ id: orderId, orderNumber: 'DON-TEST' }),
    }
    return { deps, createOrder, createPayment }
  }

  it('maakt een anonieme donatie zonder voorraadreservering', async () => {
    const { deps, createOrder, createPayment } = dependencies()
    const result = await processDonation(input, { confirmationThresholdCents: 50_000 }, deps)
    expect(result.created).toBe(true)
    expect(createOrder).toHaveBeenCalledWith(expect.objectContaining({ anonymous: true, name: null, amountCents: 500 }))
    expect(createPayment).toHaveBeenCalledOnce()
  })

  it('accepteert ieder positief centbedrag zonder minimum of maximum', async () => {
    const config = { confirmationThresholdCents: 50_000 }
    await expect(processDonation({ ...input, amountCents: 1 }, config, dependencies().deps)).resolves.toMatchObject({ created: true })
    await expect(processDonation({ ...input, amountCents: 100_000_001, confirmedAmountCents: 100_000_001 }, config, dependencies().deps)).resolves.toMatchObject({ created: true })
  })
})
