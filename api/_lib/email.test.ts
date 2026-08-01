import { describe, expect, it, vi } from 'vitest'
import { processEmailOutbox, withdrawalConfirmationContent, type EmailMessage } from './email.js'

const message: EmailMessage = {
  outboxId: 1,
  orderId: '11111111-1111-4111-8111-111111111111',
  type: 'payment_succeeded',
  recipient: 'test@example.nl',
  payload: {},
}

describe('e-mail-outbox', () => {
  it('maakt een bewaarbare ontvangstbevestiging voor een herroeping', () => {
    const content = withdrawalConfirmationContent({
      requestNumber: 'HER-20260727-ABC12345',
      receivedAt: '2026-07-27T12:00:00.000Z',
      scope: 'full',
    })
    expect(content.subject).toContain('HER-20260727-ABC12345')
    expect(content.text).toContain('gehele bestelling')
    expect(content.text).toContain('info@stilte-en-draad.nl')
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
})
