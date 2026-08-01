export type EmailMessageType =
  | 'order_received'
  | 'payment_succeeded'
  | 'payment_failed_or_canceled'
  | 'payment_review'
  | 'donation_confirmed'
  | 'withdrawal_received'

export type EmailMessage = {
  outboxId: number
  orderId: string
  type: EmailMessageType
  recipient: string
  payload: Record<string, unknown>
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>
}

export interface EmailOutboxRepository {
  pending(limit: number): Promise<EmailMessage[]>
  sent(outboxId: number): Promise<void>
  failed(outboxId: number, retryAt: Date, errorCode: string): Promise<void>
}

export const withdrawalConfirmationContent = (payload: {
  requestNumber: string
  receivedAt: string
  scope: 'full' | 'partial'
}) => ({
  subject: `Ontvangstbevestiging herroeping ${payload.requestNumber}`,
  text: [
    'We hebben je herroeping ontvangen.',
    `Referentie: ${payload.requestNumber}`,
    `Ontvangen op: ${payload.receivedAt}`,
    `Omvang: ${payload.scope === 'full' ? 'gehele bestelling' : 'deel van de bestelling'}`,
    '',
    'Bewaar deze bevestiging. We nemen contact op met de retourinstructies.',
    'Stilte & Draad · info@stilte-en-draad.nl',
  ].join('\n'),
})

const safeErrorCode = (error: unknown) => {
  if (error instanceof Error && error.name) return error.name.slice(0, 80)
  return 'EMAIL_PROVIDER_ERROR'
}

export const processEmailOutbox = async (
  provider: EmailProvider,
  repository: EmailOutboxRepository,
  limit = 20,
) => {
  const messages = await repository.pending(limit)
  for (const message of messages) {
    try {
      await provider.send(message)
      await repository.sent(message.outboxId)
    } catch (error) {
      const retryAt = new Date(Date.now() + 5 * 60 * 1000)
      await repository.failed(message.outboxId, retryAt, safeErrorCode(error))
    }
  }
  return { processed: messages.length }
}
