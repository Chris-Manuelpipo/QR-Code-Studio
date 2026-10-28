import { CONTENT_ICONS } from '@/components/contentMeta'
import { useI18n } from '@/hooks/useI18n'
import { CONTENT_TYPE_LABEL_KEYS } from '@/lib/config'
import { CONTENT_TYPES } from '@/lib/types'
import { useStudioStore } from '@/store/studio'
import type { TranslationKey } from '@/i18n'

export function TypePicker() {
  const { t } = useI18n()
  const type = useStudioStore((state) => state.type)
  const setType = useStudioStore((state) => state.setType)

  return (
    <div className="type-picker" role="group" aria-label={t('section.type')}>
      {CONTENT_TYPES.map((candidate, index) => {
        const Icon = CONTENT_ICONS[candidate]
        const selected = candidate === type
        return (
          <button
            key={candidate}
            type="button"
            className={selected ? 'type-option type-option--active' : 'type-option'}
            aria-pressed={selected}
            onClick={() => setType(candidate)}
          >
            <span className="type-icon" aria-hidden="true">
              <Icon size={20} weight={selected ? 'bold' : 'regular'} />
            </span>
            <span className="type-copy">
              <span className="type-name">{t(CONTENT_TYPE_LABEL_KEYS[candidate])}</span>
              <span className="type-desc">
                {t(`typeDesc.${candidate}` as TranslationKey)}
              </span>
            </span>
            <span className="type-index mono" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
          </button>
        )
      })}
    </div>
  )
}
