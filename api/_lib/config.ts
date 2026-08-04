export class ConfigurationError extends Error {
  issues: string[]
  constructor(message: string, issues: string[]) {
    super(message)
    this.name = 'ConfigurationError'
    this.issues = issues
  }
}

const enabled = (value: string | undefined) => value?.trim().toLowerCase() === 'true'
const value = (name: string) => process.env[name]?.trim() || ''

const positiveInteger = (name: string, fallback?: number) => {
  const raw = value(name)
  if (!raw && fallback !== undefined) return fallback
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export const decimalEuroEnvironmentToCents = (name: string) => {
  const raw = value(name)
  if (!raw || !/^\d+(?:\.\d{1,2})?$/.test(raw)) return null
  const [euros, decimals = ''] = raw.split('.')
  const cents = Number(euros) * 100 + Number(decimals.padEnd(2, '0'))
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null
}

const safeUrl = (raw: string) => {
  try { return new URL(raw) } catch { return null }
}

export const configurationState = () => {
  const issues: string[] = []
  const paymentsEnabled = enabled(process.env.PAYMENTS_ENABLED)
  if (!paymentsEnabled) issues.push('PAYMENTS_ENABLED staat niet op true')

  const databaseUrl = value('DATABASE_URL')
  const apiKey = value('MOLLIE_API_KEY')
  const mode = value('MOLLIE_MODE') || 'test'
  const baseUrl = value('APP_BASE_URL') || value('MOLLIE_REDIRECT_BASE_URL')
  const webhookUrl = value('MOLLIE_WEBHOOK_URL') || (baseUrl ? `${baseUrl.replace(/\/$/, '')}/api/mollie/webhook` : '')
  const base = safeUrl(baseUrl)
  const webhook = safeUrl(webhookUrl)
  const production = process.env.VERCEL_ENV === 'production'
  const hosted = Boolean(process.env.VERCEL_ENV)

  if (!databaseUrl) issues.push('DATABASE_URL ontbreekt')
  if (!apiKey) issues.push('MOLLIE_API_KEY ontbreekt')
  if (!['test', 'live'].includes(mode)) issues.push('MOLLIE_MODE moet test of live zijn')
  if (mode === 'test' && apiKey && !apiKey.startsWith('test_')) issues.push('MOLLIE_API_KEY past niet bij testmodus')
  if (mode === 'live' && apiKey && !apiKey.startsWith('live_')) issues.push('MOLLIE_API_KEY past niet bij livemodus')
  if (production && mode !== 'live') issues.push('Vercel Production accepteert uitsluitend MOLLIE_MODE=live')
  if (!production && mode === 'live') issues.push('Een live-key mag niet buiten Vercel Production worden gebruikt')
  if (!base || (production && base.protocol !== 'https:')) issues.push('APP_BASE_URL ontbreekt of is niet veilig')
  if (!webhook || webhook.protocol !== 'https:') issues.push('MOLLIE_WEBHOOK_URL moet een publieke HTTPS-URL zijn')
  if (hosted && base && webhook && base.origin !== webhook.origin) issues.push('Webhook en APP_BASE_URL moeten dezelfde herkomst gebruiken')
  if (webhook && webhook.pathname !== '/api/mollie/webhook') issues.push('MOLLIE_WEBHOOK_URL heeft een onverwacht pad')

  const reservationMinutes = positiveInteger('RESERVATION_DURATION_MINUTES', 15)
  if (!reservationMinutes || reservationMinutes < 5 || reservationMinutes > 60) issues.push('RESERVATION_DURATION_MINUTES moet tussen 5 en 60 liggen')

  return {
    ready: issues.length === 0,
    issues,
    paymentsEnabled,
    databaseUrl,
    apiKey,
    mode: mode as 'test' | 'live',
    baseUrl: base?.origin ?? '',
    webhookUrl,
    reservationMinutes: reservationMinutes ?? 15,
    production,
  }
}

export const serverConfig = () => {
  const state = configurationState()
  if (!state.ready) throw new ConfigurationError('Online betalen is tijdelijk nog niet beschikbaar.', state.issues)
  return state
}

export const donationConfig = () => {
  const config = serverConfig()
  const confirmationThresholdCents = decimalEuroEnvironmentToCents('DONATION_CONFIRM_THRESHOLD')
  const issues: string[] = []
  if (!confirmationThresholdCents) issues.push('DONATION_CONFIRM_THRESHOLD ontbreekt of is ongeldig')
  if (issues.length) throw new ConfigurationError('Online doneren is tijdelijk nog niet beschikbaar.', issues)
  return { ...config, confirmationThresholdCents: confirmationThresholdCents! }
}

export const donationConfigurationState = () => {
  const base = configurationState()
  const issues = [...base.issues]
  const confirmationThresholdCents = decimalEuroEnvironmentToCents('DONATION_CONFIRM_THRESHOLD')
  if (!confirmationThresholdCents) issues.push('DONATION_CONFIRM_THRESHOLD ontbreekt of is ongeldig')
  return { ready: issues.length === 0, issues, confirmationThresholdCents }
}
