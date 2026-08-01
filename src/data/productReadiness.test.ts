import { describe, expect, it } from 'vitest'
import { products } from './products'
import { productReadinessIssues } from './productReadiness'

describe('productgereedheid', () => {
  it('houdt alle niet-verkochte werken bewust op display_only', () => {
    expect(products.filter((product) => product.status !== 'verkocht').every((product) => product.readiness === 'display_only')).toBe(true)
    expect(products.filter((product) => product.status === 'verkocht').every((product) => product.readiness === 'sold')).toBe(true)
  })

  it('rapporteert ontbrekende velden exact per werk', () => {
    const issues = productReadinessIssues(products.find((product) => product.id === 2)!)
    expect(issues).toEqual([
      'kwetsbaarheid',
      'handgemaakte afwijkingen', 'afhalen of verzenden toegestaan',
      'verwerkingstermijn', 'verwachte levertijd',
    ])
  })

  it('vraagt geen verkoopdetails meer voor verkochte werken', () => {
    expect(productReadinessIssues(products.find((product) => product.id === 1)!)).toEqual([])
  })
})
