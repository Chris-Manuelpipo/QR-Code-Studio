import {
  Check,
  CheckCircle,
  Circle,
  CircleNotch,
  Warning,
  WarningCircle,
  XCircle,
} from '@phosphor-icons/react'
import { useI18n } from '@/hooks/useI18n'
import { getQrContrast } from '@/lib/utils/colors'
import { getLogoArea } from '@/lib/validation/scannability'
import type { ScannabilityResult, StyleConfig, ValidationWarning } from '@/lib/types'
import { useStudioStore } from '@/store/studio'
import type { TranslationKey } from '@/i18n'

interface ChecksPanelProps {
  validation: ScannabilityResult
  style: StyleConfig
  checking: boolean
}

type RowTone = 'pass' | 'warn' | 'fail' | 'neutral'

function RowIcon({ tone }: { tone: RowTone }) {
  if (tone === 'pass') return <CheckCircle size={16} weight="fill" />
  if (tone === 'warn') return <WarningCircle size={16} weight="fill" />
  if (tone === 'fail') return <XCircle size={16} weight="fill" />
  return <Circle size={16} />
}

export function ChecksPanel({ validation, style, checking }: ChecksPanelProps) {
  const { t, locale } = useI18n()
  const patchStyle = useStudioStore((state) => state.patchStyle)

  const contrast = getQrContrast(style.dotColor, style.dotColor2, style.backgroundColor)
  const contrastText = contrast.toFixed(1).replace('.', locale === 'fr' ? ',' : '.')
  const logoArea = getLogoArea(style)
  const logoPercent = Math.round(logoArea * 100)
  const warnings = validation.warnings
  const decodeState: RowTone =
    checking || validation.status === 'idle' || validation.status === 'checking'
      ? 'neutral'
      : validation.status === 'unscannable'
        ? 'fail'
        : 'pass'
  const decodeLabel = checking
    ? t('status.checkDecodePending')
    : decodeState === 'pass'
      ? t('status.checkDecode')
      : decodeState === 'fail'
        ? t('status.decode_failed')
        : t('status.checkDecodePending')

  const rows: Array<{ key: string; tone: RowTone; label: string; meta?: string }> = [
    {
      key: 'decode',
      tone: decodeState,
      label: decodeLabel,
      meta:
        validation.durationMs > 0
          ? t('status.decodeTime', { ms: validation.durationMs })
          : undefined,
    },
    {
      key: 'logo',
      tone: style.logo ? (logoArea > 0.2 ? 'warn' : 'pass') : 'neutral',
      label: style.logo ? t('status.checkLogoTarget') : t('status.noLogo'),
      meta: style.logo ? t('status.ratio', { percent: logoPercent }) : undefined,
    },
    {
      key: 'margin',
      tone: style.margin >= 4 ? 'pass' : 'warn',
      label: t('status.checkMargin', { margin: style.margin }),
    },
    {
      key: 'contrast',
      tone: contrast >= 4.5 ? 'pass' : 'warn',
      label: t('status.checkContrast', { ratio: contrastText }),
    },
  ]

  function applyWarningAction(warning: ValidationWarning) {
    switch (warning.action) {
      case 'reduce_logo':
        patchStyle({ logoImageSize: Math.min(style.logoImageSize, 0.3) })
        break
      case 'set_h':
        patchStyle({ errorCorrection: 'H' })
        break
      case 'set_margin':
        patchStyle({ margin: 4 })
        break
      case 'set_size':
        patchStyle({
          colorMode: 'solid',
          dotColor: '#171714',
          dotColor2: '#2f3a1f',
          backgroundColor: '#fbfaf5',
          transparentBackground: false,
        })
        break
      default:
        break
    }
  }

  return (
    <div
      className="checks"
      aria-labelledby="checks-title"
      data-checked-at={validation.checkedAt}
    >
      <div className="checks-head">
        <h3 id="checks-title" className="checks-title">
          {t('status.checksTitle')}
        </h3>
        <span className="checks-count mono">
          {checking ? (
            <CircleNotch size={13} className="spin" aria-hidden="true" />
          ) : null}
          {warnings.length > 0
            ? warnings.length === 1
              ? t('status.warningCount', { count: 1 })
              : t('status.warningCountPlural', { count: warnings.length })
            : t('status.checkedLocally')}
        </span>
      </div>

      <ul className="check-list">
        {rows.map((row) => (
          <li key={row.key} className={`check-row check-row--${row.tone}`}>
            <span className="check-icon" aria-hidden="true">
              <RowIcon tone={row.tone} />
            </span>
            <span className="check-label">{row.label}</span>
            {row.meta ? <span className="check-meta mono">{row.meta}</span> : null}
          </li>
        ))}
      </ul>

      {validation.message ? (
        <p className="check-message">
          <Warning size={15} weight="fill" aria-hidden="true" />
          {t(`status.${validation.message}` as TranslationKey)}
        </p>
      ) : null}

      {warnings.length > 0 ? (
        <ul className="warning-list">
          {warnings.map((warning) => (
            <li key={warning.code} className="warning-item">
              <span className="warning-copy">
                <WarningCircle size={15} weight="fill" aria-hidden="true" />
                {t(`warning.${warning.code}` as TranslationKey)}
              </span>
              {warning.action ? (
                <button
                  type="button"
                  className="warning-action"
                  onClick={() => applyWarningAction(warning)}
                >
                  <Check size={13} weight="bold" />
                  {t(`warning.action.${warning.action}` as TranslationKey)}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
