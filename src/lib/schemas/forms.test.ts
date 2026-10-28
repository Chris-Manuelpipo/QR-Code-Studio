import { describe, expect, it } from 'vitest'
import {
  formatValidationErrors,
  isValidLocalDate,
  isSupportedType,
  validateFormData,
} from '@/lib/schemas/forms'
import type { ContactForm, VEventForm } from '@/lib/types'

const event: VEventForm = {
  title: 'Atelier',
  start: '2026-10-27T18:00',
  end: '2026-10-27T19:30',
  location: '',
  description: '',
}

describe('URL schema', () => {
  it('accepts http and https URLs', () => {
    expect(validateFormData('url', { url: 'https://example.com' }).success).toBe(true)
    expect(validateFormData('url', { url: 'http://example.com' }).success).toBe(true)
  })

  it('rejects other schemes and malformed URLs', () => {
    expect(validateFormData('url', { url: 'javascript:alert(1)' })).toMatchObject({
      success: false,
      errors: { url: 'url_scheme' },
    })
    expect(validateFormData('url', { url: 'not a url' })).toMatchObject({
      success: false,
      errors: { url: 'url_invalid' },
    })
    expect(validateFormData('url', { url: '' })).toMatchObject({
      success: false,
      errors: { url: 'required' },
    })
  })
})

describe('WiFi schema', () => {
  it('requires a password for protected networks', () => {
    expect(
      validateFormData('wifi', {
        ssid: 'Studio',
        password: '',
        encryption: 'WPA',
        hidden: false,
      }),
    ).toMatchObject({
      success: false,
      errors: { password: 'password_required' },
    })
  })

  it('allows an empty password for open networks', () => {
    expect(
      validateFormData('wifi', {
        ssid: 'Studio',
        password: '',
        encryption: 'nopass',
        hidden: false,
      }).success,
    ).toBe(true)
  })
})

describe('vCard schema', () => {
  it('requires a last name', () => {
    expect(
      validateFormData('vcard', {
        lastName: '',
        firstName: 'Jane',
        phone: '',
        email: '',
        org: '',
        title: '',
        url: '',
        address: '',
      }).success,
    ).toBe(false)
  })

  it('validates optional contact fields when present', () => {
    const result = validateFormData('vcard', {
      lastName: 'Doe',
      firstName: 'Jane',
      phone: '+33 6 12 34 56 78',
      email: 'jane@example.com',
      org: '',
      title: '',
      url: 'https://example.com',
      address: '',
    })
    expect(result.success).toBe(true)
    expect(
      validateFormData('vcard', {
        lastName: 'Doe',
        firstName: '',
        phone: 'abc',
        email: 'not-an-email',
        org: '',
        title: '',
        url: '',
        address: '',
      }),
    ).toMatchObject({
      success: false,
      errors: { phone: 'phone_invalid', email: 'email_invalid' },
    })
  })
})

describe('event schema', () => {
  it('accepts a valid local date range', () => {
    expect(isValidLocalDate('2024-02-29T23:59')).toBe(true)
    expect(isValidLocalDate('2026-10-27T18:00:30')).toBe(true)
    expect(validateFormData('vevent', event).success).toBe(true)
  })

  it('rejects impossible dates and malformed values', () => {
    expect(isValidLocalDate('2025-02-29T10:00')).toBe(false)
    expect(isValidLocalDate('2026-13-01T10:00')).toBe(false)
    expect(isValidLocalDate('2026-10-27')).toBe(false)
    expect(isValidLocalDate('2026-10-27T25:00')).toBe(false)
  })

  it('requires the end to be strictly after the start', () => {
    expect(
      validateFormData('vevent', { ...event, end: '2026-10-27T18:00' }),
    ).toMatchObject({
      success: false,
      errors: { end: 'end_before_start' },
    })
    expect(
      validateFormData('vevent', { ...event, end: '2026-10-27T17:00' }),
    ).toMatchObject({
      success: false,
      errors: { end: 'end_before_start' },
    })
  })

  it('allows an empty end', () => {
    expect(validateFormData('vevent', { ...event, end: '' }).success).toBe(true)
  })
})

describe('geo schema', () => {
  it('accepts decimal commas and bounds', () => {
    expect(
      validateFormData('geo', { lat: '48,8566', lng: '2.3522', label: '' }).success,
    ).toBe(true)
  })

  it('rejects out-of-range coordinates', () => {
    expect(validateFormData('geo', { lat: '91', lng: '0', label: '' })).toMatchObject({
      success: false,
      errors: { lat: 'lat_invalid' },
    })
    expect(validateFormData('geo', { lat: '0', lng: '-181', label: '' })).toMatchObject(
      { success: false, errors: { lng: 'lng_invalid' } },
    )
  })
})

describe('contact schema', () => {
  const contact: ContactForm = {
    channel: 'email',
    email: '',
    subject: '',
    body: '',
    phone: '',
    message: '',
  }

  it('requires the field that matches the channel', () => {
    expect(validateFormData('contact', contact)).toMatchObject({
      success: false,
      errors: { email: 'required' },
    })
    expect(
      validateFormData('contact', {
        ...contact,
        channel: 'phone',
      }),
    ).toMatchObject({ success: false, errors: { phone: 'required' } })
    expect(
      validateFormData('contact', {
        ...contact,
        channel: 'sms',
        phone: '+33 6 12 34 56 78',
      }).success,
    ).toBe(true)
  })
})

describe('crypto schema', () => {
  it('validates addresses and positive amounts', () => {
    expect(
      validateFormData('crypto', {
        scheme: 'ethereum',
        address: '0xabc',
        amount: '0.5',
        label: '',
      }).success,
    ).toBe(true)
    expect(
      validateFormData('crypto', {
        scheme: 'bitcoin',
        address: '',
        amount: '-1',
        label: '',
      }),
    ).toMatchObject({
      success: false,
      errors: { address: 'required', amount: 'amount_invalid' },
    })
  })
})

describe('validation helpers', () => {
  it('returns one error per field and ignores success results', () => {
    expect(
      formatValidationErrors('wifi', {
        ssid: '',
        password: '',
        encryption: 'WPA',
        hidden: false,
      }),
    ).toEqual({ ssid: 'required', password: 'password_required' })
    expect(formatValidationErrors('url', { url: 'https://example.com' })).toEqual({})
  })

  it('recognizes supported content types', () => {
    expect(isSupportedType('wifi')).toBe(true)
    expect(isSupportedType('unknown')).toBe(false)
    expect(isSupportedType(42)).toBe(false)
  })
})
