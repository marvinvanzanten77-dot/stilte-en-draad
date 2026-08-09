import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { indexableSeoRoutes, seoRoutes, type SeoRoute } from './src/data/seo'
import { siteDetails } from './src/data/siteDetails'

const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const jsonForHtml = (value: unknown) => JSON.stringify(value).replaceAll('<', '\\u003c')
const canonical = (route: SeoRoute) => `${siteDetails.url}${route.path === '/' ? '/' : route.path}`

const renderRoute = (template: string, route: SeoRoute) => {
  const title = escapeHtml(route.title)
  const description = escapeHtml(route.description)
  const tags = [
    `<link rel="canonical" href="${canonical(route)}" />`,
    `<meta name="robots" content="${route.indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'}" />`,
    `<meta property="og:title" content="${title}" />`, `<meta property="og:description" content="${description}" />`,
    `<meta property="og:type" content="${route.type === 'product' ? 'product' : 'website'}" />`, `<meta property="og:url" content="${canonical(route)}" />`,
    `<meta property="og:image" content="${escapeHtml(route.image)}" />`, `<meta property="og:image:alt" content="${escapeHtml(route.heading)}" />`,
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
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexableSeoRoutes.map((route) => `  <url><loc>${canonical(route)}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`
    await writeFile(resolve(dist, 'sitemap.xml'), sitemap)
    await writeFile(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteDetails.url}/sitemap.xml\n`)
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), prerenderPlugin()],
})
