import { SpecimenQr } from '@/components/SpecimenQr'
import { useI18n } from '@/hooks/useI18n'
import { CONTENT_TYPES } from '@/lib/types'

export function Hero() {
  const { t } = useI18n()

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow">
          <span className="eyebrow-dot" aria-hidden="true" />
          {t('brand.tagline')}
          <span className="eyebrow-separator" aria-hidden="true" />
          <span className="mono">{`${CONTENT_TYPES.length} formats`}</span>
        </p>
        <h1 id="hero-title" className="hero-title">
          {t('hero.title')}
        </h1>
        <p className="hero-subtitle">{t('hero.subtitle')}</p>
      </div>

      <aside className="hero-spec" aria-label={t('hero.trust')}>
        <div className="spec-card">
          <div className="spec-head">
            <span>{t('preview.live')}</span>
            <span className="mono">N° 001</span>
          </div>
          <SpecimenQr className="spec-qr" />
          <div className="spec-foot">
            <span className="mono">QR / 21 × 21</span>
            <span className="spec-status">
              <span className="status-dot status-dot--ok" aria-hidden="true" />
              {t('status.scannable')}
            </span>
          </div>
        </div>
        <p className="spec-caption">
          <span className="mono">↳</span> {t('hero.trustHint')}
        </p>
      </aside>
    </section>
  )
}
