import { useEffect } from 'react'
import { readConsent } from '../utils/consent'

const SESSION_KEY = 'stilte-draad-analytics-session'

const sessionKey = () => {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const value = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, value)
    return value
  } catch {
    return null
  }
}

const shouldTrack = () => {
  try {
    return readConsent(localStorage)?.analytics === true
  } catch {
    return false
  }
}

const track = () => {
  if (!shouldTrack()) return
  const visitorKey = sessionKey()
  if (!visitorKey) return
  void fetch('/api/analytics/collect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: window.location.pathname, visitorKey }),
    keepalive: true,
  }).catch(() => undefined)
}

const AnalyticsTracker = () => {
  useEffect(() => {
    track()
    const onRoute = () => track()
    const onConsent = () => track()
    window.addEventListener('popstate', onRoute)
    window.addEventListener('stilte-draad:navigation', onRoute)
    window.addEventListener('stilte-draad:consent-saved', onConsent)
    return () => {
      window.removeEventListener('popstate', onRoute)
      window.removeEventListener('stilte-draad:navigation', onRoute)
      window.removeEventListener('stilte-draad:consent-saved', onConsent)
    }
  }, [])
  return null
}

export default AnalyticsTracker
