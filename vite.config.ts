import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'
import { indexableSeoRoutes, seoRoutes, type SeoRoute } from './src/data/seo'
import { siteDetails } from './src/data/siteDetails'
import { absoluteProductImage, canonicalProductUrl, COMPOSITE_SYNTHETIC_URI, merchantProducts, SOCIAL_STORY_LINE, SHIPPING_COST_CENTS } from './src/data/reach'
import { productImage, products } from './src/data/products'

const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const jsonForHtml = (value: unknown) => JSON.stringify(value).replaceAll('<', '\\u003c')
const escapeXml = (value: string) => escapeHtml(value).replaceAll("'", '&apos;')
const titleLines = (title: string) => {
  const words = title.split(' ')
  const lines: string[] = []
  for (const word of words) {
    const current = lines.at(-1)
    if (!current || (current.length + word.length + 1 > 18 && lines.length < 2)) lines.push(word)
    else lines[lines.length - 1] = `${current} ${word}`
  }
  return lines.slice(0, 2)
}
const canonical = (route: SeoRoute) => `${siteDetails.url}${route.path === '/' ? '/' : route.path}`
const sitemapImages = (route: SeoRoute) => {
  const product = route.type === 'product' ? products.find((item) => route.path === `/werk/${item.slug}`) : undefined
  const images = product ? [route.image, absoluteProductImage(product)] : [route.image]
  return [...new Set(images)].map((image) => `<image:image><image:loc>${escapeXml(image)}</image:loc><image:title>${escapeXml(route.heading)}</image:title><image:caption>${escapeXml(product ? `${product.title}, handgemaakt door Jannie van Zanten.` : route.description)}</image:caption></image:image>`).join('')
}

const renderRoute = (template: string, route: SeoRoute) => {
  const title = escapeHtml(route.title)
  const description = escapeHtml(route.description)
  const tags = [
    `<link rel="canonical" href="${canonical(route)}" />`,
    `<meta name="robots" content="${route.indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'}" />`,
    `<meta property="og:title" content="${title}" />`, `<meta property="og:description" content="${description}" />`,
    `<meta property="og:type" content="${route.type === 'product' ? 'product' : 'website'}" />`, `<meta property="og:url" content="${canonical(route)}" />`,
    `<meta property="og:image" content="${escapeHtml(route.image)}" />`, `<meta property="og:image:secure_url" content="${escapeHtml(route.image)}" />`, `<meta property="og:image:alt" content="${escapeHtml(route.heading)}" />`,
    ...(route.type === 'product' ? ['<meta property="og:image:width" content="1200" />', '<meta property="og:image:height" content="630" />', '<meta property="og:image:type" content="image/jpeg" />'] : []),
    ...(route.type === 'product' && route.price !== undefined ? [`<meta property="product:price:amount" content="${route.price.toFixed(2)}" />`, '<meta property="product:price:currency" content="EUR" />'] : []),
    '<meta name="twitter:card" content="summary_large_image" />', `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`, `<meta name="twitter:image" content="${escapeHtml(route.image)}" />`,
    route.structuredData ? `<script id="prerender-structured-data" type="application/ld+json">${jsonForHtml(route.structuredData)}</script>` : '',
  ].filter(Boolean).join('\n    ')
  return template
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${description}" />`)
    .replace('</head>', `    ${tags}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"><main><h1>${escapeHtml(route.heading)}</h1><p>${description}</p><nav aria-label="Belangrijke pagina's"><a href="/">Begin</a> · <a href="/veld">Jannies verhaal</a> · <a href="/webshop">Webshop</a> · <a href="/evenementen">Evenementen</a>${route.type === 'product' ? ' · <a href="/webshop">Meer werken</a>' : ''}</nav></main></div>`)
}

const prerenderPlugin = (): Plugin => ({
  name: 'stilte-en-draad-prerender',
  apply: 'build',
  async closeBundle() {
    const dist = resolve('dist')
    const template = await readFile(resolve(dist, 'index.html'), 'utf8')
    for (const route of seoRoutes) {
      const target = route.path === '/' ? resolve(dist, 'index.html') : resolve(dist, `${route.path.slice(1)}.html`)
      await mkdir(dirname(target), { recursive: true })
      await writeFile(target, renderRoute(template, route))
    }
    const notFound = { path: '/404', title: 'Pagina niet gevonden · Stilte & Draad', description: 'Deze pagina bestaat niet. Keer terug naar het begin van Stilte & Draad.', heading: 'Pagina niet gevonden', image: `${siteDetails.url}/photos/droom-jannie.jpg`, indexable: false } satisfies SeoRoute
    await writeFile(resolve(dist, '404.html'), renderRoute(template, notFound))
    const lastmod = new Date().toISOString().slice(0, 10)
    const verifiedProductImages = new Set<string>()
    for (const product of merchantProducts) {
      const source = resolve('public', productImage(product).split('?')[0].slice(1))
      if (!verifiedProductImages.has(source)) {
        const metadata = await sharp(source).metadata()
        if (!metadata.xmp?.includes(Buffer.from(COMPOSITE_SYNTHETIC_URI))) {
          throw new Error(`Merchant-afbeelding mist IPTC DigitalSourceType CompositeSynthetic: ${source}`)
        }
        verifiedProductImages.add(source)
      }
      const output = resolve(dist, 'social', 'products', `${product.slug}.jpg`)
      await mkdir(dirname(output), { recursive: true })
      const photo = await sharp(source).resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 86 }).toBuffer()
      const title = titleLines(product.title).map(escapeHtml)
      const titleSvg = title.map((line, index) => `<tspan x="755" dy="${index === 0 ? 0 : 52}">${line}</tspan>`).join('')
      const price = product.price % 1 === 0 ? `€ ${product.price}` : `€ ${product.price.toFixed(2).replace('.', ',')}`
      const overlay = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0.35" stop-color="#191510" stop-opacity="0.02"/><stop offset="1" stop-color="#191510" stop-opacity="0.9"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><rect x="705" y="70" width="420" height="490" rx="24" fill="#f3efe6" fill-opacity="0.94"/><text x="755" y="145" font-family="Arial,sans-serif" font-size="20" letter-spacing="5" fill="#6f604c">STILTE &amp; DRAAD</text><text x="755" y="235" font-family="Georgia,serif" font-size="42" fill="#2c251d">${titleSvg}</text><text x="755" y="345" font-family="Arial,sans-serif" font-size="34" fill="#2c251d">${price}</text><line x1="755" y1="380" x2="835" y2="380" stroke="#b89a68" stroke-width="3"/><text x="755" y="425" font-family="Arial,sans-serif" font-size="19" fill="#5e554a">Handgemaakt door Jannie</text><text x="755" y="460" font-family="Arial,sans-serif" font-size="18" fill="#5e554a">met een eigen fysiek verhaal</text><text x="755" y="520" font-family="Arial,sans-serif" font-size="16" fill="#746b60">stilte-en-draad.nl</text></svg>`)
      await sharp(photo).composite([{ input: overlay }]).jpeg({ quality: 88, progressive: true }).toFile(output)
    }
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${indexableSeoRoutes.map((route) => `  <url><loc>${canonical(route)}</loc><lastmod>${lastmod}</lastmod>${sitemapImages(route)}</url>`).join('\n')}\n</urlset>\n`
    await writeFile(resolve(dist, 'sitemap.xml'), sitemap)
    const feed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0"><channel><title>Stilte &amp; Draad</title><link>${siteDetails.url}</link><description>Handgemaakte textielwerken van Jannie van Zanten.</description>${merchantProducts.map((product) => `<item><g:id>sd-${product.id}</g:id><g:title>${escapeXml(product.title)}</g:title><g:description>${escapeXml(product.description)}</g:description><g:link>${escapeXml(canonicalProductUrl(product))}</g:link><g:image_link>${escapeXml(absoluteProductImage(product))}</g:image_link><g:price>${product.price.toFixed(2)} EUR</g:price><g:availability>in_stock</g:availability><g:condition>new</g:condition><g:brand>Stilte &amp; Draad</g:brand><g:identifier_exists>no</g:identifier_exists><g:shipping><g:country>NL</g:country><g:service>Verzending binnen Nederland</g:service><g:price>${(SHIPPING_COST_CENTS / 100).toFixed(2)} EUR</g:price></g:shipping><g:custom_label_0>${escapeXml(SOCIAL_STORY_LINE)}</g:custom_label_0></item>`).join('')}</channel></rss>\n`
    await writeFile(resolve(dist, 'google-merchant-feed.xml'), feed)
    await writeFile(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteDetails.url}/sitemap.xml\n`)
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), prerenderPlugin()],
})
