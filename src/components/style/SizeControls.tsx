import { useState, type CSSProperties } from 'react'
import { Segmented } from '@/components/forms/fields'
import { useI18n } from '@/hooks/useI18n'
import { MAX_MARGIN, MIN_MARGIN, SIZE_PRESETS } from '@/lib/config'
import type { ErrorCorrectionLevel } from '@/lib/types'
import { useStudioStore } from '@/store/studio'

const MIN_SIZE = 128
const MAX_SIZE = 2048

export function SizeControls() {
  const { t } = useI18n()
  const style = useStudioStore((state) => state.style)
  const patchStyle = useStudioStore((state) => state.patchStyle)
  const [sizeDraft, setSizeDraft] = useState(String(style.size))
  const [lastSize, setLastSize] = useState(style.size)

  // Keep the text field in sync when a preset or the slider changes the size.
  if (style.size !== lastSize) {
    setLastSize(style.size)
    setSizeDraft(String(style.size))
  }

  function commitSize() {
    const parsed = Number(sizeDraft)
    if (!Number.isFinite(parsed)) {
      setSizeDraft(String(style.size))
      return
    }
    const clamped = Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(parsed)))
    setSizeDraft(String(clamped))
    patchStyle({ size: clamped })
  }

  return (
    <div className="style-block">
      <div className="style-block-head">
        <h3 className="style-title">{t('style.size')}</h3>
      </div>

      <div className="size-row">
        {SIZE_PRESETS.map((size) => {
          const active = style.size === size
          return (
            <button
              key={size}
              type="button"
              className={active ? 'size-chip size-chip--active' : 'size-chip'}
              aria-pressed={active}
              onClick={() => patchStyle({ size })}
            >
              <span className="mono">{size}</span>
              <span className="size-unit">px</span>
            </button>
          )
        })}
        <label className="size-custom" htmlFor="custom-size">
          <span className="size-custom-label">{t('style.customSize')}</span>
          <span className="input-wrap input-wrap--mono">
            <input
              id="custom-size"
              type="number"
              min={MIN_SIZE}
              max={MAX_SIZE}
              step={1}
              value={sizeDraft}
              onChange={(event) => setSizeDraft(event.target.value)}
              onBlur={commitSize}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commitSize()
                }
              }}
              className="input input--size mono"
              aria-describedby="custom-size-hint"
            />
          </span>
        </label>
      </div>
      <p id="custom-size-hint" className="field-hint">
        {t('hint.customSize')}
      </p>

      <div className="range-control">
        <div className="range-head">
          <label htmlFor="margin" className="range-label">
            {t('style.margin')}
          </label>
          <output htmlFor="margin" className="range-value mono">
            {style.margin} ×
          </output>
        </div>
        <input
          id="margin"
          type="range"
          min={MIN_MARGIN}
          max={MAX_MARGIN}
          step={1}
          value={style.margin}
          onChange={(event) => patchStyle({ margin: Number(event.target.value) })}
          className="range"
          aria-describedby="margin-hint"
          style={
            {
              '--range-progress': `${(style.margin / MAX_MARGIN) * 100}%`,
            } as CSSProperties
          }
        />
        <p id="margin-hint" className="field-hint">
          {t('hint.margin')}
        </p>
      </div>

      <div className="correction-control">
        <div className="range-head">
          <span className="range-label">{t('style.correction')}</span>
          <span className="range-value mono">{style.errorCorrection}</span>
        </div>
        <Segmented
          name="error-correction"
          label={t('style.correction')}
          value={style.errorCorrection}
          onChange={(errorCorrection: ErrorCorrectionLevel) =>
            patchStyle({ errorCorrection })
          }
          options={[
            { value: 'L', label: 'L' },
            { value: 'M', label: 'M' },
            { value: 'Q', label: 'Q' },
            { value: 'H', label: 'H' },
          ]}
          compact
        />
        <p className="field-hint">{t('style.correctionHint')}</p>
        {style.logo &&
        (style.errorCorrection === 'L' || style.errorCorrection === 'M') ? (
          <p className="inline-warning">{t('style.correctionLow')}</p>
        ) : null}
      </div>
    </div>
  )
}
