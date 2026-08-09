import { describe, expect, it } from 'vitest'
import { CONSENT_MAX_AGE_MS, CONSENT_STORAGE_KEY, CONSENT_VERSION, readConsent, writeConsent } from './consent'

const memoryStorage = () => {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) },
  }
}

describe('blijvende cookievoorkeur', () => {
  const now = new Date('2026-08-09T10:00:00.000Z')

  it('toont bij een eerste bezoek nog geen opgeslagen keuze', () => {
    expect(readConsent(memoryStorage(), now)).toBeNull()
  })

  it.each([
    { analytics: true, marketing: true },
    { analytics: false, marketing: false },
  ])('bewaart accepteren en weigeren over refresh, navigatie en een nieuwe sessie', (choice) => {
    const storage = memoryStorage()
    writeConsent(storage, choice, now)
    expect(readConsent(storage, new Date(now.getTime() + 1_000))).toMatchObject(choice)
    expect(readConsent(storage, new Date(now.getTime() + 86_400_000))).toMatchObject(choice)
  })

  it('overschrijft de keuze wanneer voorkeuren handmatig wijzigen', () => {
    const storage = memoryStorage()
    writeConsent(storage, { analytics: false, marketing: false }, now)
    writeConsent(storage, { analytics: true, marketing: false }, new Date(now.getTime() + 1_000))
    expect(readConsent(storage, new Date(now.getTime() + 2_000))).toMatchObject({ analytics: true, marketing: false })
  })

  it('vraagt opnieuw na een nieuwe consentversie of het verstrijken van de bewaartermijn', () => {
    const storage = memoryStorage()
    writeConsent(storage, { analytics: false, marketing: false }, now)
    const saved = JSON.parse(storage.getItem(CONSENT_STORAGE_KEY)!) as Record<string, unknown>
    storage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ ...saved, version: CONSENT_VERSION - 1 }))
    expect(readConsent(storage, now)).toBeNull()
    writeConsent(storage, { analytics: false, marketing: false }, now)
    expect(readConsent(storage, new Date(now.getTime() + CONSENT_MAX_AGE_MS + 1))).toBeNull()
  })

  it('valt veilig terug wanneer browseropslag geblokkeerd is', () => {
    const blocked = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') }, removeItem: () => undefined }
    expect(readConsent(blocked, now)).toBeNull()
    expect(writeConsent(blocked, { analytics: false, marketing: false }, now)).toBeNull()
  })
})
