export const parseEuroAmountToCents = (input: string): number | null => {
  const normalized = input.trim().replace(',', '.')
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null
  const [euros, decimals = ''] = normalized.split('.')
  const cents = Number(euros) * 100 + Number(decimals.padEnd(2, '0'))
  return Number.isSafeInteger(cents) ? cents : null
}

const wholeEuroFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
const centFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatCents = (cents: number) => {
  if (!Number.isSafeInteger(cents)) throw new RangeError('Een geldbedrag moet in hele centen worden opgegeven.')
  return (Math.abs(cents) % 100 === 0 ? wholeEuroFormatter : centFormatter).format(cents / 100)
}
