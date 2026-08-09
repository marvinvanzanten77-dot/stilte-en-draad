export const CONSENT_STORAGE_KEY = 'stilte-draad-cookie-consent'
export const CONSENT_VERSION = 2
export const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000

export type Consent = {
  version: number
  necessary: true
  analytics: boolean
  marketing: boolean
  savedAt: string
  expiresAt: string
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export const readConsent = (storage: StorageLike, now = new Date()): Consent | null => {
  try {
    const raw = storage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Consent>
    const valid = parsed.version === CONSENT_VERSION
      && parsed.necessary === true
      && typeof parsed.analytics === 'boolean'
      && typeof parsed.marketing === 'boolean'
      && typeof parsed.savedAt === 'string'
      && typeof parsed.expiresAt === 'string'
      && Number.isFinite(Date.parse(parsed.savedAt))
      && Date.parse(parsed.expiresAt) > now.getTime()
    if (!valid) {
      storage.removeItem(CONSENT_STORAGE_KEY)
      return null
    }
    return parsed as Consent
  } catch {
    return null
  }
}

export const writeConsent = (storage: StorageLike, choice: Pick<Consent, 'analytics' | 'marketing'>, now = new Date()) => {
  const consent: Consent = {
    version: CONSENT_VERSION,
    necessary: true,
    ...choice,
    savedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CONSENT_MAX_AGE_MS).toISOString(),
  }
  try {
    storage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent))
    return consent
  } catch {
    return null
  }
}
