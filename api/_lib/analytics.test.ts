import type { VercelRequest, VercelResponse } from '@vercel/node'
import { describe, expect, it, vi } from 'vitest'
import { analyticsVisitorHash, normalizeAnalyticsPath } from './store.js'
import dailyReportHandler from '../analytics/daily-report.js'

describe('anonieme verkeersmeting', () => {
  it('normaliseert paden zonder querystrings of hashes', () => {
    expect(normalizeAnalyticsPath('/werk/avondbloesem?utm_source=pinterest#foto')).toBe('/werk/avondbloesem')
    expect(normalizeAnalyticsPath('https://example.com/fout')).toBe('/')
    expect(normalizeAnalyticsPath('')).toBe('/')
  })

  it('maakt een daggebonden hash zonder de sessiesleutel bloot te leggen', () => {
    const first = analyticsVisitorHash('2026-09-11', 'session-1234567890abcdef')
    const second = analyticsVisitorHash('2026-09-12', 'session-1234567890abcdef')
    expect(first).toHaveLength(64)
    expect(first).not.toContain('session')
    expect(first).not.toBe(second)
  })

  it('houdt de dagelijkse rapportroute dicht zonder e-mailconfiguratie', async () => {
    vi.stubEnv('EMAIL_ENABLED', 'false')
    const response = {
      status: vi.fn(),
      setHeader: vi.fn(),
      json: vi.fn(),
    }
    response.status.mockReturnValue(response)
    response.setHeader.mockReturnValue(response)

    await dailyReportHandler({ method: 'GET', headers: {} } as VercelRequest, response as unknown as VercelResponse)

    expect(response.status).toHaveBeenCalledWith(503)
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'EMAIL_UNAVAILABLE' }))
    vi.unstubAllEnvs()
  })
})
