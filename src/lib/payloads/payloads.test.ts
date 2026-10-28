import { describe, expect, it } from 'vitest'
import {
  buildPayload,
  getPayloadForForms,
  getValidatedPayload,
  normalizeNumber,
  normalizePhone,
  toUtf8BinaryString,
} from '@/lib/payloads'
import { createDefaultForms } from '@/lib/config'
import type {
  ContactForm,
  CryptoForm,
  GeoForm,
  TextForm,
  UrlForm,
  VCardForm,
  VEventForm,
  WifiForm,
} from '@/lib/types'

describe('toUtf8BinaryString', () => {
  it('round-trips accents and emoji through UTF-8 bytes', () => {
    const value = 'Café — déjà vu 🌱'
    const binary = toUtf8BinaryString(value)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    expect(new TextDecoder().decode(bytes)).toBe(value)
  })

  it('keeps ASCII untouched', () => {
    expect(toUtf8BinaryString('https://example.com/a?b=1')).toBe(
      'https://example.com/a?b=1',
    )
  })
})

describe('payload builders', () => {
  it('trims and returns URL content', () => {
    const data: UrlForm = { url: '  https://example.com/page  ' }
    expect(buildPayload('url', data)).toBe('https://example.com/page')
  })

  it('normalizes newlines and strips control characters from text', () => {
    const data: TextForm = { text: 'Ligne 1\r\nLigne 2\u0000\u0007' }
    expect(buildPayload('text', data)).toBe('Ligne 1\nLigne 2')
  })

  it('escapes WiFi delimiters and drops the password when open', () => {
    const data: WifiForm = {
      ssid: 'Café; "Guest"',
      password: 'pa\\ss;word',
      encryption: 'WPA',
      hidden: true,
    }
    expect(buildPayload('wifi', data)).toBe(
      'WIFI:T:WPA;S:Café\\; \\"Guest\\";P:pa\\\\ss\\;word;H:true;;',
    )
    expect(buildPayload('wifi', { ...data, encryption: 'nopass' })).toBe(
      'WIFI:T:nopass;S:Café\\; \\"Guest\\";P:;H:true;;',
    )
  })

  it('builds a vCard 3.0 with escaped values and CRLF lines', () => {
    const data: VCardForm = {
      lastName: 'Doe; Jr',
      firstName: 'Jane',
      phone: '+33 6 12 34 56 78',
      email: 'jane@example.com',
      org: 'ACME, Inc',
      title: 'CTO',
      url: 'https://example.com',
      address: '1 rue de l’Église\n75001 Paris',
    }
    const payload = buildPayload('vcard', data)
    expect(payload).toContain('BEGIN:VCARD\r\nVERSION:3.0\r\n')
    expect(payload).toContain('N:Doe\\; Jr;Jane;;;')
    expect(payload).toContain('FN:Jane Doe\\; Jr')
    expect(payload).toContain('ORG:ACME\\, Inc')
    expect(payload).toContain('TEL;TYPE=CELL:+33612345678')
    expect(payload).toContain('ADR;TYPE=WORK:;;1 rue de l’Église\\n75001 Paris;;;;')
    expect(payload.endsWith('END:VCARD')).toBe(true)
  })

  it('builds a VEVENT with normalized local dates', () => {
    const data: VEventForm = {
      title: 'Atelier; découverte',
      start: '2026-10-27T18:30',
      end: '2026-10-27T20:00:00',
      location: 'Paris, France',
      description: 'Venez nombreux\nEntrée libre',
    }
    const payload = buildPayload('vevent', data)
    expect(payload).toContain('SUMMARY:Atelier\\; découverte')
    expect(payload).toContain('DTSTART:20261027T183000')
    expect(payload).toContain('DTEND:20261027T200000')
    expect(payload).toContain('LOCATION:Paris\\, France')
    expect(payload).toContain('DESCRIPTION:Venez nombreux\\nEntrée libre')
  })

  it('builds a geo URI with comma decimals and an encoded label', () => {
    const data: GeoForm = {
      lat: '48,8566',
      lng: '2.3522',
      label: 'Café & Co',
    }
    expect(buildPayload('geo', data)).toBe(
      'geo:48.8566,2.3522?q=48.8566,2.3522(Caf%C3%A9%20%26%20Co)',
    )
  })

  it('builds e-mail, phone and SMS contact payloads', () => {
    const base: ContactForm = {
      channel: 'email',
      email: 'hello@example.com',
      subject: 'Bonjour; toi',
      body: 'Une question\nsur le studio',
      phone: '+33 6 12 34 56 78',
      message: 'Coucou',
    }
    expect(buildPayload('contact', base)).toBe(
      'MATMSG:TO:hello@example.com;SUB:Bonjour\\; toi;BODY:Une question sur le studio;;',
    )
    expect(buildPayload('contact', { ...base, channel: 'phone' })).toBe(
      'tel:+33612345678',
    )
    expect(buildPayload('contact', { ...base, channel: 'sms' })).toBe(
      'SMSTO:+33612345678:Coucou',
    )
  })

  it('builds crypto URIs with normalized amount and encoded label', () => {
    const data: CryptoForm = {
      scheme: 'bitcoin',
      address: 'bc1qexample',
      amount: '0,125',
      label: 'Atelier QR',
    }
    expect(buildPayload('crypto', data)).toBe(
      'bitcoin:bc1qexample?amount=0.125&label=Atelier%20QR',
    )
    expect(
      buildPayload('crypto', {
        ...data,
        address: ' bc1qexample ',
        amount: '',
        label: '',
      }),
    ).toBe('bitcoin:bc1qexample')
  })
})

describe('validation gate', () => {
  it('refuses to build an invalid payload', () => {
    expect(getValidatedPayload('url', { url: 'javascript:alert(1)' })).toEqual({
      ok: false,
      errors: { url: 'url_scheme' },
    })
  })

  it('builds from a complete form set', () => {
    const forms = createDefaultForms()
    expect(getPayloadForForms('url', forms)).toEqual({
      ok: true,
      payload: 'https://example.com/atelier',
    })
  })
})

describe('normalizers', () => {
  it('normalizes phone punctuation and decimal commas', () => {
    expect(normalizePhone('+33 (0)6-12.34.56.78')).toBe('+330612345678')
    expect(normalizeNumber(' 12,50 ')).toBe('12.50')
  })
})
