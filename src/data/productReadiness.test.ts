import { describe, expect, it } from 'vitest'
import { products } from './products'
import { productReadinessIssues } from './productReadiness'

describe('productgereedheid', () => {
  it('maakt alleen complete, zelfstandige cataloguswerken bestelbaar', () => {
    expect(products.filter((product) => product.readiness === 'purchasable').every((product) => product.status === 'beschikbaar' && productReadinessIssues(product).length === 0 && product.duplicateOfProductId === null)).toBe(true)
    expect(products.filter((product) => product.status === 'verkocht').every((product) => product.readiness === 'sold')).toBe(true)
    expect(products.filter((product) => product.unique && product.readiness === 'purchasable').every((product) => product.stock === 1)).toBe(true)
  })

  it('blokkeert onvolledige en dubbele vermeldingen', () => {
    expect(products.find((product) => product.id === 11)?.readiness).toBe('display_only')
    expect(products.find((product) => product.id === 14)?.readiness).toBe('display_only')
    expect(products.find((product) => product.id === 23)?.readiness).toBe('display_only')
    expect(products.find((product) => product.id === 26)?.readiness).toBe('display_only')
    expect(products.find((product) => product.id === 27)?.readiness).toBe('display_only')
  })

  it('rapporteert ontbrekende velden exact per werk', () => {
    const issues = productReadinessIssues(products.find((product) => product.id === 2)!)
    expect(issues).toEqual([])
  })

  it('vraagt geen verkoopdetails meer voor verkochte werken', () => {
    expect(productReadinessIssues(products.find((product) => product.id === 1)!)).toEqual([])
  })

  it('houdt werken met ontbrekende verkoopgegevens inhoudelijk onvolledig', () => {
    const incomplete = products
      .filter((product) => product.status !== 'verkocht')
      .map((product) => ({ id: product.id, missing: productReadinessIssues(product) }))
      .filter((product) => product.missing.length > 0)
    expect(incomplete).toEqual([
      { id: 11, missing: ['afmetingen (hoogte en breedte, of doorsnede)', 'diepte/dikte'] },
      { id: 23, missing: ['diepte/dikte'] },
      { id: 26, missing: ['afmetingen (hoogte en breedte, of doorsnede)', 'diepte/dikte', 'materialen', 'onderhoud'] },
      { id: 27, missing: ['afmetingen (hoogte en breedte, of doorsnede)', 'diepte/dikte', 'materialen', 'onderhoud'] },
    ])
  })
})
