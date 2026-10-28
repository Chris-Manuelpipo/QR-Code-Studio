import { createDefaultForms, createDefaultStyle } from '@/lib/config'
import type {
  ContentType,
  FormDataMap,
  QrEntry,
  ScannabilityResult,
  StyleConfig,
} from '@/lib/types'

export function style(overrides: Partial<StyleConfig> = {}): StyleConfig {
  return { ...createDefaultStyle(), ...overrides }
}

export function entry(
  type: ContentType = 'url',
  overrides: Partial<QrEntry> = {},
): QrEntry {
  const forms = createDefaultForms()
  const now = Date.now()
  return {
    id: 'entry-1',
    type,
    payload: 'https://example.com',
    formData: forms[type] as FormDataMap[ContentType],
    style: style(),
    thumbnail: 'data:image/png;base64,',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export function validation(
  overrides: Partial<ScannabilityResult> = {},
): ScannabilityResult {
  return {
    status: 'scannable',
    decoded: 'https://example.com',
    expected: 'https://example.com',
    durationMs: 12,
    warnings: [],
    checkedAt: Date.now(),
    ...overrides,
  }
}
