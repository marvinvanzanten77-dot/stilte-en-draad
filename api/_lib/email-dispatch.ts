import { processEmailOutbox } from './email.js'
import { createResendProvider, emailConfigurationState } from './resend.js'
import { emailOutboxRepository } from './store.js'

export const processPendingEmailsSafely = async (limit = 20) => {
  const config = emailConfigurationState()
  if (!config.ready) return { processed: 0, skipped: true }
  try {
    const result = await processEmailOutbox(createResendProvider(), emailOutboxRepository, limit)
    return { ...result, skipped: false }
  } catch (error) {
    console.error('Transactionele e-mailverwerking uitgesteld', error instanceof Error ? error.name : 'UnknownError')
    return { processed: 0, skipped: false, deferred: true }
  }
}
