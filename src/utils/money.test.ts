import { describe, expect, it } from 'vitest'
import { formatCents, parseEuroAmountToCents } from './money'

describe('geldbedragen', () => {
  it('houdt hele eurobedragen compact', () => {
    expect(formatCents(4_900)).toBe('€\u00a049')
  })

  it('toont halve eurobedragen met twee decimalen', () => {
    expect(formatCents(250)).toBe('€\u00a02,50')
  })

  it('toont centbedragen exact met Nederlandse lokalisatie', () => {
    expect(formatCents(2_499)).toBe('€\u00a024,99')
  })

  it('weigert bedragen die niet als integer centen zijn aangeleverd', () => {
    expect(() => formatCents(2.5)).toThrow(RangeError)
  })

  it('parseert Nederlandse invoer zonder floating-pointberekening', () => {
    expect(parseEuroAmountToCents('2,50')).toBe(250)
    expect(parseEuroAmountToCents('24,99')).toBe(2_499)
    expect(parseEuroAmountToCents('49')).toBe(4_900)
  })
})
