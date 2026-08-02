import { timingSafeEqual } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { processEmailOutbox } from '../_lib/email.js'
import { json } from '../_lib/http.js'
import { createResendProvider, emailConfigurationState } from '../_lib/resend.js'
import { emailOutboxRepository } from '../_lib/store.js'

export const authorized = (request: VercelRequest, secret: string) => {
  const authorization = Array.isArray(request.headers.authorization) ? request.headers.authorization[0] : request.headers.authorization
  const supplied = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
  const suppliedBuffer = Buffer.from(supplied)
  const secretBuffer = Buffer.from(secret)
  return suppliedBuffer.length === secretBuffer.length && timingSafeEqual(suppliedBuffer, secretBuffer)
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST')
    return json(response, 405, { error: 'Methode niet toegestaan.' })
  }

  const config = emailConfigurationState()
  if (!config.ready) return json(response, 503, { error: 'E-mailverzending is bewust nog niet geactiveerd.', code: 'EMAIL_UNAVAILABLE' })
  if (!authorized(request, config.cronSecret)) return json(response, 401, { error: 'Niet geautoriseerd.' })

  try {
    const result = await processEmailOutbox(createResendProvider(), emailOutboxRepository, 20)
    return json(response, 200, result)
  } catch (error) {
    console.error('E-mailverwerking mislukt', error instanceof Error ? error.name : 'UnknownError')
    return json(response, 500, { error: 'De e-mailwachtrij kon niet worden verwerkt.' })
  }
}
