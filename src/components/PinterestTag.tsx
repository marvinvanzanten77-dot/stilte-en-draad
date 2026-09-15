import { useEffect } from 'react'
import { readConsent } from '../utils/consent'

const PINTEREST_TAG_ID = '2613527991475'
const PINTEREST_SCRIPT_ID = 'pinterest-tag-script'

declare global {
  interface Window {
    pintrk?: ((...args: unknown[]) => void) & { queue?: unknown[][]; version?: string }
  }
}

const loadPinterestTag = () => {
  if (window.pintrk) {
    window.pintrk('page')
    return
  }

  const pintrk = ((...args: unknown[]) => {
    pintrk.queue!.push(args)
  }) as NonNullable<Window['pintrk']>
  pintrk.queue = []
  pintrk.version = '3.0'
  window.pintrk = pintrk

  const script = document.createElement('script')
  script.id = PINTEREST_SCRIPT_ID
  script.async = true
  script.src = 'https://s.pinimg.com/ct/core.js'
  document.head.appendChild(script)
  pintrk('load', PINTEREST_TAG_ID)
  pintrk('page')
}

const PinterestTag = () => {
  useEffect(() => {
    const enable = () => {
      if (readConsent(localStorage)?.marketing) loadPinterestTag()
    }
    enable()
    window.addEventListener('consent-updated', enable)
    return () => window.removeEventListener('consent-updated', enable)
  }, [])

  return null
}

export default PinterestTag