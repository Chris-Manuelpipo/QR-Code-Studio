import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { CircleNotch, ImageSquare, UploadSimple, X } from '@phosphor-icons/react'
import { Segmented } from '@/components/forms/fields'
import { ColorInput } from '@/components/style/ColorInput'
import { useI18n } from '@/hooks/useI18n'
import { LOGO_MAX_AREA } from '@/lib/config'
import { buildLogo, LogoError, prepareLogoSource } from '@/lib/logo/process'
import type { LogoBackground } from '@/lib/types'
import { getLogoArea } from '@/lib/validation/scannability'
import { useStudioStore } from '@/store/studio'
import { useToastStore } from '@/store/toasts'

export function LogoControl() {
  const { t, te } = useI18n()
  const style = useStudioStore((state) => state.style)
  const setLogoSource = useStudioStore((state) => state.setLogoSource)
  const setLogo = useStudioStore((state) => state.setLogo)
  const patchStyle = useStudioStore((state) => state.patchStyle)
  const pushToast = useToastStore((state) => state.push)
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [composing, setComposing] = useState(false)
  const [dragging, setDragging] = useState(false)

  const { logoSource, logoName, logo, logoBackground, logoBackgroundColor } = style
  const area = getLogoArea(style)
  const surfacePercent = Math.round(area * 100)
  const tooLarge = area > LOGO_MAX_AREA

  useEffect(() => {
    if (!logoSource) return
    let cancelled = false
    async function compose() {
      // Yield once so the composing indicator is not a synchronous render.
      await Promise.resolve()
      if (cancelled) return
      setComposing(true)
      try {
        const composed = await buildLogo(logoSource as string, {
          logoBackground,
          logoBackgroundColor,
        })
        if (!cancelled) setLogo(composed)
      } catch {
        if (cancelled) return
        pushToast(t('errors.invalid_image'), 'danger')
        setLogoSource(null, null)
      } finally {
        if (!cancelled) setComposing(false)
      }
    }
    void compose()
    return () => {
      cancelled = true
    }
  }, [
    logoSource,
    logoBackground,
    logoBackgroundColor,
    setLogo,
    setLogoSource,
    pushToast,
    t,
  ])

  async function handleFile(file: File) {
    setBusy(true)
    try {
      const source = await prepareLogoSource(file)
      setLogoSource(source, file.name)
      patchStyle({
        errorCorrection: 'H',
        logoImageSize: Math.min(style.logoImageSize, 0.34),
        logoBackground:
          style.logoBackground === 'none' ? 'light' : style.logoBackground,
      })
      pushToast(t('toast.logoAdded'), 'success')
    } catch (error) {
      const code = error instanceof LogoError ? error.code : 'invalid_image'
      pushToast(te(code) ?? t('errors.invalid_image'), 'danger')
    } finally {
      setBusy(false)
    }
  }

  function openPicker() {
    inputRef.current?.click()
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  function removeLogo() {
    setLogoSource(null, null)
    pushToast(t('toast.logoRemoved'), 'neutral')
  }

  return (
    <div className="style-block logo-block">
      <div className="style-block-head">
        <h3 className="style-title">{t('style.logo')}</h3>
        {logoSource ? (
          <span className="logo-surface-badge mono">
            {t('style.logoSurface', { percent: surfacePercent })}
          </span>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        className="visually-hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleFile(file)
          event.target.value = ''
        }}
        aria-label={t('field.logoUpload')}
        tabIndex={-1}
      />

      {!logoSource ? (
        <button
          type="button"
          className={dragging ? 'logo-empty logo-empty--drag' : 'logo-empty'}
          onClick={openPicker}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          aria-busy={busy}
        >
          <span className="logo-empty-icon" aria-hidden="true">
            {busy ? (
              <CircleNotch size={24} className="spin" />
            ) : (
              <UploadSimple size={24} />
            )}
          </span>
          <span className="logo-empty-title">
            {busy ? t('common.loading') : t('style.logoDrag')}
          </span>
          <span className="logo-empty-text">{t('style.logoEmptyText')}</span>
          <span className="logo-empty-cta">
            <ImageSquare size={15} />
            {t('style.chooseLogo')}
          </span>
          <span className="logo-empty-hint">{t('hint.logo')}</span>
        </button>
      ) : (
        <div
          className={dragging ? 'logo-card logo-card--drag' : 'logo-card'}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="logo-preview">
            {logo ? (
              <img src={logo} alt={t('style.logoAlt')} className="logo-image" />
            ) : (
              <span className="logo-preview-loader" aria-hidden="true">
                <CircleNotch size={20} className="spin" />
              </span>
            )}
            {composing ? (
              <span className="logo-composing" aria-label={t('common.loading')}>
                <CircleNotch size={14} className="spin" />
              </span>
            ) : null}
          </div>
          <div className="logo-meta">
            <span className="logo-name" title={logoName ?? undefined}>
              {logoName ?? t('style.logo')}
            </span>
            <span className="logo-file-hint">{t('style.logoReplaceHint')}</span>
            <div className="logo-actions">
              <button type="button" className="ghost-button" onClick={openPicker}>
                {t('style.replaceLogo')}
              </button>
              <button
                type="button"
                className="ghost-button ghost-button--danger"
                onClick={removeLogo}
              >
                <X size={14} />
                {t('style.removeLogo')}
              </button>
            </div>
          </div>
        </div>
      )}

      {logoSource ? (
        <>
          <div className="range-control">
            <div className="range-head">
              <label htmlFor="logo-size" className="range-label">
                {t('style.logoSize')}
              </label>
              <output htmlFor="logo-size" className="range-value mono">
                {surfacePercent}%
              </output>
            </div>
            <input
              id="logo-size"
              type="range"
              min={0.15}
              max={0.8}
              step={0.01}
              value={style.logoImageSize}
              onChange={(event) =>
                patchStyle({ logoImageSize: Number(event.target.value) })
              }
              className="range"
              aria-describedby="logo-size-hint"
              style={
                {
                  '--range-progress': `${((style.logoImageSize - 0.15) / 0.65) * 100}%`,
                } as CSSProperties
              }
            />
            <p
              id="logo-size-hint"
              className={tooLarge ? 'inline-warning' : 'field-hint'}
            >
              {tooLarge
                ? t('style.logoWarning')
                : t('style.logoSurface', { percent: surfacePercent })}
            </p>
          </div>

          <div className="logo-background">
            <span className="range-label">{t('style.logoBackground')}</span>
            <Segmented
              name="logo-background"
              label={t('style.logoBackground')}
              value={logoBackground}
              onChange={(value: LogoBackground) =>
                patchStyle({ logoBackground: value })
              }
              options={[
                { value: 'none', label: t('style.logoBgNone') },
                { value: 'light', label: t('style.logoBgLight') },
                { value: 'dark', label: t('style.logoBgDark') },
                { value: 'custom', label: t('style.logoBgCustom') },
              ]}
              compact
            />
            {logoBackground === 'custom' ? (
              <ColorInput
                id="logo-background-color"
                label={t('style.logoBgCustom')}
                value={logoBackgroundColor}
                onChange={(value) => patchStyle({ logoBackgroundColor: value })}
              />
            ) : null}
          </div>

          {style.errorCorrection === 'H' ? (
            <p className="field-hint logo-auto-hint">{t('style.logoAutoH')}</p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
