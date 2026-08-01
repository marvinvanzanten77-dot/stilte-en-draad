export const rateLimitAllowed = (count: number, limit: number) => count <= limit

export const isAllowedOrigin = (origin: string | undefined, baseUrl: string) => {
  if (!origin) return true
  try { return new URL(origin).origin === new URL(baseUrl).origin } catch { return false }
}
