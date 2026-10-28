import { useI18n } from '@/hooks/useI18n'
import { DOT_STYLES } from '@/lib/types'
import { useStudioStore } from '@/store/studio'
import type { TranslationKey } from '@/i18n'

export function DotStyleGrid() {
  const { t } = useI18n()
  const dotStyle = useStudioStore((state) => state.style.dotStyle)
  const patchStyle = useStudioStore((state) => state.patchStyle)

  return (
    <div className="dot-grid" role="group" aria-label={t('style.dots')}>
      {DOT_STYLES.map((style) => {
        const active = style === dotStyle
        const label = t(`style.dots.${style}` as TranslationKey)
        return (
          <button
            key={style}
            type="button"
            className={active ? 'dot-option dot-option--active' : 'dot-option'}
            aria-pressed={active}
            aria-label={label}
            onClick={() => patchStyle({ dotStyle: style })}
          >
            <span className={`dot-preview dot-preview--${style}`} aria-hidden="true">
              {Array.from({ length: 9 }, (_, index) => (
                <span key={index} className="dot-preview-cell" />
              ))}
            </span>
            <span className="dot-option-label">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
