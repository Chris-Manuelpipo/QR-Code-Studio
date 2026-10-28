import { GearSix, Moon, Plus, Question, Sun, Translate } from '@phosphor-icons/react'
import { BrandMark } from '@/components/BrandMark'
import { useI18n } from '@/hooks/useI18n'
import { useSettingsStore } from '@/store/settings'
import { useStudioStore } from '@/store/studio'
import { useToastStore } from '@/store/toasts'
import { useUiStore } from '@/store/ui'

export function Header() {
  const { t, locale } = useI18n()
  const theme = useSettingsStore((state) => state.theme)
  const toggleTheme = useSettingsStore((state) => state.toggleTheme)
  const toggleLocale = useSettingsStore((state) => state.toggleLocale)
  const newCode = useStudioStore((state) => state.newCode)
  const openSettings = useUiStore((state) => state.openSettings)
  const openHelp = useUiStore((state) => state.openHelp)
  const pushToast = useToastStore((state) => state.push)

  function handleNew() {
    newCode()
    pushToast(t('toast.newCode'), 'neutral')
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#main">
          <span className="brand-badge">
            <BrandMark size={30} />
          </span>
          <span className="brand-text">
            <span className="brand-name">QR Code Studio</span>
            <span className="brand-tagline">{t('brand.tagline')}</span>
          </span>
          <span className="visually-hidden">{t('header.home')}</span>
        </a>

        <div className="header-actions">
          <span className="local-chip" title={t('header.local')}>
            <span className="local-dot" aria-hidden="true" />
            {t('header.local')}
          </span>

          <button
            type="button"
            className="icon-button header-utility"
            onClick={openHelp}
            aria-label={t('header.help')}
            title={t('header.help')}
          >
            <Question size={19} />
          </button>

          <button
            type="button"
            className="icon-button header-utility"
            onClick={openSettings}
            aria-label={t('header.settings')}
            title={t('header.settings')}
          >
            <GearSix size={19} />
          </button>

          <button
            type="button"
            className="icon-button"
            onClick={() => {
              toggleTheme()
              pushToast(t('toast.themeUpdated'), 'neutral')
            }}
            aria-label={t('header.theme')}
            aria-pressed={theme === 'dark'}
            title={t('header.theme')}
          >
            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
          </button>

          <button
            type="button"
            className="lang-button"
            onClick={toggleLocale}
            title={t('header.language')}
          >
            <Translate size={17} />
            <span className="lang-label">{locale === 'fr' ? 'FR' : 'EN'}</span>
            <span className="visually-hidden">{t('header.language')}</span>
          </button>

          <button
            type="button"
            className="primary-button header-new"
            onClick={handleNew}
            aria-label={t('header.new')}
          >
            <Plus size={17} weight="bold" />
            <span className="header-new-label">{t('header.new')}</span>
            <span className="header-new-label-short">{t('header.newShort')}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
