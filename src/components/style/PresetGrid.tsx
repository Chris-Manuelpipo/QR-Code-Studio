import { Check } from '@phosphor-icons/react'
import { useI18n } from '@/hooks/useI18n'
import { STYLE_PRESETS } from '@/lib/config'
import { useStudioStore } from '@/store/studio'
import { useToastStore } from '@/store/toasts'
import type { TranslationKey } from '@/i18n'

export function PresetGrid() {
  const { t } = useI18n()
  const activePreset = useStudioStore((state) => state.activePreset)
  const applyPreset = useStudioStore((state) => state.applyPreset)
  const pushToast = useToastStore((state) => state.push)

  return (
    <div className="preset-grid">
      {STYLE_PRESETS.map((preset) => {
        const active = preset.id === activePreset
        const name = t(`preset.${preset.id}` as TranslationKey)
        return (
          <button
            key={preset.id}
            type="button"
            className={active ? 'preset preset--active' : 'preset'}
            aria-pressed={active}
            onClick={() => {
              applyPreset(preset.id)
              pushToast(t('toast.styleApplied', { name }), 'success')
            }}
          >
            <span
              className="preset-swatch"
              style={{
                background: `linear-gradient(135deg, ${preset.swatches[0]} 0%, ${preset.swatches[1]} 100%)`,
              }}
              aria-hidden="true"
            />
            <span className="preset-copy">
              <span className="preset-name">{name}</span>
              <span className="preset-code mono">
                {preset.style.colorMode.toUpperCase()}
              </span>
            </span>
            <span className="visually-hidden">{t('style.presetApply')}</span>
            <span className="preset-check" aria-hidden="true">
              {active ? <Check size={13} weight="bold" /> : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}
