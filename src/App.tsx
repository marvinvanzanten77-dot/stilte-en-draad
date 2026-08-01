import { useEffect, useState } from 'react'
import VerticalNav from './components/VerticalNav'
import ZoneContainer from './components/ZoneContainer'
import Footer from './components/Footer'
import LegalPage from './pages/LegalPage'
import ProductPage from './pages/ProductPage'
import { getProduct, productImage } from './data/products'
import { editorialZones } from './data/editorialZones'
import { events } from './data/events'
import { ShopProvider } from './context/ShopContext'
import { zones, type ZoneId } from './data/zones'
import CookieConsent from './components/CookieConsent'
import CheckoutPage from './pages/CheckoutPage'
import DonationPage from './pages/DonationPage'
import PaymentStatusPage from './pages/PaymentStatusPage'
import ContactPage from './pages/ContactPage'
import { siteDetails } from './data/siteDetails'
import WithdrawalPage from './pages/WithdrawalPage'

const zoneIds = new Set(zones.map((zone) => zone.id))
const pathForZone = (zone: ZoneId) => zone === 'de-eerste-draad' ? '/' : `/${zone}`
const siteUrl = siteDetails.url
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
    const standaloneRoute = path === '/contact' || path === '/privacy' || path === '/algemene-voorwaarden' || path === '/herroepen' || path === '/checkout' || path === '/doneren' || path.startsWith('/betaling/')
    if (path === '/contact') {
      title = 'Contact · Stilte & Draad'
      description = `Neem contact op met ${siteDetails.name}, het atelier van ${siteDetails.owner}.`
    }
    else if (path === '/privacy') title = 'Privacy · Stilte & Draad'
    else if (path === '/algemene-voorwaarden') title = 'Algemene voorwaarden · Stilte & Draad'
    else if (path === '/herroepen') {
      title = 'Bestelling herroepen · Stilte & Draad'
      description = 'Meld digitaal dat je een online bestelling bij Stilte & Draad wilt herroepen.'
    }
    else if (path === '/checkout') title = 'Veilig afrekenen · Stilte & Draad'
    else if (path === '/doneren') title = 'Doneer aan het rijdende atelier · Stilte & Draad'
    else if (path.startsWith('/betaling/')) title = 'Betalingsstatus · Stilte & Draad'
    if ((routeType === 'werk' || routeType === 'certificaat') && slug) {
      const product = getProduct(slug)
      if (product) {
        title = `${product.title} · Stilte & Draad`
        description = `${product.description} Handgemaakt, uniek werk van Jannie van Zanten.`
        image = new URL(productImage(product), siteUrl).href
      }
    } else if (!standaloneRoute) {
      const zoneTitle = zones.find((zone) => zone.id === activeZone)?.label.toLocaleLowerCase('nl-NL').replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
      title = `${zoneTitle ?? 'Stilte & Draad'} · Stilte & Draad`
      if (activeZone in editorialZones) image = new URL(editorialZones[activeZone as keyof typeof editorialZones].heroImage, siteUrl).href
      else if (activeZone === 'evenementen') image = `${siteUrl}/photos/rijdende-atelier-concept.jpg`
      else if (activeZone === 'de-laatste-draad') image = `${siteUrl}/photos/de-laatste-draad.jpg?v=optimized-20260801`
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
    setMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: `${title} — beeld van Stilte & Draad` })
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })
    setMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: `${title} — beeld van Stilte & Draad` })

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
          image: new URL(productImage(product), siteUrl).href,
          sku: `SD-${String(product.id).padStart(4, '0')}`,
          brand: { '@type': 'Brand', name: 'Stilte & Draad' },
          manufacturer: { '@type': 'Person', name: 'Jannie van Zanten' },
        })
        document.head.appendChild(structuredData)
      }
    }
    document.getElementById('event-structured-data')?.remove()
    if (activeZone === 'evenementen') {
      const structuredData = document.createElement('script')
      structuredData.id = 'event-structured-data'
      structuredData.type = 'application/ld+json'
      structuredData.text = JSON.stringify(events.map((event) => ({
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        description: event.description,
        startDate: `${event.date}T${event.startTime}:00+02:00`,
        endDate: `${event.date}T${event.endTime}:00+02:00`,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        isAccessibleForFree: true,
        location: {
          '@type': 'Place',
          name: event.locationNote,
          address: {
            '@type': 'PostalAddress',
            streetAddress: event.street,
            addressLocality: event.city,
            addressCountry: 'NL',
          },
        },
        performer: { '@type': 'Person', name: 'Jannie van Zanten', url: `${siteUrl}/veld` },
        organizer: {
          '@type': 'Organization',
          name: siteDetails.name,
          url: siteUrl,
          email: siteDetails.email,
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}/evenementen`,
        },
        url: `${siteUrl}/evenementen#${event.id}`,
        image: new URL(event.image, siteUrl).href,
      })))
      document.head.appendChild(structuredData)
    }
  }, [activeZone, path])

  const renderRoute = () => {
    if (path === '/privacy') return <LegalPage type="privacy" />
    if (path === '/algemene-voorwaarden') return <LegalPage type="terms" />
    if (path === '/herroepen') return <WithdrawalPage />
    if (path === '/contact') return <ContactPage />
    if (path === '/checkout') return <CheckoutPage navigate={navigate} />
    if (path === '/doneren') return <DonationPage />
    if (path.startsWith('/betaling/')) return <PaymentStatusPage orderId={path.split('/')[2]} navigate={navigate} />
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
