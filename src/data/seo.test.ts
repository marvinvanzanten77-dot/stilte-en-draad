import { describe, expect, it } from 'vitest'
import { indexableSeoRoutes, seoForPath, seoRoutes } from './seo'
import { products } from './products'
import { isMerchantProduct } from './reach'

describe('SEO-routes', () => {
  it('heeft unieke titles, descriptions, paden en canonieke publieke routes', () => {
    expect(new Set(seoRoutes.map((route) => route.path)).size).toBe(seoRoutes.length)
    expect(new Set(indexableSeoRoutes.map((route) => route.title)).size).toBe(indexableSeoRoutes.length)
    expect(new Set(indexableSeoRoutes.map((route) => route.description)).size).toBe(indexableSeoRoutes.length)
    expect(indexableSeoRoutes.every((route) => route.path.startsWith('/') && route.description.length > 50)).toBe(true)
  })

  it('sluit transactionele en persoonlijke routes uit van indexering', () => {
    for (const path of ['/checkout', '/herroepen', '/betaling/uuid', '/certificaat/vrije-lucht']) {
      expect(seoForPath(path)?.indexable).toBe(false)
    }
  })

  it('heeft voor ieder zelfstandig product metadata en Product/Offer-structured data', () => {
    const catalog = products.filter((product) => product.duplicateOfProductId === null)
    for (const product of catalog) {
      const route = seoForPath(`/werk/${product.slug}`)
      expect(route?.type).toBe('product')
      expect(JSON.stringify(route?.structuredData)).toContain('Offer')
      expect(JSON.stringify(route?.structuredData)).toContain('MerchantReturnPolicy')
      expect(JSON.stringify(route?.structuredData)).toContain('OfferShippingDetails')
      expect(JSON.stringify(route?.structuredData)).toContain('ImageObject')
      expect(route?.description).toContain('eigen bijbehorende tekst')
      if (isMerchantProduct(product)) expect(route?.image).toMatch(/\/social\/products\/.+\.jpg$/)
    }
  })
})
