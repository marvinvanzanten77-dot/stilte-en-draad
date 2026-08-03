import type { VercelRequest, VercelResponse } from '@vercel/node'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { emailContent, processEmailOutbox, withdrawalConfirmationContent, type EmailMessage, type EmailMessageType } from './email.js'
import { createResendProvider, emailConfigurationState, validProcessingSecret } from './resend.js'
import emailProcessHandler, { authorized } from '../email/process.js'

const message: EmailMessage = {
  outboxId: 1,
  orderId: '11111111-1111-4111-8111-111111111111',
  type: 'payment_succeeded',
  recipient: 'test@example.nl',
  payload: {},
}

describe('e-mail-outbox', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('maakt een bewaarbare ontvangstbevestiging voor een herroeping', () => {
    const content = withdrawalConfirmationContent({
      requestNumber: 'HER-20260727-ABC12345',
      receivedAt: '2026-07-27T12:00:00.000Z',
      scope: 'full',
    })
    expect(content.subject).toContain('HER-20260727-ABC12345')
    expect(content.text).toContain('gehele bestelling')
    expect(content.text).toContain('marvinvanzanten77@gmail.com')
  })

  it('vangt providerfouten af en plant een retry zonder de betaalflow te laten falen', async () => {
    const failed = vi.fn(async () => undefined)
    const sent = vi.fn(async () => undefined)
    const result = await processEmailOutbox(
      { send: async () => { throw new Error('provider offline') } },
      { pending: async () => [message], sent, failed },
    )
    expect(result).toEqual({ processed: 1 })
    expect(sent).not.toHaveBeenCalled()
    expect(failed).toHaveBeenCalledWith(1, expect.any(Date), 'Error')
  })

  it('markeert een succesvol bericht precies eenmaal als verzonden', async () => {
    const sent = vi.fn(async () => undefined)
    await processEmailOutbox(
      { send: async () => undefined },
      { pending: async () => [message], sent, failed: async () => undefined },
    )
    expect(sent).toHaveBeenCalledOnce()
  })

  it('heeft voor ieder outboxbericht een Nederlandstalige transactionele tekst', () => {
    const types: EmailMessageType[] = ['order_received', 'payment_succeeded', 'payment_failed_or_canceled', 'payment_review', 'donation_confirmed', 'withdrawal_received']
    for (const type of types) {
      const content = emailContent({ ...message, type, payload: type === 'withdrawal_received' ? { requestNumber: 'HER-1', receivedAt: '2026-08-01T10:00:00.000Z', scope: 'full' } : {} })
      expect(content.subject.length).toBeGreaterThan(8)
      expect(content.text).toContain('Stilte & Draad')
    }
  })

  it('neemt verzendadres of afhaalafspraak op in aankoopmails', () => {
    const shipping = emailContent({
      ...message,
      payload: { fulfillment: 'shipping', shippingCents: 695, address: 'Dorpsstraat 2 A', postalCode: '4053 JV', city: 'IJzendoorn', country: 'NL' },
    })
    expect(shipping.text).toContain('€ 6,95')
    expect(shipping.text).toContain('Dorpsstraat 2 A\n4053 JV IJzendoorn\nNederland')
    const pickup = emailContent({ ...message, payload: { fulfillment: 'pickup', shippingCents: 0 } })
    expect(pickup.text).toContain('Afhalen op afspraak in IJzendoorn')
  })

  it('houdt de provider uitgeschakeld zonder complete expliciete configuratie', () => {
    expect(emailConfigurationState().ready).toBe(false)
    expect(() => createResendProvider()).toThrow('EMAIL_NOT_CONFIGURED')
  })

  it('weigert ook lange herkenbare placeholders als verwerkingsgeheim', () => {
    expect(validProcessingSecret('placeholder-placeholder-placeholder-123')).toBe(false)
    expect(validProcessingSecret('example-cron-secret-that-is-long-enough')).toBe(false)
    expect(validProcessingSecret('M7v!q2Z#s9L@p4X&c8N*k5R-w3T_y6H-extra')).toBe(true)
  })

  it('gebruikt bij iedere retry dezelfde provider-idempotency-key', async () => {
    vi.stubEnv('EMAIL_ENABLED', 'true')
    vi.stubEnv('RESEND_API_KEY', 're_test_only')
    vi.stubEnv('EMAIL_FROM', 'Stilte & Draad <test@stilte-en-draad.nl>')
    vi.stubEnv('CRON_SECRET', 'M7v!q2Z#s9L@p4X&c8N*k5R-w3T_y6H-extra')
    const fetchMock = vi.fn(async (...args: [string | URL | Request, RequestInit?]) => {
      void args
      return new Response(null, { status: 202 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const provider = createResendProvider()

    await provider.send(message)
    await provider.send(message)

    const firstHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>
    const secondHeaders = fetchMock.mock.calls[1]?.[1]?.headers as Record<string, string>
    expect(firstHeaders['Idempotency-Key']).toBe('stilte-en-draad-outbox-1')
    expect(secondHeaders['Idempotency-Key']).toBe(firstHeaders['Idempotency-Key'])
  })

  it('houdt de verwerkingsroute dicht zonder configuratie en weigert een verkeerd geheim', async () => {
    vi.stubEnv('EMAIL_ENABLED', 'false')
    const response = {
      status: vi.fn(),
      setHeader: vi.fn(),
      json: vi.fn(),
    }
    response.status.mockReturnValue(response)
    response.setHeader.mockReturnValue(response)

    await emailProcessHandler({ method: 'GET', headers: {} } as VercelRequest, response as unknown as VercelResponse)

    expect(response.status).toHaveBeenCalledWith(503)
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'EMAIL_UNAVAILABLE' }))
    const secret = 'M7v!q2Z#s9L@p4X&c8N*k5R-w3T_y6H-extra'
    expect(authorized({ headers: {} } as VercelRequest, secret)).toBe(false)
    expect(authorized({ headers: { authorization: 'Bearer verkeerd' } } as VercelRequest, secret)).toBe(false)
    expect(authorized({ headers: { authorization: `Bearer ${secret}` } } as VercelRequest, secret)).toBe(true)
  })
})
