import { timingSafeEqual } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json } from '../_lib/http.js'
import { emailConfigurationState } from '../_lib/resend.js'
import { analyticsReportAlreadySent, getAnalyticsDailySummary, markAnalyticsReportSent } from '../_lib/store.js'

const recipients = ['marvinvanzanten77@gmail.com', 'jannievanzanten@gmail.com']

const authorized = (request: VercelRequest, secret: string) => {
  const authorization = Array.isArray(request.headers.authorization) ? request.headers.authorization[0] : request.headers.authorization
  const supplied = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
  const suppliedBuffer = Buffer.from(supplied)
  const secretBuffer = Buffer.from(secret)
  return suppliedBuffer.length === secretBuffer.length && timingSafeEqual(suppliedBuffer, secretBuffer)
}

const reportDay = () => {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

const renderReport = (summary: Awaited<ReturnType<typeof getAnalyticsDailySummary>>) => {
  const routes = summary.routes.length
    ? summary.routes.map((route, index) => `${index + 1}. ${route.path} — ${route.views} weergaven`).join('\n')
    : 'Er zijn voor deze dag nog geen paginaweergaven gemeten.'
  return [
    `Dagrapport Stilte & Draad — ${summary.day}`,
    '',
    `Paginaweergaven: ${summary.totalViews}`,
    `Anonieme sessies: ${summary.uniqueVisitors}`,
    '',
    'Meest bekeken pagina’s:',
    routes,
    '',
    'Deze meting is anoniem en wordt alleen gemaakt na analyse-toestemming. Er worden geen IP-adressen, cookies of bezoekersprofielen opgeslagen.',
  ].join('\n')
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST')
    return json(response, 405, { error: 'Methode niet toegestaan.' })
  }
  const config = emailConfigurationState()
  if (!config.ready) return json(response, 503, { error: 'E-mailverzending is niet actief.', code: 'EMAIL_UNAVAILABLE' })
  if (!authorized(request, config.cronSecret)) return json(response, 401, { error: 'Niet geautoriseerd.' })

  const day = reportDay()
  const summary = await getAnalyticsDailySummary(day)
  const text = renderReport(summary)
  const results = []
  for (const recipient of recipients) {
    if (await analyticsReportAlreadySent(day, recipient)) {
      results.push({ recipient, skipped: true })
      continue
    }
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `stilte-en-draad-analytics-${day}-${recipient}`,
      },
      body: JSON.stringify({
        from: config.from,
        to: [recipient],
        subject: `Dagrapport websiteverkeer · ${day}`,
        text,
        html: `<pre style="font-family:Georgia,serif;white-space:pre-wrap;line-height:1.7;color:#2f2a24">${text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</pre>`,
        ...(config.replyTo ? { reply_to: config.replyTo } : {}),
      }),
    })
    if (!resendResponse.ok) throw new Error(`RESEND_HTTP_${resendResponse.status}`)
    const payload = await resendResponse.json().catch(() => ({})) as { id?: string }
    await markAnalyticsReportSent(day, recipient, payload.id ?? null)
    results.push({ recipient, sent: true })
  }
  return json(response, 200, { day, summary, results })
}
