import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { json, method, safeError } from '../_lib/http.js'
import { recordAnalyticsPageView } from '../_lib/store.js'

const schema = z.object({
  path: z.string().min(1).max(240),
  visitorKey: z.string().min(16).max(120).regex(/^[a-zA-Z0-9._:-]+$/),
})

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!method(request, response, 'POST')) return
  try {
    const body = schema.parse(request.body)
    await recordAnalyticsPageView(body)
    return json(response, 202, { accepted: true })
  } catch (error) {
    return safeError(response, error)
  }
}
