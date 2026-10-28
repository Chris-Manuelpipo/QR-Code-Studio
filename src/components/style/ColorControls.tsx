import type { CSSProperties } from 'react'
import { CheckboxField, Segmented } from '@/components/forms/fields'
import { ColorInput } from '@/components/style/ColorInput'
import { useI18n } from '@/hooks/useI18n'
import { useStudioStore } from '@/store/studio'

export function ColorControls() {
  const { t } = useI18n()
  const style = useStudioStore((state) => state.style)
  const patchStyle = useStudioStore((state) => state.patchStyle)

  return (
    <div className="style-block">
      <div className="style-block-head">
        <h3 className="style-title">{t('style.colors')}</h3>
      </div>

      <Segmented
        name="color-mode"
        label={t('style.colors')}
        value={style.colorMode}
        onChange={(colorMode) => patchStyle({ colorMode })}
        options={[
          { value: 'solid', label: t('style.solid') },
          { value: 'linear', label: t('style.linear') },
          { value: 'radial', label: t('style.radial') },
        ]}
      />

      <div className="color-grid">
        <ColorInput
          id="dot-color"
          label={t('style.primary')}
          value={style.dotColor}
          onChange={(dotColor) => patchStyle({ dotColor })}
        />
        {style.colorMode !== 'solid' ? (
          <ColorInput
            id="dot-color-2"
            label={t('style.secondary')}
            value={style.dotColor2}
            onChange={(dotColor2) => patchStyle({ dotColor2 })}
          />
        ) : null}
        <ColorInput
          id="background-color"
          label={t('style.background')}
          value={style.backgroundColor}
          onChange={(backgroundColor) => patchStyle({ backgroundColor })}
          disabled={style.transparentBackground}
        />
      </div>

      {style.colorMode === 'linear' ? (
        <div className="range-control">
          <div className="range-head">
            <label htmlFor="gradient-rotation" className="range-label">
              {t('style.rotation')}
            </label>
            <output htmlFor="gradient-rotation" className="range-value mono">
              {style.gradientRotation}°
            </output>
          </div>
          <input
            id="gradient-rotation"
            type="range"
            min={0}
            max={360}
            step={5}
            value={style.gradientRotation}
            onChange={(event) =>
              patchStyle({ gradientRotation: Number(event.target.value) })
            }
            className="range"
            style={
              {
                '--range-progress': `${(style.gradientRotation / 360) * 100}%`,
              } as CSSProperties
            }
          />
        </div>
      ) : null}

      <CheckboxField
        id="transparent-background"
        label={t('export.transparent')}
        hint={t('style.backgroundTransparentExport')}
        checked={style.transparentBackground}
        onChange={(event) =>
          patchStyle({ transparentBackground: event.target.checked })
        }
      />
    </div>
  )
}
