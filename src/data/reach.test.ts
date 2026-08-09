import { describe, expect, it } from 'vitest'
import { products } from './products'
import { buildCampaignUrl, isMerchantProduct, merchantProducts, SHIPPING_COST_CENTS } from './reach'

describe('bereiklaag uit de canonieke catalogus', () => {
  it('neemt alleen werkelijk koopbare, unieke producten met voorraad op', () => {
    expect(merchantProducts.length).toBeGreaterThan(0)
    expect(merchantProducts.every(isMerchantProduct)).toBe(true)
    expect(merchantProducts.some((item) => item.status === 'verkocht' || item.readiness !== 'purchasable')).toBe(false)
    expect(merchantProducts.some((item) => item.duplicateOfProductId !== null)).toBe(false)
  })

  it('houdt prijs, voorraad en verzending gelijk aan de productbron', () => {
    for (const item of merchantProducts) {
      const canonical = products.find((product) => product.id === item.id)!
      expect(item.price).toBe(canonical.price)
      expect(item.stock).toBe(canonical.stock)
      expect(item.shippingCostCents).toBe(SHIPPING_COST_CENTS)
    }
  })

  it('maakt herkenbare links zonder persoonsgegevens', () => {
    const url = buildCampaignUrl('https://www.stilte-en-draad.nl/werk/vrije-lucht', 'pinterest')
    expect(url).toContain('utm_source=pinterest')
    expect(url).toContain('utm_medium=social')
  })
})
