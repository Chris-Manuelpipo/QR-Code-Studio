import { describe, expect, it } from 'vitest'
import { style } from '@/test/factories'
import {
  buildQrOptions,
  getQrMetrics,
  marginInPixels,
  QrGenerationError,
} from '@/lib/qr/engine'
import { toUtf8BinaryString } from '@/lib/payloads'

describe('getQrMetrics', () => {
  it('measures the module count of a payload', () => {
    expect(getQrMetrics('hello', 'M')).toEqual({
      moduleCount: 21,
      capacityError: false,
    })
    expect(getQrMetrics('a'.repeat(200), 'H').moduleCount).toBeGreaterThan(21)
  })

  it('reports payloads that exceed the capacity', () => {
    expect(getQrMetrics('a'.repeat(8000), 'H')).toEqual({
      moduleCount: 0,
      capacityError: true,
    })
  })
})

describe('marginInPixels', () => {
  it('converts module margins into pixels at the target size', () => {
    expect(marginInPixels(512, 21, 4)).toBe(71)
    expect(marginInPixels(512, 21, 0)).toBe(0)
  })

  it('degrades safely for invalid metrics', () => {
    expect(marginInPixels(512, 0, 4)).toBe(0)
    expect(marginInPixels(512, 21, -1)).toBe(0)
  })
})

describe('buildQrOptions', () => {
  it('encodes UTF-8 payload bytes and the requested size', () => {
    const options = buildQrOptions({
      payload: 'Café',
      style: style({ errorCorrection: 'Q', margin: 4 }),
      size: 512,
    })

    expect(options.width).toBe(512)
    expect(options.height).toBe(512)
    expect(options.data).toBe(toUtf8BinaryString('Café'))
    expect(options.margin).toBe(
      marginInPixels(512, getQrMetrics('Café', 'Q').moduleCount, 4),
    )
    expect(options.qrOptions.errorCorrectionLevel).toBe('Q')
  })

  it('builds solid colours and a transparent background', () => {
    const options = buildQrOptions({
      payload: 'hello',
      style: style({
        colorMode: 'solid',
        dotColor: '#123456',
        backgroundColor: '#abcdef',
        transparentBackground: true,
      }),
      size: 512,
      transparentBackground: true,
    })

    expect(options.dotsOptions).toMatchObject({
      type: 'rounded',
      color: '#123456',
    })
    expect(options.backgroundOptions.color).toBe('transparent')
    expect(options.backgroundOptions).not.toHaveProperty('gradient')
  })

  it('converts the gradient rotation to radians', () => {
    const options = buildQrOptions({
      payload: 'hello',
      style: style({
        colorMode: 'linear',
        dotColor: '#111111',
        dotColor2: '#222222',
        gradientRotation: 90,
      }),
      size: 512,
    })

    const dots = options.dotsOptions as {
      gradient?: {
        type: string
        rotation: number
        colorStops: Array<{ offset: number; color: string }>
      }
    }
    expect(dots.gradient).toMatchObject({
      type: 'linear',
      colorStops: [
        { offset: 0, color: '#111111' },
        { offset: 1, color: '#222222' },
      ],
    })
    expect(dots.gradient?.rotation).toBeCloseTo(Math.PI / 2)
  })

  it('falls back to safe colours when a value is invalid', () => {
    const options = buildQrOptions({
      payload: 'hello',
      style: style({ dotColor: 'nope', dotColor2: 'nope', backgroundColor: 'nope' }),
      size: 256,
    })
    const dots = options.dotsOptions as { color?: string }
    expect(dots.color).toBe('#171714')
    expect(options.backgroundOptions.color).toBe('#fbfaf5')
  })

  it('includes logo options only when a logo exists', () => {
    const withoutLogo = buildQrOptions({
      payload: 'hello',
      style: style(),
      size: 512,
    })
    expect(withoutLogo).not.toHaveProperty('image')

    const withLogo = buildQrOptions({
      payload: 'hello',
      style: style({ logo: 'data:image/png;base64,AAAA', logoImageSize: 0.3 }),
      size: 512,
    })
    expect((withLogo as { image?: string }).image).toBe('data:image/png;base64,AAAA')
    expect(withLogo.imageOptions.imageSize).toBe(0.3)
    expect(withLogo.imageOptions.margin).toBeGreaterThan(0)
  })

  it('throws a capacity error before rendering', () => {
    expect(() =>
      buildQrOptions({
        payload: 'a'.repeat(8000),
        style: style({ errorCorrection: 'H' }),
        size: 512,
      }),
    ).toThrow(QrGenerationError)
  })
})
