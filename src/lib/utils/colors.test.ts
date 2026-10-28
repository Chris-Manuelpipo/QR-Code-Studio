import { describe, expect, it } from 'vitest'
import {
  contrastRatio,
  getInversionRisk,
  getQrContrast,
  isHexColor,
  isLightColor,
  parseHexColor,
  readableInk,
  relativeLuminance,
} from '@/lib/utils/colors'

describe('hex parsing', () => {
  it('parses three and six digit values with or without a hash', () => {
    expect(parseHexColor('#fff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(parseHexColor('171714')).toEqual({ r: 23, g: 23, b: 20 })
    expect(parseHexColor(' #B6E83C ')).toEqual({ r: 182, g: 232, b: 60 })
  })

  it('rejects malformed values', () => {
    expect(parseHexColor('#12')).toBeNull()
    expect(parseHexColor('#gggggg')).toBeNull()
    expect(parseHexColor('rgb(0,0,0)')).toBeNull()
    expect(isHexColor('#12345')).toBe(false)
    expect(isHexColor('#123456')).toBe(true)
  })
})

describe('contrast', () => {
  it('computes the WCAG extremes', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#171714', '#171714')).toBeCloseTo(1, 5)
  })

  it('uses the lower of the two gradient stops', () => {
    const primary = getQrContrast('#171714', '#b6e83c', '#fbfaf5')
    const secondary = contrastRatio('#b6e83c', '#fbfaf5')
    expect(primary).toBeCloseTo(secondary, 5)
  })

  it('computes relative luminance and readable ink', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5)
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5)
    expect(isLightColor('#fbfaf5')).toBe(true)
    expect(isLightColor('#171714')).toBe(false)
    expect(readableInk('#fbfaf5')).toBe('#171714')
    expect(readableInk('#171714')).toBe('#fbfaf5')
  })
})

describe('inversion risk', () => {
  it('detects light modules on a dark surface', () => {
    expect(getInversionRisk('#ffffff', '#ffffff', '#111111')).toBe(true)
    expect(getInversionRisk('#171714', '#171714', '#fbfaf5')).toBe(false)
  })

  it('uses the lightest gradient stop', () => {
    expect(getInversionRisk('#171714', '#ffffff', '#888888')).toBe(true)
  })
})
