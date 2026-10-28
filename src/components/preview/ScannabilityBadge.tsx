import {
  CheckCircle,
  Circle,
  CircleNotch,
  WarningCircle,
  XCircle,
} from '@phosphor-icons/react'
import { useI18n } from '@/hooks/useI18n'
import type { ScannabilityResult } from '@/lib/types'
import type { TranslationKey } from '@/i18n'

interface ScannabilityBadgeProps {
  validation: ScannabilityResult
  checking: boolean
}

export function ScannabilityBadge({ validation, checking }: ScannabilityBadgeProps) {
  const { t } = useI18n()
  const status = checking ? 'checking' : validation.status
  const label = t(`status.${status}` as TranslationKey)

  return (
    <span className={`status-badge status-badge--${status}`} aria-live="polite">
      {status === 'checking' ? (
        <CircleNotch size={15} className="spin" aria-hidden="true" />
      ) : status === 'scannable' ? (
        <CheckCircle size={15} weight="fill" aria-hidden="true" />
      ) : status === 'attention' ? (
        <WarningCircle size={15} weight="fill" aria-hidden="true" />
      ) : status === 'unscannable' ? (
        <XCircle size={15} weight="fill" aria-hidden="true" />
      ) : (
        <Circle size={15} aria-hidden="true" />
      )}
      <span>{label}</span>
    </span>
  )
}
