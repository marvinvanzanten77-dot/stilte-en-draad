import type { Product } from './products.js'

export const productReadinessIssues = (product: Product): string[] => {
  if (product.status === 'verkocht' || product.readiness === 'sold') return []
  const issues: string[] = []
  if (!product.title.trim()) issues.push('productnaam')
  if (!Number.isInteger(product.id) || product.id < 1) issues.push('uniek product-ID')
  if (!Number.isFinite(product.price) || product.price <= 0) issues.push('prijs')
  const hasRectangularSize = product.heightCm !== null && product.heightCm > 0 && product.widthCm !== null && product.widthCm > 0
  const hasDiameter = product.diameterCm !== null && product.diameterCm > 0
  if (!hasRectangularSize && !hasDiameter) issues.push('afmetingen (hoogte en breedte, of doorsnede)')
  if (!product.depthNotApplicable && (product.depthCm === null || product.depthCm <= 0)) issues.push('diepte/dikte')
  if (!product.materials?.length) issues.push('materialen')
  if (!product.careInstructions?.trim()) issues.push('onderhoud')
  if (product.fragile === null) issues.push('kwetsbaarheid')
  if (!product.handmadeVariationNotice?.trim()) issues.push('handgemaakte afwijkingen')
  if (!product.pickupAllowed && !product.shippingAllowed) issues.push('afhalen of verzenden toegestaan')
  if (product.processingDays === null || product.processingDays < 0) issues.push('verwerkingstermijn')
  if (!product.deliveryTime?.trim()) issues.push('verwachte levertijd')
  if (product.shippingAllowed) {
    if (!product.shippingRegions?.length) issues.push('verzendregio')
    if (product.shippingCostCents === null || product.shippingCostCents < 0) issues.push('verzendkosten')
  }
  return issues
}

export const productReadinessReport = (product: Product) => ({
  productId: product.id,
  title: product.title,
  ready: productReadinessIssues(product).length === 0,
  missing: productReadinessIssues(product),
})
