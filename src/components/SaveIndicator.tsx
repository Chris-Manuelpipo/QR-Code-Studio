import {
  CircleNotch,
  FloppyDisk,
  LockSimple,
  WarningCircle,
} from '@phosphor-icons/react'
import { useI18n } from '@/hooks/useI18n'
import { formatRelativeDate } from '@/i18n'
import { useSettingsStore } from '@/store/settings'
import { useStudioStore } from '@/store/studio'

export function SaveIndicator() {
  const { t, locale } = useI18n()
  const isSaving = useStudioStore((state) => state.isSaving)
  const lastSavedAt = useStudioStore((state) => state.lastSavedAt)
  const saveError = useStudioStore((state) => state.saveError)
  const privateMode = useSettingsStore((state) => state.privateMode)

  if (privateMode) {
    return (
      <p className="save-indicator save-indicator--private" role="status">
        <LockSimple size={14} />
        {t('history.privateOn')}
      </p>
    )
  }

  if (saveError) {
    return (
      <p className="save-indicator save-indicator--error" role="status">
        <WarningCircle size={14} weight="fill" />
        {t('history.error')}
      </p>
    )
  }

  if (isSaving) {
    return (
      <p className="save-indicator" role="status">
        <CircleNotch size={14} className="spin" />
        {t('history.saving')}
      </p>
    )
  }

  if (!lastSavedAt) return null

  return (
    <p className="save-indicator" role="status">
      <FloppyDisk size={14} />
      {t('history.saved')}
      <span className="save-time mono">{formatRelativeDate(locale, lastSavedAt)}</span>
    </p>
  )
}
