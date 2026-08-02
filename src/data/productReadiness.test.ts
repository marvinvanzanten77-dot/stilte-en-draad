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
    expect(issues).toEqual([])
  })

  it('vraagt geen verkoopdetails meer voor verkochte werken', () => {
    expect(productReadinessIssues(products.find((product) => product.id === 1)!)).toEqual([])
  })

  it('houdt de twee tassen met ontbrekende maten inhoudelijk onvolledig', () => {
    const incomplete = products
      .filter((product) => product.status !== 'verkocht')
      .map((product) => ({ id: product.id, missing: productReadinessIssues(product) }))
      .filter((product) => product.missing.length > 0)
    expect(incomplete).toEqual([
      { id: 11, missing: ['afmetingen (hoogte en breedte, of doorsnede)', 'diepte/dikte'] },
      { id: 23, missing: ['diepte/dikte'] },
    ])
  })
})
