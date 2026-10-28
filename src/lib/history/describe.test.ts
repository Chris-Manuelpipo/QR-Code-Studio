import { describe, expect, it } from 'vitest'
import { entry } from '@/test/factories'
import { describeEntry } from '@/lib/history/describe'
import type { FormDataMap } from '@/lib/types'

function withForm<K extends keyof FormDataMap>(type: K, formData: FormDataMap[K]) {
  return entry(type, { formData })
}

describe('describeEntry', () => {
  it('describes each content type from its main field', () => {
    expect(describeEntry(withForm('url', { url: 'https://example.com' }))).toBe(
      'https://example.com',
    )
    expect(describeEntry(withForm('text', { text: 'Bonjour' }))).toBe('Bonjour')
    expect(
      describeEntry(
        withForm('wifi', {
          ssid: 'Studio',
          password: '',
          encryption: 'nopass',
          hidden: false,
        }),
      ),
    ).toBe('Studio')
    expect(
      describeEntry(
        withForm('vcard', {
          lastName: 'Doe',
          firstName: 'Jane',
          phone: '',
          email: '',
          org: '',
          title: '',
          url: '',
          address: '',
        }),
      ),
    ).toBe('Jane Doe')
    expect(
      describeEntry(
        withForm('vevent', {
          title: 'Vernissage',
          start: '2026-10-27T18:00',
          end: '',
          location: '',
          description: '',
        }),
      ),
    ).toBe('Vernissage')
    expect(
      describeEntry(withForm('geo', { lat: '48.85', lng: '2.35', label: 'Paris' })),
    ).toBe('Paris')
    expect(
      describeEntry(
        withForm('contact', {
          channel: 'email',
          email: 'hello@example.com',
          subject: '',
          body: '',
          phone: '',
          message: '',
        }),
      ),
    ).toBe('hello@example.com')
    expect(
      describeEntry(
        withForm('crypto', {
          scheme: 'bitcoin',
          address: 'bc1qexample',
          amount: '',
          label: '',
        }),
      ),
    ).toBe('bc1qexample')
  })

  it('falls back to coordinates, org or an em dash', () => {
    expect(
      describeEntry(withForm('geo', { lat: '48.85', lng: '2.35', label: '' })),
    ).toBe('48.85, 2.35')
    expect(
      describeEntry(
        withForm('vcard', {
          lastName: '',
          firstName: '',
          phone: '',
          email: '',
          org: 'ACME',
          title: '',
          url: '',
          address: '',
        }),
      ),
    ).toBe('ACME')
    expect(describeEntry(withForm('text', { text: '' }))).toBe('—')
  })

  it('collapses whitespace and truncates long values', () => {
    const value = `  ${'a'.repeat(100)}  `
    const result = describeEntry(withForm('text', { text: value }))
    expect(result).toHaveLength(64)
    expect(result.endsWith('…')).toBe(true)
  })
})
