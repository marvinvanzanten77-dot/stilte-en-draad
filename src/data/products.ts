export type ProductCategory = 'Wandwerken' | 'Tassen' | 'Woontextiel' | 'Objecten'

export type Product = {
  id: number
  slug: string
  title: string
  category: ProductCategory
  description: string
  price: number
  status: 'beschikbaar' | 'verkocht'
}

const entries: Array<Omit<Product, 'slug' | 'status'>> = [
  { id: 1, title: 'Zacht Begin', category: 'Wandwerken', description: 'Een verstild rond werk in poederroze, als het eerste licht van een nieuwe ochtend.', price: 89 },
  { id: 2, title: 'Dromen van Water', category: 'Wandwerken', description: 'Blauwe draden bewegen van licht naar donker en dragen de rust van kabbelend water.', price: 119 },
  { id: 3, title: 'Vrije Lucht', category: 'Wandwerken', description: 'Een open weefsel waarin kralen en veren herinneren aan loslaten en opnieuw ademhalen.', price: 139 },
  { id: 4, title: 'Getijden', category: 'Wandwerken', description: 'Koele cirkels en zachte kwasten volgen het ritme van komen, blijven en weer verdergaan.', price: 189 },
  { id: 5, title: 'Tussen Blad en Bloei', category: 'Wandwerken', description: 'Lila, groen en aarde ontmoeten elkaar in een werk over groei op een eigen tempo.', price: 149 },
  { id: 6, title: 'Kleine Herinneringen', category: 'Objecten', description: 'Een fijn werk van roze draad en kralen, opgebouwd als een ketting van dierbare momenten.', price: 69 },
  { id: 7, title: 'Onbezorgd', category: 'Wandwerken', description: 'Heldere roze veren vangen een speelse gedachte die nog even in de kamer mag blijven.', price: 59 },
  { id: 8, title: 'Diep Water', category: 'Wandwerken', description: 'Een groot gelaagd werk in blauw, wit en groen waarin iedere ring een nieuwe diepte opent.', price: 325 },
  { id: 9, title: 'Avondtas', category: 'Tassen', description: 'Een krachtige donkere tas waarin zacht handwerk en een heldere vorm elkaar vasthouden.', price: 145 },
  { id: 10, title: 'Alle Kleuren van Toen', category: 'Woontextiel', description: 'Een royaal kleurveld van herinneringen, rij voor rij samengebracht tot warmte.', price: 295 },
  { id: 11, title: 'Zand aan Zee', category: 'Tassen', description: 'Een lichte handtas in natuurlijke tonen, met het gevoel van warme dagen aan de kust.', price: 139 },
  { id: 12, title: 'Zon in Huis', category: 'Woontextiel', description: 'Een zacht kussen waarin gele bloemen licht brengen op stille dagen.', price: 95 },
  { id: 13, title: 'Onbezorgd II', category: 'Wandwerken', description: 'Een tweede, uitbundige vertaling van een lichte gedachte in roze draad en veren.', price: 59 },
  { id: 14, title: 'Aan de Tak', category: 'Wandwerken', description: 'Hout, draad en kralen vormen samen een rustige lijn tussen natuur en handwerk.', price: 125 },
  { id: 15, title: 'Thuisgrond', category: 'Tassen', description: 'Een stevige lichte tas in zandtinten, gemaakt voor alles wat onderweg mee naar huis gaat.', price: 149 },
  { id: 16, title: 'Dichtbij', category: 'Tassen', description: 'Een compacte tas in warme aarde, met grote steken die nabijheid bijna tastbaar maken.', price: 115 },
  { id: 17, title: 'Levenslijnen', category: 'Wandwerken', description: 'Tientallen kleurrijke vormen worden één geheel: afzonderlijke momenten in hetzelfde verhaal.', price: 395 },
  { id: 18, title: 'Bloesemtasje', category: 'Tassen', description: 'Een kleine tas als draagbare herinnering aan kleur, lente en onverwachte vrolijkheid.', price: 79 },
  { id: 19, title: 'Veld in de Wind', category: 'Objecten', description: 'Een waaier van zachte pluimen vangt het gouden licht van een veld vlak voor de avond.', price: 249 },
  { id: 20, title: 'Zomerdag', category: 'Tassen', description: 'Een kleurrijke schoudertas voor lichte dagen, buitenlucht en bloemen langs de weg.', price: 89 },
  { id: 21, title: 'Nachtgetij', category: 'Wandwerken', description: 'Lange blauwe draden bewegen onder een open cirkel, als de zee wanneer het huis stil wordt.', price: 219 },
]

const slugify = (title: string) => title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const products: Product[] = entries.map((product) => ({ ...product, slug: slugify(product.title), status: 'beschikbaar' }))
export const productCategories = ['Alles', 'Wandwerken', 'Tassen', 'Woontextiel', 'Objecten'] as const
export const getProduct = (slug: string) => products.find((product) => product.slug === slug)
export const productImage = (product: Product) => `/products/${product.id}.jpg`
export const productThumbnail = (product: Product) => `/products/thumbs/${product.id}.jpg`
export const formatPrice = (price: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price)
