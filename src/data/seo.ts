import { products, productImage } from './products'
import { siteDetails } from './siteDetails'
import { events } from './events'
import { absoluteProductImage, isMerchantProduct, socialProductImage, SHIPPING_COST_CENTS } from './reach'

export type SeoRoute = {
  path: string
  title: string
  description: string
  heading: string
  image: string
  indexable: boolean
  type?: 'website' | 'product'
  price?: number
  structuredData?: Record<string, unknown> | Record<string, unknown>[]
}

const url = siteDetails.url
const defaultImage = `${url}/photos/droom-jannie.jpg`
const page = (path: string, title: string, description: string, heading = title, image = defaultImage, indexable = true): SeoRoute => ({ path, title: `${title} · Stilte & Draad`, description, heading, image, indexable, type: 'website' })

const publicPages: SeoRoute[] = [
  page('/', 'Stilte & Draad door Jannie', 'Ontdek handgemaakte textielkunst, spoken word en levensverhalen van Jannie van Zanten uit IJzendoorn in de Betuwe.', 'Handgemaakte textielkunst met een eigen verhaal'),
  page('/veld', 'Veld', 'Reis door de plekken en levensverhalen die het textielwerk van Jannie van Zanten hebben gevormd.', 'Veld · de levensreis van Jannie', `${url}/photos/jannie-schommelbank-tuin.jpg`),
  page('/droom', 'Droom', 'Een verstilde ruimte over dromen, doorgaan en de draden die een mens levend houden.', 'Droom · blijven bewegen naar wat roept', `${url}/photos/droom-jannie.jpg`),
  page('/ritueel', 'Ritueel', 'Over aardse rituelen, bewustzijn en het aandachtig maken van handgemaakte textielkunst.', 'Ritueel · aandacht in iedere handeling', `${url}/photos/jannie-handen-haken.jpg`),
  page('/stilte', 'Stilte', 'Luister naar Jannies spoken word over innerlijke stilte, ruimte en de draad die zichtbaar wordt wanneer het lawaai verdwijnt.', 'Stilte · waar ideeën en dromen ademen', `${url}/photos/stilte-jannie.jpg`),
  page('/webshop', 'Webshop met textielkunst', 'Bekijk unieke haakwerken, gehaakte wanddecoratie, handgemaakte dromenvangers en tassen van Jannie, ieder met een eigen fysieke tekst.', 'Unieke handgemaakte textielkunst van Jannie', `${url}/products/3.webp`),
  page('/evenementen', 'Evenementen', 'Ontmoet Jannie en Stilte & Draad op markten, festivals en exposities in de Betuwe en daarbuiten.', 'Evenementen met Stilte & Draad', `${url}/events/grietmarkt-amerongen-2026.webp`),
  page('/de-laatste-draad', 'De Laatste Draad', 'Een filmisch slot over eindigen, loslaten en ruimte maken voor een nieuw begin.', 'De Laatste Draad · eindigen is loslaten', `${url}/photos/de-laatste-draad.jpg`),
  page('/contact', 'Contact', 'Neem contact op over de textielkunst, verhalen, bestellingen en evenementen van Stilte & Draad.', 'Contact met Stilte & Draad'),
  page('/privacy', 'Privacyverklaring', 'Lees hoe Stilte & Draad zorgvuldig omgaat met persoonsgegevens, betalingen, e-mail en browseropslag.', 'Privacyverklaring'),
  page('/algemene-voorwaarden', 'Algemene voorwaarden', 'Lees de voorwaarden voor unieke handgemaakte werken, betaling, levering, afhalen en retourneren bij Stilte & Draad.', 'Algemene voorwaarden'),
  page('/doneren', 'Doneer aan het rijdende atelier', 'Help mee aan de aanschaf en verbouwing van de bus waarmee Jannies textielkunst en verhalen naar markten en festivals reizen.', 'Bouw mee aan het rijdende atelier'),
]

const breadcrumb = (name: string, path: string) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Stilte & Draad', item: `${url}/` },
    { '@type': 'ListItem', position: 2, name: 'Webshop', item: `${url}/webshop` },
    { '@type': 'ListItem', position: 3, name, item: `${url}${path}` },
  ],
})

const productPages: SeoRoute[] = products.filter((product) => product.duplicateOfProductId === null).map((product) => {
  const path = `/werk/${product.slug}`
  const available = product.readiness === 'purchasable' && product.status === 'beschikbaar'
  return {
    path,
    title: `${product.title} · handgemaakte textielkunst · Stilte & Draad`,
    description: `${product.description} Uniek handgemaakt werk van Jannie van Zanten, fysiek geleverd met zijn eigen bijbehorende tekst.`,
    heading: product.title,
    image: isMerchantProduct(product) ? socialProductImage(product) : absoluteProductImage(product),
    indexable: true,
    type: 'product',
    price: product.price,
    structuredData: [breadcrumb(product.title, path), {
      '@context': 'https://schema.org', '@type': 'Product', name: product.title, description: product.description,
      image: [absoluteProductImage(product), socialProductImage(product)], sku: `SD-${String(product.id).padStart(4, '0')}`,
      itemCondition: 'https://schema.org/NewCondition', brand: { '@type': 'Brand', name: 'Stilte & Draad' },
      manufacturer: { '@type': 'Person', '@id': `${url}/#jannie`, name: siteDetails.maker },
      creator: { '@type': 'Person', '@id': `${url}/#jannie`, name: siteDetails.maker },
      copyrightHolder: { '@type': 'Organization', '@id': `${url}/#organisatie`, name: siteDetails.name },
      offers: {
        '@type': 'Offer', priceCurrency: 'EUR', price: product.price.toFixed(2),
        availability: available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition', seller: { '@id': `${url}/#organisatie` }, url: `${url}${path}`,
        shippingDetails: { '@type': 'OfferShippingDetails', shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'NL' }, shippingRate: { '@type': 'MonetaryAmount', value: (SHIPPING_COST_CENTS / 100).toFixed(2), currency: 'EUR' }, deliveryTime: { '@type': 'ShippingDeliveryTime', handlingTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'DAY' } } },
        hasMerchantReturnPolicy: { '@type': 'MerchantReturnPolicy', applicableCountry: 'NL', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 14, returnMethod: 'https://schema.org/ReturnByMail', returnFees: 'https://schema.org/ReturnShippingFees' },
      },
      subjectOf: { '@type': 'ImageObject', contentUrl: absoluteProductImage(product), creator: { '@id': `${url}/#jannie` }, creditText: 'Handwerk door Jannie van Zanten; achtergrond en presentatie kunnen digitaal of met AI zijn bewerkt.', copyrightNotice: `© 2026 ${siteDetails.name}` },
    }],
  }
})

const eventsRoute = publicPages.find((route) => route.path === '/evenementen')
if (eventsRoute) eventsRoute.structuredData = events.map((event) => ({
  '@context': 'https://schema.org', '@type': 'Event', name: event.title, description: event.description,
  startDate: `${event.date}T${event.startTime}:00+02:00`, endDate: `${event.date}T${event.endTime}:00+02:00`,
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', eventStatus: 'https://schema.org/EventScheduled',
  isAccessibleForFree: true, location: { '@type': 'Place', name: event.locationNote, address: { '@type': 'PostalAddress', streetAddress: event.street, addressLocality: event.city, addressCountry: 'NL' } },
  performer: { '@type': 'Person', '@id': `${url}/#jannie`, name: siteDetails.maker },
  organizer: { '@type': 'Organization', '@id': `${url}/#organisatie`, name: siteDetails.name, url },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: `${url}/evenementen#${event.id}` },
  url: `${url}/evenementen#${event.id}`, image: new URL(event.image, url).href,
}))

export const transactionalSeoRoutes: SeoRoute[] = [
  page('/checkout', 'Veilig afrekenen', 'Rond je bestelling veilig af.', 'Veilig afrekenen', defaultImage, false),
  page('/herroepen', 'Bestelling herroepen', 'Dien veilig een herroepingsverzoek in.', 'Bestelling herroepen', defaultImage, false),
  page('/betaling', 'Betalingsstatus', 'Bekijk veilig de actuele status van je betaling.', 'Betalingsstatus', defaultImage, false),
  ...products.map((product) => page(`/certificaat/${product.slug}`, `Werkcertificaat ${product.title}`, 'Digitaal certificaat bij een werk van Stilte & Draad.', `Werkcertificaat ${product.title}`, new URL(productImage(product), url).href, false)),
]

export const seoRoutes = [...publicPages, ...productPages, ...transactionalSeoRoutes]
export const indexableSeoRoutes = seoRoutes.filter((route) => route.indexable)
export const seoForPath = (path: string) => {
  if (path.startsWith('/betaling/')) return transactionalSeoRoutes.find((route) => route.path === '/betaling')!
  return seoRoutes.find((route) => route.path === path)
}
