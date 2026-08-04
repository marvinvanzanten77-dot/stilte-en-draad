export type ProductCategory = 'Wandwerken' | 'Tassen' | 'Woontextiel' | 'Objecten'

export type Product = {
  id: number
  imageId: number
  slug: string
  title: string
  category: ProductCategory
  description: string
  price: number
  status: 'beschikbaar' | 'verkocht'
  readiness: 'draft' | 'display_only' | 'purchasable' | 'sold'
  unique: boolean
  duplicateOfProductId: number | null
  stock: number
  heightCm: number | null
  widthCm: number | null
  depthCm: number | null
  depthNotApplicable: boolean
  diameterCm: number | null
  weightGrams: number | null
  materials: string[] | null
  careInstructions: string | null
  fragile: boolean | null
  shippingClass: string | null
  processingDays: number | null
  deliveryTime: string | null
  pickupAllowed: boolean
  shippingAllowed: boolean
  shippingRegions: string[] | null
  shippingCostCents: number | null
  handmadeVariationNotice: string | null
  certificate: { prefix: string }
}

type ProductEntry = Pick<Product, 'id' | 'title' | 'category' | 'description' | 'price'>
const entries: ProductEntry[] = [
  { id: 1, title: 'Zacht Begin', category: 'Wandwerken', description: 'Een verstild rond werk in poederroze, als het eerste licht van een nieuwe ochtend.', price: 49 },
  { id: 2, title: 'Dromen van Water', category: 'Wandwerken', description: 'Blauwe draden bewegen van licht naar donker en dragen de rust van kabbelend water.', price: 45 },
  { id: 3, title: 'Vrije Lucht', category: 'Wandwerken', description: 'Een open weefsel waarin kralen en veren herinneren aan loslaten en opnieuw ademhalen.', price: 45 },
  { id: 4, title: 'Getijden', category: 'Wandwerken', description: 'Koele cirkels en zachte kwasten volgen het ritme van komen, blijven en weer verdergaan.', price: 45 },
  { id: 5, title: 'Tussen Blad en Bloei', category: 'Wandwerken', description: 'Lila, groen en aarde ontmoeten elkaar in een werk over groei op een eigen tempo.', price: 79 },
  { id: 6, title: 'Kleine Herinneringen', category: 'Objecten', description: 'Een fijn werk van roze draad en kralen, opgebouwd als een ketting van dierbare momenten.', price: 25 },
  { id: 7, title: 'Onbezorgd', category: 'Wandwerken', description: 'Heldere roze veren vangen een speelse gedachte die nog even in de kamer mag blijven.', price: 25 },
  { id: 8, title: 'Diep Water', category: 'Wandwerken', description: 'Een groot gelaagd werk in blauw, wit en groen waarin iedere ring een nieuwe diepte opent.', price: 125 },
  { id: 9, title: 'Avondtas', category: 'Tassen', description: 'Een krachtige donkere tas waarin zacht handwerk en een heldere vorm elkaar vasthouden.', price: 69 },
  { id: 10, title: 'Alle Kleuren van Toen', category: 'Woontextiel', description: 'Een royaal kleurveld van herinneringen, rij voor rij samengebracht tot warmte.', price: 70 },
  { id: 11, title: 'Zand aan Zee', category: 'Tassen', description: 'Een lichte handtas in natuurlijke tonen, met het gevoel van warme dagen aan de kust.', price: 49 },
  { id: 12, title: 'Zon in Huis', category: 'Woontextiel', description: 'Een zacht kussen waarin gele bloemen licht brengen op stille dagen.', price: 25 },
  { id: 13, title: 'Onbezorgd II', category: 'Wandwerken', description: 'Een tweede, uitbundige vertaling van een lichte gedachte in roze draad en veren.', price: 75 },
  { id: 14, title: 'Aan de Tak', category: 'Wandwerken', description: 'Hout, draad en kralen vormen samen een rustige lijn tussen natuur en handwerk.', price: 39 },
  { id: 15, title: 'Thuisgrond', category: 'Tassen', description: 'Een stevige lichte tas in zandtinten, gemaakt voor alles wat onderweg mee naar huis gaat.', price: 75 },
  { id: 16, title: 'Dichtbij', category: 'Tassen', description: 'Een compacte tas in warme aarde, met grote steken die nabijheid bijna tastbaar maken.', price: 59 },
  { id: 18, title: 'Bloesemtasje', category: 'Tassen', description: 'Een kleine tas als draagbare herinnering aan kleur, lente en onverwachte vrolijkheid.', price: 35 },
  { id: 19, title: 'Veld in de Wind', category: 'Objecten', description: 'Een waaier van zachte pluimen vangt het gouden licht van een veld vlak voor de avond.', price: 89 },
  { id: 20, title: 'Zomerdag', category: 'Tassen', description: 'Een kleurrijke schoudertas voor lichte dagen, buitenlucht en bloemen langs de weg.', price: 69 },
  { id: 21, title: 'Nachtgetij', category: 'Wandwerken', description: 'Lange blauwe draden bewegen onder een open cirkel, als de zee wanneer het huis stil wordt.', price: 45 },
  { id: 22, title: 'Groene Adem', category: 'Wandwerken', description: 'Een open groen draadwerk dat licht en lucht doorlaat, als nieuw blad dat voorzichtig ruimte inneemt.', price: 25 },
  { id: 23, title: 'Nachtlijn', category: 'Tassen', description: 'Een donkere handgemaakte tas met een rustige vorm, stevig genoeg voor onderweg en zacht genoeg om dichtbij te dragen.', price: 49 },
  { id: 24, title: 'Roze Ochtend', category: 'Wandwerken', description: 'Roze draden, houten kralen en zachte kwasten komen samen in een werk over lichtheid en opnieuw beginnen.', price: 25 },
  { id: 25, title: 'Stille Zon', category: 'Wandwerken', description: 'Een open cirkel in warme zandtinten, met lange draden die het licht vangen en de ruimte zacht laten ademen.', price: 49 },
]

const slugify = (title: string) => title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const productUpdates: Record<number, Partial<Product>> = {
  1: { status: 'verkocht', readiness: 'sold', stock: 0, materials: ['katoen'], depthNotApplicable: true },
  2: { readiness: 'purchasable', diameterCm: 35, materials: ['wol'], depthNotApplicable: true, careInstructions: 'Uitsluitend bestemd voor gebruik binnenshuis.' },
  3: { readiness: 'purchasable', diameterCm: 30, materials: ['wol'], depthNotApplicable: true, careInstructions: 'Uitsluitend bestemd voor gebruik binnenshuis.' },
  4: { readiness: 'purchasable', diameterCm: 36, materials: ['wol'], depthNotApplicable: true, careInstructions: 'Uitsluitend bestemd voor gebruik binnenshuis.' },
  5: { status: 'verkocht', readiness: 'sold', stock: 0, depthNotApplicable: true },
  6: { readiness: 'purchasable', diameterCm: 16, imageId: 24, materials: ['katoen'], depthNotApplicable: true, careInstructions: 'Uitsluitend bestemd voor gebruik binnenshuis.' },
  7: { readiness: 'purchasable', diameterCm: 16, imageId: 6, materials: ['katoen'], depthNotApplicable: true, careInstructions: 'Uitsluitend bestemd voor gebruik binnenshuis.' },
  8: { readiness: 'purchasable', diameterCm: 80, materials: ['wol'], depthNotApplicable: true, careInstructions: 'Uitsluitend bestemd voor gebruik binnenshuis.' },
  9: { status: 'verkocht', readiness: 'sold', stock: 0, materials: ['polyester'] },
  10: { readiness: 'purchasable', heightCm: 110, widthCm: 110, materials: ['wol'], depthNotApplicable: true, careInstructions: 'Voorzichtig luchten en plaatselijk met de hand reinigen; niet in de wasmachine.' },
  11: { materials: ['polyester'], careInstructions: 'Niet te zwaar vullen om vorm en handwerk te behouden.' },
  12: { readiness: 'purchasable', heightCm: 40, widthCm: 40, depthCm: 17, materials: ['wol'], careInstructions: 'Voorzichtig luchten en plaatselijk met de hand reinigen; niet in de wasmachine.' },
  13: { readiness: 'purchasable', diameterCm: 105, depthCm: 4, materials: ['touw', 'drijfhout'], careInstructions: 'Uitsluitend bestemd voor gebruik binnenshuis.' },
  14: { diameterCm: 16, duplicateOfProductId: 7, materials: ['katoen'], depthNotApplicable: true, careInstructions: 'Uitsluitend bestemd voor gebruik binnenshuis.' },
  15: { status: 'verkocht', readiness: 'sold', stock: 0 },
  16: { status: 'verkocht', readiness: 'sold', stock: 0 },
  18: { readiness: 'purchasable', unique: false, stock: 2, widthCm: 32, heightCm: 32, depthCm: 18, materials: ['wol'], careInstructions: 'Niet te zwaar vullen om vorm en handwerk te behouden.' },
  19: { readiness: 'purchasable', widthCm: 155, heightCm: 100, depthCm: 16, materials: ['pampagras'], fragile: true, careInstructions: 'Voorzichtig behandelen; het pampagras is fragiel.' },
  20: { readiness: 'purchasable', widthCm: 32, heightCm: 32, depthCm: 18, materials: ['wol'], careInstructions: 'Niet te zwaar vullen om vorm en handwerk te behouden.' },
  21: { readiness: 'purchasable', diameterCm: 30, materials: ['katoen', 'wol'], depthNotApplicable: true, careInstructions: 'Uitsluitend bestemd voor gebruik binnenshuis.' },
  22: { readiness: 'purchasable', diameterCm: 16, materials: ['katoen'], depthNotApplicable: true, careInstructions: 'Uitsluitend bestemd voor gebruik binnenshuis.' },
  23: { widthCm: 34, heightCm: 17, materials: ['polyester'], careInstructions: 'Niet te zwaar vullen om vorm en handwerk te behouden.' },
  24: { readiness: 'purchasable', diameterCm: 25, materials: ['katoen'], depthNotApplicable: true, careInstructions: 'Uitsluitend bestemd voor gebruik binnenshuis.' },
  25: { readiness: 'purchasable', diameterCm: 40, materials: ['katoen'], depthNotApplicable: true, careInstructions: 'Uitsluitend bestemd voor gebruik binnenshuis.' },
}

export const products: Product[] = entries.map<Product>((product) => ({
  ...product,
  imageId: product.id,
  slug: slugify(product.title),
  status: 'beschikbaar',
  readiness: 'display_only',
  unique: true,
  duplicateOfProductId: null,
  stock: 1,
  heightCm: null,
  widthCm: null,
  depthCm: null,
  depthNotApplicable: false,
  diameterCm: null,
  weightGrams: null,
  materials: null,
  careInstructions: null,
  fragile: false,
  shippingClass: null,
  processingDays: 2,
  deliveryTime: 'Verzending binnen Nederland of afhalen op afspraak in IJzendoorn.',
  pickupAllowed: true,
  shippingAllowed: true,
  shippingRegions: ['NL'],
  shippingCostCents: 695,
  handmadeVariationNotice: 'Dit werk is met de hand gemaakt. Kleine onregelmatigheden horen bij het materiaal en maken ieder exemplaar eigen.',
  certificate: { prefix: 'S&D' },
})).map((product) => ({ ...product, ...(productUpdates[product.id] ?? {}) }))
export const productCategories = ['Alles', 'Wandwerken', 'Tassen', 'Woontextiel', 'Objecten'] as const
export const getProduct = (slug: string) => products.find((product) => product.slug === slug)
const imageRevision = (product: Product) => product.imageId === 3 || product.imageId >= 22 ? '?v=20260727-source-2' : ''
const optimizedImageIds = new Set([3, 22, 23, 24, 25])
const productImageExtension = (product: Product) => optimizedImageIds.has(product.imageId) ? 'webp' : 'jpg'
export const productImage = (product: Product) => `/products/${product.imageId}.${productImageExtension(product)}${imageRevision(product)}`
export const productThumbnail = (product: Product) => `/products/thumbs/${product.imageId}.${productImageExtension(product)}${imageRevision(product)}`
