import { describe, expect, it } from 'vitest'
import { productImageDisclosure } from './productPresentation'

describe('toelichting bij productafbeeldingen', () => {
  it('behoudt de goedgekeurde centrale formulering', () => {
    expect(productImageDisclosure).toBe('Presentatiebeeld: de achtergrond en setting zijn digitaal bewerkt en deels met AI samengesteld. Het aangeboden handwerk zelf is niet digitaal gewijzigd. Raadpleeg de productomschrijving voor de werkelijke afmetingen en materialen.')
  })
})
