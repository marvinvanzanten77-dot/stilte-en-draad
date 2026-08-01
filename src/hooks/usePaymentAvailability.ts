import { useEffect, useState } from 'react'

type PaymentAvailability = {
  loading: boolean
  available: boolean
  donationAvailable: boolean
  mode?: 'test' | 'live' | null
  message: string | null
  configuration?: string[]
  donationConfiguration?: string[]
  donationConfirmThresholdCents?: number | null
}

const initial: PaymentAvailability = {
  loading: true,
  available: false,
  donationAvailable: false,
  message: null,
}

export const usePaymentAvailability = () => {
  const [state, setState] = useState(initial)
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/payments/config', { cache: 'no-store', signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((body: Omit<PaymentAvailability, 'loading'>) => setState({ ...body, loading: false }))
      .catch(() => setState({ ...initial, loading: false, message: 'Online betalen wordt zorgvuldig voorbereid en is tijdelijk nog niet beschikbaar.' }))
    return () => controller.abort()
  }, [])
  return state
}
