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
const siteUrl = 'https://www.stilte-en-draad.nl'
const defaultDescription = 'Autobiografische textielkunst, verhalen en spoken word van Jannie van Zanten.'

const setMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value))
}

function AppContent() {
  const [path, setPath] = useState(window.location.pathname)
  const firstSegment = path.split('/').filter(Boolean)[0]
  const activeZone: ZoneId = zoneIds.has(firstSegment as ZoneId) ? firstSegment as ZoneId : 'de-eerste-draad'
  const navigate = (nextPath: string) => { window.history.pushState({}, '', nextPath); setPath(nextPath); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  useEffect(() => { const onPopState = () => setPath(window.location.pathname); window.addEventListener('popstate', onPopState); return () => window.removeEventListener('popstate', onPopState) }, [])
  useEffect(() => {
    let title = 'Stilte & Draad · door Jannie'
    let description = defaultDescription
    let image = `${siteUrl}/mood-board/Golden_Atelier_Morning.png`
    const [, routeType, slug] = path.split('/')
    if (path === '/privacy') title = 'Privacy · Stilte & Draad'
    else if (path === '/algemene-voorwaarden') title = 'Algemene voorwaarden · Stilte & Draad'
    if ((routeType === 'werk' || routeType === 'certificaat') && slug) {
      const product = getProduct(slug)
      if (product) {
        title = `${product.title} · Stilte & Draad`
        description = `${product.description} Handgemaakt, uniek werk van Jannie van Zanten.`
        image = `${siteUrl}/products/${product.id}.jpg`
      }
    } else if (path !== '/privacy' && path !== '/algemene-voorwaarden') {
      const zoneTitle = zones.find((zone) => zone.id === activeZone)?.label.toLocaleLowerCase('nl-NL').replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
      title = `${zoneTitle ?? 'Stilte & Draad'} · Stilte & Draad`
    }

    document.title = title
    const canonicalUrl = `${siteUrl}${path === '/' ? '' : path}`
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl
    setMeta('meta[name="description"]', { name: 'description', content: description })
    setMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    setMeta('meta[property="og:type"]', { property: 'og:type', content: routeType === 'werk' ? 'product' : 'website' })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    setMeta('meta[property="og:image"]', { property: 'og:image', content: image })
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })

    document.getElementById('product-structured-data')?.remove()
    if (routeType === 'werk' && slug) {
      const product = getProduct(slug)
      if (product) {
        const structuredData = document.createElement('script')
        structuredData.id = 'product-structured-data'
        structuredData.type = 'application/ld+json'
        structuredData.text = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          description: product.description,
          image: `${siteUrl}/products/${product.id}.jpg`,
          sku: `SD-${String(product.id).padStart(4, '0')}`,
          brand: { '@type': 'Brand', name: 'Stilte & Draad' },
          manufacturer: { '@type': 'Person', name: 'Jannie van Zanten' },
        })
        document.head.appendChild(structuredData)
      }
    }
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
