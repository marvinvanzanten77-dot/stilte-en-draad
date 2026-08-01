import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ZodError } from 'zod'
import { rateLimit } from './store.js'
import { ConfigurationError } from './config.js'
import { isAllowedOrigin } from './security.js'

export const json = (response: VercelResponse, status: number, body: unknown) =>
  response.status(status).setHeader('Cache-Control', 'no-store').json(body)

export const method = (request: VercelRequest, response: VercelResponse, allowed: string) => {
  if (request.method === allowed) return true
  response.setHeader('Allow', allowed)
  json(response, 405, { error: 'Methode niet toegestaan.' })
  return false
}

export const clientKey = (request: VercelRequest) => {
  const forwarded = request.headers['x-forwarded-for']
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]
  return ip?.trim() || request.socket.remoteAddress || 'unknown'
}

export const enforceRateLimit = async (request: VercelRequest, response: VercelResponse, scope: string, limit = 8, seconds = 60) => {
  const allowed = await rateLimit(`${scope}:${clientKey(request)}`, limit, seconds)
  if (!allowed) json(response, 429, { error: 'Te veel pogingen. Wacht een minuut en probeer opnieuw.' })
  return allowed
}

export const enforceOrigin = (request: VercelRequest, response: VercelResponse, baseUrl: string) => {
  const origin = Array.isArray(request.headers.origin) ? request.headers.origin[0] : request.headers.origin
  if (isAllowedOrigin(origin, baseUrl)) return true
  json(response, 403, { error: 'Deze aanvraag komt niet van Stilte & Draad.' })
  return false
}

export const safeError = (response: VercelResponse, error: unknown) => {
  if (error instanceof ZodError) return json(response, 400, { error: 'Controleer de ingevulde gegevens.', fields: error.flatten().fieldErrors })
  const message = error instanceof Error ? error.message : ''
  if (message.startsWith('CHECKOUT:')) return json(response, 409, { error: message.slice(9) })
  if (message.startsWith('WITHDRAWAL:')) return json(response, 400, { error: message.slice(11) })
  if (error instanceof ConfigurationError) {
    const body: { error: string; code: string; configuration?: string[] } = { error: error.message, code: 'PAYMENTS_UNAVAILABLE' }
    if (process.env.VERCEL_ENV !== 'production') body.configuration = error.issues
    return json(response, 503, body)
  }
  console.error('Serverfout', error instanceof Error ? error.name : 'UnknownError')
  return json(response, 500, { error: 'Deze aanvraag kan op dit moment niet worden verwerkt. Probeer het later opnieuw.' })
}
