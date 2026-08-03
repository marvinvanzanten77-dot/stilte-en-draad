import { formatCents } from '../utils/money'

export const busFunding = {
  currentCents: 0,
  goalCents: 2_500_000,
  goalLabel: 'Aanschaf en verbouwing van het rijdende atelier',
} as const

export const formatFundingAmount = formatCents
