import { describe, expect, it, vi } from 'vitest'
import { donationSchema, processDonation, type DonationDependencies } from '../donations/create.js'
import { parseEuroAmountToCents } from '../../src/utils/money.js'
import type { StoredOrder } from './store.js'

const config = {
  confirmationThresholdCents: 50_000,
}
const base = {
  amountCents: 1_000,
  name: 'Geefster',
  email: 'gever@example.nl',
  anonymous: false,
  message: '',
  idempotencyKey: '91c60561-0db7-460e-b346-b2868864bfa9',
}
const dependencies = (): DonationDependencies => ({
  findByKey: async () => undefined,
  canResume: async () => true,
  createOrder: async () => true,
  getOrderById: async () => ({ id: '22222222-2222-4222-8222-222222222222', order_number: 'DON-TEST', total_cents: 1_000, kind: 'donation' } as StoredOrder),
  createPayment: vi.fn(async () => ({ id: 'tr_test', checkoutUrl: 'https://pay.example/donation', qrCodeUrl: undefined })),
  savePayment: async () => undefined,
  identity: () => ({ id: '22222222-2222-4222-8222-222222222222', orderNumber: 'DON-TEST' }),
})

describe('veilige euro-invoer', () => {
  it.each([
    ['2,50', 250], ['2.50', 250], ['500', 50_000], ['10000.00', 1_000_000],
    ['0', 0], ['0,00', 0],
  ])('zet %s exact om naar %i cent', (value, cents) => expect(parseEuroAmountToCents(value)).toBe(cents))

  it.each(['-1', '2.501', '1,2,3', 'NaN', 'Infinity', '', '  '])('weigert ongeldige invoer %s', (value) => {
    expect(parseEuroAmountToCents(value)).toBeNull()
  })
})

describe('vrije donatiebedragen en expliciete bevestiging', () => {
  it('accepteert één cent maar weigert nul en negatieve/gemanipuleerde schemawaarden', async () => {
    await expect(processDonation({ ...base, amountCents: 1 }, config, dependencies())).resolves.toMatchObject({ created: true })
    expect(() => donationSchema.parse({ ...base, amountCents: 0 })).toThrow()
    expect(() => donationSchema.parse({ ...base, amountCents: -1 })).toThrow()
    expect(() => donationSchema.parse({ ...base, amountCents: 250.5 })).toThrow()
    expect(() => donationSchema.parse({ ...base, amountCents: '250' })).toThrow()
  })

  it.each([1, 250, 1_000, 49_999])('accepteert %i cent zonder extra bevestiging', async (amountCents) => {
    await expect(processDonation({ ...base, amountCents }, config, dependencies())).resolves.toMatchObject({ created: true })
  })

  it.each([50_000, 75_000, 1_000_000, 100_000_001])('accepteert %i cent uitsluitend met een exacte bevestiging', async (amountCents) => {
    await expect(processDonation({ ...base, amountCents }, config, dependencies())).rejects.toThrow('DONATION_CONFIRMATION_REQUIRED')
    await expect(processDonation({ ...base, amountCents, confirmedAmountCents: amountCents - 1 }, config, dependencies())).rejects.toThrow('DONATION_CONFIRMATION_REQUIRED')
    await expect(processDonation({ ...base, amountCents, confirmedAmountCents: amountCents }, config, dependencies())).resolves.toMatchObject({ created: true })
  })

  it('hergebruikt bij dubbel submit dezelfde checkout en maakt geen betaling', async () => {
    const createPayment = vi.fn(async () => ({ id: 'unused', checkoutUrl: '', qrCodeUrl: undefined }))
    const deps = dependencies()
    deps.findByKey = async () => ({ id: 'order-1', order_number: 'DON-1', status: 'pending', checkout_url: 'https://pay.example/existing', qr_code_url: null } as StoredOrder)
    deps.createPayment = createPayment
    const result = await processDonation(base, config, deps)
    expect(result.created).toBe(false)
    expect(result.checkoutUrl).toBe('https://pay.example/existing')
    expect(createPayment).not.toHaveBeenCalled()
  })
})
