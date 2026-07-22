import { useEffect, useState } from 'react'
import VerticalNav from './components/VerticalNav'
import ZoneContainer from './components/ZoneContainer'
import Footer from './components/Footer'
import LegalPage from './pages/LegalPage'
import ProductPage from './pages/ProductPage'
import { getProduct } from './data/products'
import { ShopProvider } from './context/ShopContext'
import { zones, type ZoneId } from './data/zones'
import CookieConsent from './components/CookieConsent'

const zoneIds = new Set(zones.map((zone) => zone.id))
const pathForZone = (zone: ZoneId) => zone === 'de-eerste-draad' ? '/' : `/${zone}`

function AppContent() {
  const [path, setPath] = useState(window.location.pathname)
  const firstSegment = path.split('/').filter(Boolean)[0]
  const activeZone: ZoneId = zoneIds.has(firstSegment as ZoneId) ? firstSegment as ZoneId : 'de-eerste-draad'
  const navigate = (nextPath: string) => { window.history.pushState({}, '', nextPath); setPath(nextPath); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  useEffect(() => { const onPopState = () => setPath(window.location.pathname); window.addEventListener('popstate', onPopState); return () => window.removeEventListener('popstate', onPopState) }, [])
  useEffect(() => {
    if (path === '/privacy') { document.title = 'Privacy · Stilte & Draad'; return }
    if (path === '/algemene-voorwaarden') { document.title = 'Algemene voorwaarden · Stilte & Draad'; return }
    const [, routeType, slug] = path.split('/')
    if ((routeType === 'werk' || routeType === 'certificaat') && slug) {
      const product = getProduct(slug)
      if (product) { document.title = `${product.title} · Stilte & Draad`; return }
    }
    const zoneTitle = zones.find((zone) => zone.id === activeZone)?.label.toLocaleLowerCase('nl-NL').replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
    document.title = `${zoneTitle ?? 'Stilte & Draad'} · Stilte & Draad`
  }, [activeZone, path])

  const renderRoute = () => {
    if (path === '/privacy') return <LegalPage type="privacy" />
    if (path === '/algemene-voorwaarden') return <LegalPage type="terms" />
    const [, routeType, slug] = path.split('/')
    if ((routeType === 'werk' || routeType === 'certificaat') && slug) {
      const product = getProduct(slug)
      if (product) return <ProductPage product={product} navigate={navigate} certificate={routeType === 'certificaat'} />
    }
    return <ZoneContainer activeZone={activeZone} navigate={navigate} />
  }

  return (
    <div className="min-h-screen">
      <a href="#inhoud" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-neutral-900 focus:px-4 focus:py-2 focus:text-white">Naar inhoud</a>
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 md:flex-row md:gap-10 md:py-10">
        <VerticalNav zones={zones} activeZone={activeZone} onSelect={(zone) => navigate(pathForZone(zone))} navigate={navigate} />
        <div className="min-w-0 flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <button type="button" onClick={() => navigate('/')} className="space-y-1 self-start text-left text-sm uppercase tracking-[0.24em] text-neutral-700"><span className="block font-semibold text-neutral-800">STILTE &amp; DRAAD</span><span className="block text-xs font-normal text-neutral-600">door Jannie</span></button>
            <div className="flex items-center gap-2.5 rounded-full border border-white/70 bg-white/65 px-3.5 py-2.5 text-neutral-600 backdrop-blur-sm" role="note" aria-label="Zet je geluid aan voor de beste ervaring">
              <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-800/15 bg-white/45 text-sm">♫</span>
              <span className="text-[9px] uppercase tracking-[0.13em]">Zet je geluid aan voor de beste ervaring</span>
            </div>
          </div>
          <main id="inhoud" tabIndex={-1}>{renderRoute()}</main>
          <Footer navigate={navigate} />
        </div>
      </div>
      <CookieConsent />
    </div>
  )
}

const App = () => <ShopProvider><AppContent /></ShopProvider>
export default App
