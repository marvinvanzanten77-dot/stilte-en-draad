import { randomUUID } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { enforceOrigin, enforceRateLimit, json, method, safeError } from '../_lib/http.js'
import { createWithdrawalRequest } from '../_lib/store.js'

const schema = z.object({
  orderNumber: z.string().trim().min(8).max(80),
  email: z.email().max(254),
  scope: z.enum(['full', 'partial']),
  itemDescription: z.string().trim().max(500).optional(),
  idempotencyKey: z.uuid(),
}).superRefine((value, context) => {
  if (value.scope === 'partial' && !value.itemDescription) {
    context.addIssue({ code: 'custom', path: ['itemDescription'], message: 'Beschrijf welk werk je wilt retourneren.' })
  }
})

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!method(request, response, 'POST')) return
  try {
    const baseUrl = process.env.APP_BASE_URL?.trim() || 'http://127.0.0.1:5173'
    if (!enforceOrigin(request, response, baseUrl)) return
    if (!await enforceRateLimit(request, response, 'withdrawal-create', 5, 15 * 60)) return
    const input = schema.parse(request.body)
    const id = randomUUID()
    const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
    const result = await createWithdrawalRequest({
      id,
      requestNumber: `HER-${date}-${id.slice(0, 8).toUpperCase()}`,
      idempotencyKey: input.idempotencyKey,
      orderNumber: input.orderNumber,
      email: input.email,
      scope: input.scope,
      itemDescription: input.itemDescription || null,
    })
    return json(response, 201, {
      requestNumber: result.request_number,
      receivedAt: result.received_at,
      confirmationQueued: true,
    })
  } catch (error) {
    return safeError(response, error)
  }
}
