export const busFunding = {
  currentCents: 0,
  goalCents: 2_500_000,
  goalLabel: 'Aanschaf en verbouwing van het rijdende atelier',
} as const

export const formatFundingAmount = (cents: number) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(cents / 100)
