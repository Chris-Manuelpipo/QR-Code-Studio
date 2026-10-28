import { useState } from 'react'
import {
  CircleNotch,
  CopySimple,
  FilePdf,
  FilePng,
  FileSvg,
  ShieldCheck,
  WarningCircle,
} from '@phosphor-icons/react'
import { Panel } from '@/components/ui/Panel'
import { useI18n } from '@/hooks/useI18n'
import { copyPngToClipboard, exportPdf, exportPng, exportSvg } from '@/lib/export'
import { CONTENT_TYPE_LABEL_KEYS } from '@/lib/config'
import type { ScannabilityResult } from '@/lib/types'
import { useStudioStore } from '@/store/studio'
import { useToastStore } from '@/store/toasts'

type ExportAction = 'png' | 'svg' | 'pdf' | 'copy'

interface ExportPanelProps {
  payload: string | null
  validation: ScannabilityResult
  checking: boolean
}

export function ExportPanel({ payload, validation, checking }: ExportPanelProps) {
  const { t, locale } = useI18n()
  const type = useStudioStore((state) => state.type)
  const style = useStudioStore((state) => state.style)
  const pushToast = useToastStore((state) => state.push)
  const [busy, setBusy] = useState<ExportAction | null>(null)
  const [lastAction, setLastAction] = useState<ExportAction | null>(null)

  const disabled = !payload || busy !== null
  const warning = !payload
    ? t('export.requiresContent')
    : validation.status === 'unscannable' && !checking
      ? t('export.warning')
      : validation.status === 'attention' && !checking
        ? t('export.warning')
        : null
  const warningTone = validation.status === 'unscannable' ? 'danger' : 'warning'

  async function run(action: ExportAction) {
    if (!payload) {
      pushToast(t('toast.exportBlocked'), 'warning')
      return
    }
    setBusy(action)
    setLastAction(action)
    try {
      if (action === 'png') {
        await exportPng(payload, style, type)
        pushToast(t('export.success.png'), 'success')
      } else if (action === 'svg') {
        await exportSvg(payload, style, type)
        pushToast(t('export.success.svg'), 'success')
      } else if (action === 'pdf') {
        await exportPdf(payload, style, type, t(CONTENT_TYPE_LABEL_KEYS[type]), locale)
        pushToast(t('export.success.pdf'), 'success')
      } else {
        await copyPngToClipboard(payload, style)
        pushToast(t('export.success.copy'), 'success')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      pushToast(
        message === 'clipboard_unavailable'
          ? t('export.copyUnavailable')
          : t('export.error'),
        'danger',
      )
    } finally {
      setBusy(null)
    }
  }

  const actions: Array<{
    id: ExportAction
    label: string
    hint: string
    icon: typeof FilePng
  }> = [
    { id: 'png', label: t('export.png'), hint: t('export.pngHint'), icon: FilePng },
    { id: 'svg', label: t('export.svg'), hint: t('export.svgHint'), icon: FileSvg },
    { id: 'pdf', label: t('export.pdf'), hint: t('export.pdfHint'), icon: FilePdf },
    {
      id: 'copy',
      label: t('export.copy'),
      hint: t('export.copyHint'),
      icon: CopySimple,
    },
  ]

  return (
    <Panel
      id="export"
      step="04"
      title={t('section.export')}
      hint={t('export.subtitle')}
      className="export-panel"
    >
      <div className="export-grid">
        {actions.map((action) => {
          const Icon = action.icon
          const isBusy = busy === action.id
          const success = !isBusy && busy === null && lastAction === action.id
          return (
            <button
              key={action.id}
              type="button"
              className={success ? 'export-card export-card--done' : 'export-card'}
              onClick={() => void run(action.id)}
              disabled={disabled}
              aria-busy={isBusy}
            >
              <span className="export-icon" aria-hidden="true">
                {isBusy ? (
                  <CircleNotch size={20} className="spin" />
                ) : (
                  <Icon size={20} />
                )}
              </span>
              <span className="export-copy">
                <span className="export-name">{action.label}</span>
                <span className="export-hint">
                  {isBusy ? t('export.working') : action.hint}
                </span>
              </span>
              <span className="export-arrow mono" aria-hidden="true">
                ↗
              </span>
            </button>
          )
        })}
      </div>

      <div className="export-foot">
        {warning ? (
          <p className={`export-warning export-warning--${warningTone}`}>
            <WarningCircle size={15} weight="fill" aria-hidden="true" />
            {warning}
          </p>
        ) : (
          <p className="export-safe">
            <ShieldCheck size={15} weight="fill" aria-hidden="true" />
            {t('status.checkedLocally')} · {t('preview.localChip')}
          </p>
        )}
        <p className="export-note mono">
          {style.size} px · {style.errorCorrection} · PNG · SVG · PDF
        </p>
      </div>
    </Panel>
  )
}
