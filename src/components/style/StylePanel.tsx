import { ArrowClockwise } from '@phosphor-icons/react'
import { Segmented } from '@/components/forms/fields'
import { ColorControls } from '@/components/style/ColorControls'
import { DotStyleGrid } from '@/components/style/DotStyleGrid'
import { LogoControl } from '@/components/style/LogoControl'
import { PresetGrid } from '@/components/style/PresetGrid'
import { SizeControls } from '@/components/style/SizeControls'
import { Panel } from '@/components/ui/Panel'
import { useI18n } from '@/hooks/useI18n'
import type { CornerDotStyle, CornerSquareStyle } from '@/lib/types'
import { useStudioStore } from '@/store/studio'
import { useToastStore } from '@/store/toasts'

export function StylePanel() {
  const { t } = useI18n()
  const style = useStudioStore((state) => state.style)
  const patchStyle = useStudioStore((state) => state.patchStyle)
  const resetStyle = useStudioStore((state) => state.resetStyle)
  const pushToast = useToastStore((state) => state.push)

  return (
    <Panel
      id="style"
      step={t('step.two')}
      title={t('section.style')}
      actions={
        <button
          type="button"
          className="ghost-button"
          onClick={() => {
            resetStyle()
            pushToast(t('toast.styleReset'), 'neutral')
          }}
        >
          <ArrowClockwise size={15} />
          {t('style.reset')}
        </button>
      }
    >
      <div className="style-block">
        <div className="style-block-head style-block-head--stack">
          <h3 className="style-title">{t('style.presets')}</h3>
          <p className="style-hint">{t('style.presetsHint')}</p>
        </div>
        <PresetGrid />
      </div>

      <div className="style-block">
        <h3 className="style-title">{t('style.dots')}</h3>
        <DotStyleGrid />

        <div className="corner-grid">
          <div className="field corner-field">
            <span className="field-label">{t('style.cornerOuter')}</span>
            <Segmented
              name="corner-square"
              label={t('style.cornerOuter')}
              value={style.cornerSquareStyle}
              onChange={(cornerSquareStyle: CornerSquareStyle) =>
                patchStyle({ cornerSquareStyle })
              }
              options={[
                { value: 'square', label: t('style.corners.square') },
                { value: 'extra-rounded', label: t('style.corners.extra-rounded') },
                { value: 'dot', label: t('style.corners.dot') },
              ]}
              compact
            />
          </div>
          <div className="field corner-field">
            <span className="field-label">{t('style.cornerInner')}</span>
            <Segmented
              name="corner-dot"
              label={t('style.cornerInner')}
              value={style.cornerDotStyle}
              onChange={(cornerDotStyle: CornerDotStyle) =>
                patchStyle({ cornerDotStyle })
              }
              options={[
                { value: 'square', label: t('style.corners.square') },
                { value: 'dot', label: t('style.corners.dot') },
              ]}
              compact
            />
          </div>
        </div>
      </div>

      <ColorControls />
      <SizeControls />
      <LogoControl />
    </Panel>
  )
}
