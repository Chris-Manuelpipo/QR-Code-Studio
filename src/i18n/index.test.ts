import { describe, expect, it } from 'vitest'
import {
  formatDate,
  formatNumber,
  formatRelativeDate,
  translate,
  translateError,
  translations,
} from '@/i18n'
import type { TranslationKey } from '@/i18n'

describe('dictionary parity', () => {
  it('defines every French key in English and vice versa', () => {
    const french = Object.keys(translations.fr).sort()
    const english = Object.keys(translations.en).sort()
    expect(english).toEqual(french)
  })

  it('has no empty translations', () => {
    for (const locale of ['fr', 'en'] as const) {
      for (const [key, value] of Object.entries(translations[locale])) {
        expect(value.trim(), `${locale}.${key}`).not.toBe('')
      }
    }
  })

  it('exposes the locale metadata used by the document', () => {
    expect(translations.fr['meta.locale']).toBe('fr-FR')
    expect(translations.en['meta.locale']).toBe('en-GB')
  })
})

describe('translate', () => {
  it('interpolates variables', () => {
    expect(translate('fr', 'status.decodeTime', { ms: 42 })).toBe('Décodé en 42 ms')
    expect(translate('en', 'status.decodeTime', { ms: 42 })).toBe('Decoded in 42 ms')
  })

  it('keeps unknown placeholders intact', () => {
    expect(translate('fr', 'status.decodeTime', {})).toBe('Décodé en {ms} ms')
  })

  it('falls back to French and then the key for unknown entries', () => {
    expect(translate('en', 'does.not.exist' as TranslationKey)).toBe('does.not.exist')
    expect(translate('fr', 'does.not.exist' as TranslationKey)).toBe('does.not.exist')
  })

  it('translates validation error codes', () => {
    expect(translateError('fr', 'url_invalid')).toContain('URL complète')
    expect(translateError('en', 'url_invalid')).toContain('complete URL')
    expect(translateError('fr', 'unknown_code')).toBe('unknown_code')
    expect(translateError('fr')).toBeUndefined()
  })
})

describe('date formatting', () => {
  const now = new Date('2026-10-27T12:00:00Z').getTime()

  it('formats relative dates in both locales', () => {
    expect(formatRelativeDate('en', now, now)).toBe('this minute')
    expect(formatRelativeDate('en', now - 5 * 60_000, now)).toBe('5 minutes ago')
    expect(formatRelativeDate('en', now - 2 * 3_600_000, now)).toBe('2 hours ago')
    expect(formatRelativeDate('en', now - 2 * 86_400_000, now)).toBe('2 days ago')
    expect(formatRelativeDate('fr', now, now)).toMatch(/minute/)
  })

  it('falls back to an absolute date beyond a week', () => {
    const old = now - 10 * 86_400_000
    const formatted = formatRelativeDate('en', old, now)
    expect(formatted).toMatch(/2026/)
  })

  it('formats absolute dates and numbers', () => {
    const date = new Date(2026, 9, 27).getTime()
    expect(formatDate('en', date)).toContain('2026')
    expect(formatDate('fr', date, 'long')).toContain('2026')
    expect(formatNumber('en', 1234.5)).toBe('1,234.5')
    expect(formatNumber('fr', 1234.5)).toMatch(/1\s?234,5/)
  })
})
