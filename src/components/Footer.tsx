import { useI18n } from '@/hooks/useI18n'
import { useUiStore } from '@/store/ui'
import { BrandMark } from '@/components/BrandMark'

export function Footer() {
  const { t } = useI18n()
  const openSettings = useUiStore((state) => state.openSettings)
  const openHelp = useUiStore((state) => state.openHelp)

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <BrandMark size={22} />
          <span>QR Code Studio</span>
          <span className="footer-version mono">{t('footer.version')}</span>
        </div>
        <div className="footer-links">
          <span className="footer-local">
            <span className="local-dot" aria-hidden="true" />
            {t('footer.local')}
          </span>
          <button type="button" className="text-link" onClick={openHelp}>
            {t('footer.help')}
          </button>
          <button type="button" className="text-link" onClick={openSettings}>
            {t('footer.privacy')}
          </button>
        </div>
      </div>
    </footer>
  )
}
