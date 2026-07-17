import { useEffect, useState } from 'react'

type Consent = { necessary: true; analytics: boolean; marketing: boolean; savedAt: string }
const storageKey = 'stilte-draad-cookie-consent'

const CookieConsent = () => {
  const [open, setOpen] = useState(() => !localStorage.getItem(storageKey))
  const [details, setDetails] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const reopen = () => setOpen(true)
    window.addEventListener('open-cookie-settings', reopen)
    return () => window.removeEventListener('open-cookie-settings', reopen)
  }, [])

  const save = (choice: Pick<Consent, 'analytics' | 'marketing'>) => {
    const consent: Consent = { necessary: true, ...choice, savedAt: new Date().toISOString() }
    localStorage.setItem(storageKey, JSON.stringify(consent))
    setAnalytics(choice.analytics)
    setMarketing(choice.marketing)
    setOpen(false)
  }

  if (!open) return null
  return (
    <div className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-2xl border border-[#c6a978]/60 bg-[#f8f4ec]/95 p-5 shadow-2xl backdrop-blur-md sm:bottom-6 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
      <div className="flex gap-4"><div aria-hidden="true" className="mt-1 h-10 w-10 shrink-0 rounded-full border border-[#c6a978] bg-[radial-gradient(circle,#c6a978_1px,transparent_1.5px)] [background-size:6px_6px]" /><div><h2 id="cookie-title" className="text-sm font-semibold uppercase tracking-[0.16em]">Ruimte voor jouw keuze</h2><p className="mt-2 text-sm leading-6 text-neutral-600">We gebruiken noodzakelijke browseropslag voor je winkelmand, favorieten en cookievoorkeur. Analyse- en marketingcookies zijn nog niet actief.</p></div></div>
      {details && <div className="mt-5 grid gap-3 rounded-xl bg-[#e7ddc9]/45 p-4 text-sm sm:grid-cols-3">
        <label className="rounded-lg bg-white/35 p-3"><span className="flex items-center justify-between font-medium">Noodzakelijk <input type="checkbox" checked disabled /></span><span className="mt-2 block text-xs leading-5 text-neutral-500">Winkelmand, favorieten en jouw keuze.</span></label>
        <label className="rounded-lg bg-white/35 p-3"><span className="flex items-center justify-between font-medium">Analyse <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} /></span><span className="mt-2 block text-xs leading-5 text-neutral-500">Niet actief; voorbereid voor privacyvriendelijke statistiek.</span></label>
        <label className="rounded-lg bg-white/35 p-3"><span className="flex items-center justify-between font-medium">Marketing <input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} /></span><span className="mt-2 block text-xs leading-5 text-neutral-500">Niet actief; geen advertentietracking.</span></label>
      </div>}
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setDetails((value) => !value)} className="rounded-full px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] underline underline-offset-4">{details ? 'Minder tonen' : 'Zelf instellen'}</button><button type="button" onClick={() => save({ analytics: false, marketing: false })} className="rounded-full border border-neutral-800/20 px-4 py-2.5 text-[10px] uppercase tracking-[0.14em]">Alleen noodzakelijk</button>{details ? <button type="button" onClick={() => save({ analytics, marketing })} className="rounded-full bg-neutral-900 px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-white">Voorkeur opslaan</button> : <button type="button" onClick={() => save({ analytics: true, marketing: true })} className="rounded-full bg-neutral-900 px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-white">Alles toestaan</button>}</div>
    </div>
  )
}

export default CookieConsent
