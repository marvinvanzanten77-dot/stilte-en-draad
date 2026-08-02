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

const payloadString = (payload: Record<string, unknown>, key: string) =>
  typeof payload[key] === 'string' ? payload[key] : ''

export const emailContent = (message: EmailMessage) => {
  if (message.type === 'withdrawal_received') {
    return withdrawalConfirmationContent({
      requestNumber: payloadString(message.payload, 'requestNumber') || 'onbekend',
      receivedAt: payloadString(message.payload, 'receivedAt') || new Date().toISOString(),
      scope: message.payload.scope === 'partial' ? 'partial' : 'full',
    })
  }

  const content: Record<Exclude<EmailMessageType, 'withdrawal_received'>, { subject: string; text: string }> = {
    order_received: {
      subject: 'We hebben je bestelling ontvangen',
      text: 'We hebben je bestelling ontvangen. Zodra de betaling is bevestigd, laten we je weten hoe het werk bij je komt.\n\nStilte & Draad · info@stilte-en-draad.nl',
    },
    payment_succeeded: {
      subject: 'Je betaling is ontvangen',
      text: 'Je betaling is ontvangen. We nemen contact op over afhalen of, als dat voor dit werk is afgesproken, verzending.\n\nStilte & Draad · info@stilte-en-draad.nl',
    },
    payment_failed_or_canceled: {
      subject: 'Je betaling is niet afgerond',
      text: 'Je betaling is niet afgerond. Er is niets definitief besteld. Neem gerust contact op als je hulp nodig hebt.\n\nStilte & Draad · info@stilte-en-draad.nl',
    },
    payment_review: {
      subject: 'We controleren je betaling persoonlijk',
      text: 'Je betaling vraagt om een handmatige controle. We nemen persoonlijk contact op voordat er iets met je bestelling gebeurt.\n\nStilte & Draad · info@stilte-en-draad.nl',
    },
    donation_confirmed: {
      subject: 'Dank je voor je bijdrage aan het rijdende atelier',
      text: 'Dank je voor je bijdrage. Je helpt mee aan de aanschaf en verbouwing van de bus waarmee Stilte & Draad naar markten en festivals kan reizen.\n\nStilte & Draad · info@stilte-en-draad.nl',
    },
  }
  return content[message.type]
}

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
