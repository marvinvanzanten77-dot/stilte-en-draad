import { useEffect, useState } from 'react'

export type Availability = 'available' | 'reserved' | 'sold'

export const useProductAvailability = (ids: number[]) => {
  const [availability, setAvailability] = useState<Record<number, Availability>>({})
  const key = [...ids].sort((a, b) => a - b).join(',')
  useEffect(() => {
    if (!key) return
    const controller = new AbortController()
    fetch(`/api/products/status?ids=${key}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((body: { products: Record<number, Availability> }) => setAvailability(body.products))
      .catch(() => undefined)
    return () => controller.abort()
  }, [key])
  return availability
}
