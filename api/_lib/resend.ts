import { emailContent, type EmailProvider } from './email.js'

const value = (name: string) => process.env[name]?.trim() || ''
const enabled = (raw: string) => raw.toLowerCase() === 'true'
const normalizedSecret = (raw: string) => raw.toLowerCase().replace(/[^a-z0-9]/g, '')
const placeholderSecrets = new Set([
  'changeme',
  'changemeplease',
  'replacewithsecuresecret',
  'yourcronsecret',
  'examplecronsecret',
])

export const validProcessingSecret = (secret: string) => {
  if (secret.length < 32) return false
  const normalized = normalizedSecret(secret)
  return !placeholderSecrets.has(normalized) && !normalized.startsWith('example') && !normalized.startsWith('placeholder')
}

export const emailConfigurationState = () => {
  const issues: string[] = []
  const emailEnabled = enabled(value('EMAIL_ENABLED'))
  const apiKey = value('RESEND_API_KEY')
  const from = value('EMAIL_FROM')
  const replyTo = value('EMAIL_REPLY_TO')
  const cronSecret = value('CRON_SECRET')

  if (!emailEnabled) issues.push('EMAIL_ENABLED staat niet op true')
  if (!apiKey.startsWith('re_')) issues.push('RESEND_API_KEY ontbreekt of heeft een onverwacht formaat')
  if (!from.includes('@')) issues.push('EMAIL_FROM ontbreekt of is ongeldig')
  if (replyTo && !replyTo.includes('@')) issues.push('EMAIL_REPLY_TO is ongeldig')
  if (!validProcessingSecret(cronSecret)) issues.push('CRON_SECRET ontbreekt, is te kort of is een placeholder')

  return { ready: issues.length === 0, issues, emailEnabled, apiKey, from, replyTo, cronSecret }
}

export const createResendProvider = (): EmailProvider => {
  const config = emailConfigurationState()
  if (!config.ready) throw new Error('EMAIL_NOT_CONFIGURED')

  return {
    send: async (message) => {
      const content = emailContent(message)
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `stilte-en-draad-outbox-${message.outboxId}`,
        },
        body: JSON.stringify({
          from: config.from,
          to: [message.recipient],
          subject: content.subject,
          text: content.text,
          html: content.html,
          ...(config.replyTo ? { reply_to: config.replyTo } : {}),
        }),
      })
      if (!response.ok) throw new Error(`RESEND_HTTP_${response.status}`)
    },
  }
}
