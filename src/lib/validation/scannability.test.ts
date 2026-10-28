import { describe, expect, it } from 'vitest'
import { style } from '@/test/factories'
import {
  analyzeScannability,
  emptyScannability,
  getDesignWarnings,
  getLogoArea,
} from '@/lib/validation/scannability'

const logo = 'data:image/png;base64,AAAA'

describe('getLogoArea', () => {
  it('returns zero without a logo', () => {
    expect(getLogoArea(style())).toBe(0)
  })

  it('follows the renderer recovery formula', () => {
    expect(
      getLogoArea(style({ logo, logoImageSize: 0.38, errorCorrection: 'Q' })),
    ).toBeCloseTo(0.095)
    expect(
      getLogoArea(style({ logo, logoImageSize: 0.8, errorCorrection: 'H' })),
    ).toBeCloseTo(0.24)
  })
})

describe('getDesignWarnings', () => {
  it('passes the default style', () => {
    expect(getDesignWarnings(style())).toEqual([])
  })

  it('flags a logo above 20% of the surface', () => {
    expect(
      getDesignWarnings(style({ logo, logoImageSize: 0.8, errorCorrection: 'H' })),
    ).toContainEqual({ code: 'logo_too_large', action: 'reduce_logo' })
  })

  it('flags low error correction while a logo is present', () => {
    expect(
      getDesignWarnings(style({ logo, logoImageSize: 0.3, errorCorrection: 'M' })),
    ).toContainEqual({ code: 'ec_low_for_logo', action: 'set_h' })
  })

  it('flags a margin below four modules', () => {
    expect(getDesignWarnings(style({ margin: 0 }))).toContainEqual({
      code: 'margin_low',
      action: 'set_margin',
    })
  })

  it('flags weak contrast and inverted modules', () => {
    expect(
      getDesignWarnings(
        style({
          dotColor: '#dddddd',
          dotColor2: '#dddddd',
          backgroundColor: '#fefefe',
        }),
      ),
    ).toContainEqual({ code: 'contrast_low', action: 'set_size' })

    expect(
      getDesignWarnings(
        style({
          dotColor: '#ffffff',
          dotColor2: '#ffffff',
          backgroundColor: '#111111',
        }),
      ),
    ).toContainEqual({ code: 'inverted' })
  })
})

describe('analyzeScannability', () => {
  it('reports a clean scan', () => {
    const result = analyzeScannability({
      style: style(),
      expected: 'hello',
      decoded: 'hello',
      durationMs: 18,
      decodeFailed: false,
    })
    expect(result.status).toBe('scannable')
    expect(result.message).toBeUndefined()
    expect(result.durationMs).toBe(18)
    expect(result.checkedAt).toBeGreaterThan(0)
  })

  it('keeps a successful scan at attention when design warnings exist', () => {
    const result = analyzeScannability({
      style: style({ margin: 0 }),
      expected: 'hello',
      decoded: 'hello',
      durationMs: 20,
      decodeFailed: false,
    })
    expect(result.status).toBe('attention')
    expect(result.warnings.map((warning) => warning.code)).toEqual(['margin_low'])
  })

  it('reports a failed decode as unscannable', () => {
    const result = analyzeScannability({
      style: style(),
      expected: 'hello',
      decoded: null,
      durationMs: 20,
      decodeFailed: true,
    })
    expect(result.status).toBe('unscannable')
    expect(result.message).toBe('decode_failed')
    expect(result.decoded).toBeNull()
  })

  it('reports a payload mismatch as unscannable', () => {
    const result = analyzeScannability({
      style: style(),
      expected: 'hello',
      decoded: 'goodbye',
      durationMs: 20,
      decodeFailed: false,
    })
    expect(result.status).toBe('unscannable')
    expect(result.message).toBe('payload_mismatch')
    expect(result.decoded).toBe('goodbye')
  })

  it('creates an idle result', () => {
    expect(emptyScannability()).toMatchObject({
      status: 'idle',
      decoded: null,
      expected: '',
      warnings: [],
    })
  })
})
