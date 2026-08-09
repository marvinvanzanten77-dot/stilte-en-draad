export type EmailMessageType = 'order_received' | 'payment_succeeded' | 'payment_failed_or_canceled' | 'payment_review' | 'donation_confirmed' | 'withdrawal_received'

export type EmailMessage = { outboxId: number; orderId: string; type: EmailMessageType; recipient: string; payload: Record<string, unknown> }
export type EmailContent = { subject: string; text: string; html: string }
export interface EmailProvider { send(message: EmailMessage): Promise<void> }
export interface EmailOutboxRepository { pending(limit: number): Promise<EmailMessage[]>; sent(outboxId: number): Promise<void>; failed(outboxId: number, retryAt: Date, errorCode: string): Promise<void> }

const replyTo = 'marvinvanzanten77@gmail.com'
const seller = 'Marvin van Zanten · Innerverse Studio · Stilte & Draad'
const personalSignOff = 'Liefs,\nJannie\nStilte & Draad'
const companionStory = 'Bij ieder gekocht werk ontvang je ook fysiek de eigen bijbehorende tekst van Jannie: de quote, het verhaal, gedicht of de spoken-wordtekst waaruit het werk is ontstaan.'

const payloadString = (payload: Record<string, unknown>, key: string) => typeof payload[key] === 'string' ? payload[key] : ''
const payloadNumber = (payload: Record<string, unknown>, key: string) => typeof payload[key] === 'number' && Number.isInteger(payload[key]) ? payload[key] : 0
const firstName = (payload: Record<string, unknown>) => payloadString(payload, 'customerName').trim().split(/\s+/)[0] ?? ''
const greeting = (payload: Record<string, unknown>) => firstName(payload) ? `Lieve ${firstName(payload)},` : 'Hallo,'
export const escapeEmailHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
const formatCents = (cents: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: cents % 100 === 0 ? 0 : 2, maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100)
const itemTitles = (payload: Record<string, unknown>) => Array.isArray(payload.items) ? payload.items.flatMap((item) => item && typeof item === 'object' && typeof (item as Record<string, unknown>).title === 'string' ? [String((item as Record<string, unknown>).title)] : []) : []

const orderDetails = (payload: Record<string, unknown>) => {
  const items = itemTitles(payload)
  return [
    payloadString(payload, 'orderNumber') ? `Bestelnummer: ${payloadString(payload, 'orderNumber')}` : '',
    items.length ? `Werk${items.length === 1 ? '' : 'en'}: ${items.join(', ')}` : '',
    payloadNumber(payload, 'subtotalCents') ? `Subtotaal: ${formatCents(payloadNumber(payload, 'subtotalCents'))}` : '',
    `Verzendkosten: ${formatCents(payloadNumber(payload, 'shippingCents'))}`,
    payloadNumber(payload, 'totalCents') ? `Totaal: ${formatCents(payloadNumber(payload, 'totalCents'))}` : '',
  ].filter(Boolean).join('\n')
}

const purchaseDeliveryText = (payload: Record<string, unknown>) => {
  if (payload.fulfillment !== 'shipping') return 'Ontvangst: afhalen op afspraak in IJzendoorn. Dit kan doorgaans binnen twee tot vijf werkdagen; we nemen persoonlijk contact op om een geschikt moment af te spreken.'
  const address = [payloadString(payload, 'address'), [payloadString(payload, 'postalCode'), payloadString(payload, 'city')].filter(Boolean).join(' '), payloadString(payload, 'country') === 'NL' ? 'Nederland' : ''].filter(Boolean).join('\n')
  return `Ontvangst: verzending binnen Nederland (${formatCents(payloadNumber(payload, 'shippingCents'))}).\nBezorgadres:\n${address}`
}

const renderHtml = (subject: string, paragraphs: string[]) => `<!doctype html><html lang="nl"><body style="margin:0;background:#f4efe6;color:#2f2a24;font-family:Georgia,serif"><div style="max-width:640px;margin:0 auto;padding:32px 20px"><div style="background:#fffaf1;border:1px solid #ded2bd;border-radius:18px;padding:32px"><p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#786f63">Stilte &amp; Draad · door Jannie</p><h1 style="font-size:24px;line-height:1.3;margin:0 0 24px">${escapeEmailHtml(subject)}</h1>${paragraphs.map((paragraph) => `<p style="white-space:pre-line;font-size:16px;line-height:1.7;margin:0 0 18px">${escapeEmailHtml(paragraph)}</p>`).join('')}<hr style="border:0;border-top:1px solid #ded2bd;margin:28px 0"><p style="font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#786f63">${escapeEmailHtml(seller)}<br>Antwoord op deze e-mail via ${escapeEmailHtml(replyTo)}</p></div></div></body></html>`
const compose = (subject: string, paragraphs: string[]): EmailContent => ({ subject, text: [...paragraphs, seller, `Antwoord via ${replyTo}`].join('\n\n'), html: renderHtml(subject, paragraphs) })

export const withdrawalConfirmationContent = (payload: { requestNumber: string; receivedAt: string; scope: 'full' | 'partial'; fulfillment?: 'pickup' | 'shipping'; shippingCents?: number; customerName?: string }) => compose(`Herroeping ontvangen · ${payload.requestNumber}`, [
  greeting({ customerName: payload.customerName ?? '' }),
  'We hebben je herroepingsverzoek in goede orde ontvangen.',
  `Referentie: ${payload.requestNumber}\nOntvangen op: ${payload.receivedAt}\nOmvang: ${payload.scope === 'full' ? 'gehele bestelling' : 'deel van de bestelling'}\nOorspronkelijke ontvangst: ${payload.fulfillment === 'shipping' ? `verzending binnen Nederland (${formatCents(payload.shippingCents ?? 0)})` : 'afhalen in IJzendoorn'}`,
  'Bewaar deze bevestiging. We nemen persoonlijk contact op met de verdere retourinstructies.', personalSignOff,
])

export const emailContent = (message: EmailMessage): EmailContent => {
  if (message.type === 'withdrawal_received') return withdrawalConfirmationContent({ requestNumber: payloadString(message.payload, 'requestNumber') || 'onbekend', receivedAt: payloadString(message.payload, 'receivedAt') || new Date().toISOString(), scope: message.payload.scope === 'partial' ? 'partial' : 'full', fulfillment: message.payload.fulfillment === 'shipping' ? 'shipping' : 'pickup', shippingCents: payloadNumber(message.payload, 'shippingCents'), customerName: payloadString(message.payload, 'customerName') })
  const hello = greeting(message.payload)
  const details = orderDetails(message.payload)
  const delivery = purchaseDeliveryText(message.payload)
  if (message.type === 'order_received') return compose('Je bestelling is ontvangen', [hello, 'Dank je wel. Je gekozen werk is nu even voor jou gereserveerd terwijl de betaling wordt afgerond.', details, delivery, companionStory, 'Zodra de betaling is bevestigd, ontvang je opnieuw bericht.', personalSignOff])
  if (message.type === 'payment_succeeded') return compose('Je werk mag naar je toe komen', [hello, 'Je betaling is ontvangen. Daarmee is het werk definitief voor jou bestemd.', details, delivery, companionStory, 'We houden je op de hoogte van de eerstvolgende praktische stap.', personalSignOff])
  if (message.type === 'payment_review') return compose('We kijken persoonlijk naar je betaling', [hello, 'Je betaling is ontvangen, maar vraagt om een handmatige controle. We nemen persoonlijk contact op voordat het werk wordt toegewezen of een vervolgstap wordt gezet.', details, 'Je hoeft nu niets opnieuw te betalen.', personalSignOff])
  if (message.type === 'donation_confirmed') return compose('Dank je voor de draad die je meegeeft', [hello, `Je bijdrage van ${formatCents(payloadNumber(message.payload, 'totalCents'))} is ontvangen. Daarmee help je de aanschaf en verbouwing mogelijk te maken van de bus waarmee Stilte & Draad naar markten en festivals kan reizen.`, payloadString(message.payload, 'orderNumber') ? `Referentie: ${payloadString(message.payload, 'orderNumber')}` : '', 'Dank je dat je ruimte helpt maken voor deze volgende beweging.', personalSignOff].filter(Boolean))
  const status = payloadString(message.payload, 'paymentStatus')
  const statusText = status === 'expired' ? 'De betaaltermijn is verlopen.' : status === 'canceled' ? 'De betaling is geannuleerd.' : status === 'failed' ? 'De betaling is helaas niet gelukt.' : 'De betaling is niet afgerond.'
  const subject = status === 'expired' ? 'De betaaltermijn is verlopen' : status === 'canceled' ? 'Je betaling is geannuleerd' : 'Je betaling is niet gelukt'
  return compose(subject, [hello, `${statusText} Er is niets definitief besteld en een eventuele reservering van het werk is vrijgegeven.`, details, 'Wil je het werk alsnog bestellen, dan kun je rustig terugkeren naar de webshop en opnieuw beginnen. Antwoord gerust op deze e-mail als je hulp nodig hebt.', personalSignOff])
}

const safeErrorCode = (error: unknown) => error instanceof Error && error.name ? error.name.slice(0, 80) : 'EMAIL_PROVIDER_ERROR'
export const processEmailOutbox = async (provider: EmailProvider, repository: EmailOutboxRepository, limit = 20) => {
  const messages = await repository.pending(limit)
  for (const message of messages) {
    try { await provider.send(message); await repository.sent(message.outboxId) }
    catch (error) { await repository.failed(message.outboxId, new Date(Date.now() + 5 * 60 * 1000), safeErrorCode(error)) }
  }
  return { processed: messages.length }
}
