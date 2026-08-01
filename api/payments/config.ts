import type { VercelRequest, VercelResponse } from '@vercel/node'
import { configurationState, donationConfigurationState } from '../_lib/config.js'
import { json, method } from '../_lib/http.js'

export default function handler(request: VercelRequest, response: VercelResponse) {
  if (!method(request, response, 'GET')) return
  const state = configurationState()
  const donation = donationConfigurationState()
  return json(response, 200, {
    available: state.ready,
    donationAvailable: donation.ready,
    mode: state.ready ? state.mode : null,
    message: state.ready ? null : 'Online betalen wordt zorgvuldig voorbereid en is tijdelijk nog niet beschikbaar.',
    donationConfirmThresholdCents: donation.confirmationThresholdCents,
    ...(process.env.VERCEL_ENV !== 'production' ? { configuration: state.issues, donationConfiguration: donation.issues } : {}),
  })
}
