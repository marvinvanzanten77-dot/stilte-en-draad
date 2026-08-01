import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json, method, safeError } from '../_lib/http.js'
import { synchronizePayment } from '../_lib/mollie.js'

export const paymentId = (body: unknown) => {
  if (typeof body === 'string') return new URLSearchParams(body).get('id')
  if (body && typeof body === 'object' && 'id' in body && typeof body.id === 'string') return body.id
  return null
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!method(request, response, 'POST')) return
  try {
    const id = paymentId(request.body)
    if (!id?.startsWith('tr_')) return json(response, 400, { error: 'Ongeldige webhook.' })
    await synchronizePayment(id)
    return response.status(200).send('OK')
  } catch (error) {
    return safeError(response, error)
  }
}
