import { useCallback } from 'react'
import { translate, translateError } from '@/i18n'
import type { TranslationKey } from '@/i18n'
import { useSettingsStore } from '@/store/settings'

export interface I18n {
  locale: 'fr' | 'en'
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string
  te: (code?: string) => string | undefined
}

export function useI18n(): I18n {
  const locale = useSettingsStore((state) => state.locale)

  const t = useCallback(
    (key: TranslationKey, variables?: Record<string, string | number>) =>
      translate(locale, key, variables),
    [locale],
  )

  const te = useCallback((code?: string) => translateError(locale, code), [locale])

  return { locale, t, te }
}
