import {
  CircleNotch,
  CopySimple,
  LockSimple,
  QrCode,
  Warning,
} from '@phosphor-icons/react'
import { ChecksPanel } from '@/components/preview/ChecksPanel'
import { ScannabilityBadge } from '@/components/preview/ScannabilityBadge'
import { Panel } from '@/components/ui/Panel'
import { useI18n } from '@/hooks/useI18n'
import type { QrPreviewState } from '@/hooks/useQrPreview'
import { getLogoArea } from '@/lib/validation/scannability'
import { useStudioStore } from '@/store/studio'
import { useToastStore } from '@/store/toasts'

const PREVIEW_WIDTH = 480

interface PreviewStageProps {
  payload: string | null
  preview: QrPreviewState
}

export function PreviewStage({ payload, preview }: PreviewStageProps) {
  const { t } = useI18n()
  const style = useStudioStore((state) => state.style)
  const pushToast = useToastStore((state) => state.push)
  const { previewUrl, validation, error, checking } = preview

  async function copyPayload() {
    if (!payload) return
    try {
      await navigator.clipboard.writeText(payload)
      pushToast(t('preview.payloadCopied'), 'success')
    } catch {
      pushToast(t('preview.payloadCopyError'), 'danger')
    }
  }

  const shortPayload =
    payload && payload.length > 180 ? `${payload.slice(0, 177)}…` : payload

  return (
    <Panel
      id="preview"
      step={t('step.three')}
      title={t('preview.live')}
      className="preview-panel"
      actions={
        <span className="panel-chip panel-chip--quiet">
          <LockSimple size={13} />
          {t('preview.localChip')}
        </span>
      }
    >
      <div className="stage" aria-busy={checking}>
        <div className="stage-topbar">
          <span className="stage-live mono">
            <span className="live-dot" aria-hidden="true" />
            LIVE
          </span>
          <span className="stage-topbar-meta mono">
            {style.size} × {style.size}
          </span>
        </div>

        <div className="stage-canvas">
          {error ? (
            <div className="stage-state stage-state--error" role="alert">
              <span className="stage-state-icon" aria-hidden="true">
                <Warning size={28} weight="fill" />
              </span>
              <h3 className="stage-state-title">{t('preview.errorTitle')}</h3>
              <p className="stage-state-text">
                {error === 'capacity' ? t('errors.capacity') : t('errors.generation')}
              </p>
            </div>
          ) : previewUrl && payload ? (
            <div
              className={
                style.transparentBackground
                  ? 'qr-frame qr-frame--transparent'
                  : 'qr-frame'
              }
            >
              <span className="qr-corner qr-corner--tl" aria-hidden="true" />
              <span className="qr-corner qr-corner--tr" aria-hidden="true" />
              <span className="qr-corner qr-corner--bl" aria-hidden="true" />
              <span className="qr-corner qr-corner--br" aria-hidden="true" />
              <img
                src={previewUrl}
                alt={t('preview.canvasAria', { payload: payload.slice(0, 120) })}
                className="qr-image"
                width={PREVIEW_WIDTH}
                height={PREVIEW_WIDTH}
              />
            </div>
          ) : (
            <div className="stage-state">
              <span className="stage-state-icon" aria-hidden="true">
                <QrCode size={30} />
              </span>
              <h3 className="stage-state-title">{t('preview.waitingTitle')}</h3>
              <p className="stage-state-text">{t('preview.waitingText')}</p>
            </div>
          )}

          {checking && previewUrl ? (
            <span className="stage-checking">
              <CircleNotch size={14} className="spin" />
              {t('preview.checking')}
            </span>
          ) : null}
        </div>

        <div className="stage-footer">
          <ScannabilityBadge validation={validation} checking={checking} />
          <span className="stage-scan mono">
            {t('preview.scanAt', { size: style.size })}
          </span>
        </div>
      </div>

      <div className="preview-meta-row">
        <p className="preview-meta mono">
          {t('preview.meta', {
            size: style.size,
            ec: style.errorCorrection,
            margin: style.margin,
          })}
        </p>
        {style.logo ? (
          <span className="preview-logo-note mono">
            {t('preview.logoNote', {
              percent: Math.round(getLogoArea(style) * 100),
            })}
          </span>
        ) : null}
      </div>

      {payload ? (
        <div className="payload-box">
          <div className="payload-head">
            <span className="payload-label mono">{t('preview.payload')}</span>
            <button
              type="button"
              className="copy-button"
              onClick={() => void copyPayload()}
              aria-label={t('preview.copyPayload')}
            >
              <CopySimple size={15} />
              {t('common.copy')}
            </button>
          </div>
          <code className="payload-value" dir="ltr">
            {shortPayload}
          </code>
        </div>
      ) : null}

      <ChecksPanel validation={validation} style={style} checking={checking} />

      <p className="preview-footer">{t('preview.footer')}</p>
    </Panel>
  )
}
