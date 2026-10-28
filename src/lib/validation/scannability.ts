import { ERROR_CORRECTION_RECOVERY, LOGO_MAX_AREA } from '@/lib/config'
import type { ScannabilityResult, StyleConfig, ValidationWarning } from '@/lib/types'
import { getInversionRisk, getQrContrast } from '@/lib/utils/colors'

export function getLogoArea(style: StyleConfig): number {
  if (!style.logo) return 0
  return (
    Math.min(1, style.logoImageSize) * ERROR_CORRECTION_RECOVERY[style.errorCorrection]
  )
}

export function getDesignWarnings(style: StyleConfig): ValidationWarning[] {
  const warnings: ValidationWarning[] = []
  const logoArea = getLogoArea(style)
  if (style.logo && logoArea > LOGO_MAX_AREA) {
    warnings.push({ code: 'logo_too_large', action: 'reduce_logo' })
  }
  if (style.logo && (style.errorCorrection === 'L' || style.errorCorrection === 'M')) {
    warnings.push({ code: 'ec_low_for_logo', action: 'set_h' })
  }
  if (style.margin < 4) {
    warnings.push({ code: 'margin_low', action: 'set_margin' })
  }
  const contrast = getQrContrast(style.dotColor, style.dotColor2, style.backgroundColor)
  if (contrast < 4.5) {
    warnings.push({ code: 'contrast_low', action: 'set_size' })
  }
  if (getInversionRisk(style.dotColor, style.dotColor2, style.backgroundColor)) {
    warnings.push({ code: 'inverted' })
  }
  return warnings
}

export interface AnalyzeInput {
  style: StyleConfig
  expected: string
  decoded: string | null
  durationMs: number
  decodeFailed: boolean
}

export function analyzeScannability({
  style,
  expected,
  decoded,
  durationMs,
  decodeFailed,
}: AnalyzeInput): ScannabilityResult {
  const warnings = getDesignWarnings(style)
  const checkedAt = Date.now()

  if (decodeFailed || decoded === null) {
    return {
      status: 'unscannable',
      decoded,
      expected,
      durationMs,
      warnings,
      message: 'decode_failed',
      checkedAt,
    }
  }

  if (decoded !== expected) {
    return {
      status: 'unscannable',
      decoded,
      expected,
      durationMs,
      warnings,
      message: 'payload_mismatch',
      checkedAt,
    }
  }

  return {
    status: warnings.length > 0 ? 'attention' : 'scannable',
    decoded,
    expected,
    durationMs,
    warnings,
    checkedAt,
  }
}

export function emptyScannability(): ScannabilityResult {
  return {
    status: 'idle',
    decoded: null,
    expected: '',
    durationMs: 0,
    warnings: [],
    checkedAt: 0,
  }
}
