import { GearSix, Moon, ShieldCheck, Sun, Trash, X } from '@phosphor-icons/react'
import { Segmented } from '@/components/forms/fields'
import { Dialog } from '@/components/dialogs/Dialog'
import { useI18n } from '@/hooks/useI18n'
import { HISTORY_LIMITS } from '@/lib/config'
import { purgeEntries } from '@/lib/storage/db'
import { useHistoryStore } from '@/store/history'
import { useSettingsStore } from '@/store/settings'
import { useToastStore } from '@/store/toasts'
import { useUiStore } from '@/store/ui'

export function SettingsDialog() {
  const { t } = useI18n()
  const open = useUiStore((state) => state.settingsOpen)
  const close = useUiStore((state) => state.closeSettings)
  const openClearHistory = useUiStore((state) => state.openClearHistory)
  const theme = useSettingsStore((state) => state.theme)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const locale = useSettingsStore((state) => state.locale)
  const setLocale = useSettingsStore((state) => state.setLocale)
  const privateMode = useSettingsStore((state) => state.privateMode)
  const setPrivateMode = useSettingsStore((state) => state.setPrivateMode)
  const historyLimit = useSettingsStore((state) => state.historyLimit)
  const setHistoryLimit = useSettingsStore((state) => state.setHistoryLimit)
  const entries = useHistoryStore((state) => state.entries)
  const pushToast = useToastStore((state) => state.push)

  async function handleLimitChange(limit: number) {
    setHistoryLimit(limit)
    try {
      const kept = await purgeEntries(limit)
      useHistoryStore.getState().setEntries(kept)
    } catch {
      // The limit still applies on the next save.
    }
    pushToast(t('toast.retentionUpdated'), 'neutral')
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      labelledBy="settings-title"
      className="dialog--settings"
    >
      <header className="dialog-head">
        <span className="dialog-kicker mono">
          <GearSix size={14} />
          {t('header.settings')}
        </span>
        <button
          type="button"
          className="icon-button dialog-close"
          onClick={close}
          aria-label={t('settings.close')}
        >
          <X size={20} />
        </button>
        <h2 id="settings-title" className="dialog-title">
          {t('settings.title')}
        </h2>
        <p className="dialog-subtitle">{t('settings.subtitle')}</p>
      </header>

      <div className="dialog-body">
        <div className="privacy-banner">
          <span className="privacy-icon" aria-hidden="true">
            <ShieldCheck size={22} weight="fill" />
          </span>
          <div>
            <h3 className="privacy-title">{t('settings.localTitle')}</h3>
            <p className="privacy-body">{t('settings.localBody')}</p>
          </div>
        </div>

        <section className="settings-section">
          <div className="settings-label">
            <h3>{t('settings.theme')}</h3>
          </div>
          <Segmented
            name="theme"
            label={t('settings.theme')}
            value={theme}
            onChange={(value) => setTheme(value)}
            options={[
              {
                value: 'light',
                label: t('settings.themeLight'),
                icon: <Sun size={15} />,
              },
              {
                value: 'dark',
                label: t('settings.themeDark'),
                icon: <Moon size={15} />,
              },
            ]}
          />
        </section>

        <section className="settings-section">
          <div className="settings-label">
            <h3>{t('settings.language')}</h3>
          </div>
          <Segmented
            name="language"
            label={t('settings.language')}
            value={locale}
            onChange={(value) => setLocale(value)}
            options={[
              { value: 'fr', label: t('language.fr') },
              { value: 'en', label: t('language.en') },
            ]}
          />
        </section>

        <section className="settings-section settings-section--row">
          <div className="settings-label">
            <h3>{t('settings.private')}</h3>
            <p>{t('settings.privateHint')}</p>
          </div>
          <label className="switch" htmlFor="private-mode">
            <input
              id="private-mode"
              type="checkbox"
              className="switch-input"
              checked={privateMode}
              onChange={(event) => {
                setPrivateMode(event.target.checked)
                pushToast(
                  event.target.checked
                    ? t('toast.privateModeOn')
                    : t('toast.privateModeOff'),
                  'neutral',
                )
              }}
            />
            <span className="visually-hidden">{t('settings.private')}</span>
            <span className="switch-track" aria-hidden="true">
              <span className="switch-thumb" />
            </span>
          </label>
        </section>

        <section className="settings-section settings-section--row">
          <div className="settings-label">
            <h3>{t('settings.retention')}</h3>
            <p>{t('settings.retentionHint')}</p>
          </div>
          <span className="select-wrap select-wrap--settings">
            <select
              className="input select"
              value={historyLimit}
              onChange={(event) => void handleLimitChange(Number(event.target.value))}
              aria-label={t('settings.retention')}
            >
              {HISTORY_LIMITS.map((limit) => (
                <option key={limit} value={limit}>
                  {limit}
                </option>
              ))}
            </select>
          </span>
        </section>

        <section className="settings-section">
          <div className="settings-label">
            <h3>{t('settings.storage')}</h3>
            <p>
              {entries.length === 1
                ? t('history.oneEntry')
                : t('history.manyEntries', { count: entries.length })}
            </p>
          </div>
          <button
            type="button"
            className="ghost-button ghost-button--danger settings-clear"
            onClick={() => {
              close()
              openClearHistory()
            }}
            disabled={entries.length === 0}
          >
            <Trash size={15} />
            {t('history.clear')}
          </button>
        </section>

        <section className="settings-section settings-section--about">
          <div className="settings-label">
            <h3>{t('settings.about')}</h3>
            <p>{t('settings.aboutBody')}</p>
          </div>
          <p className="settings-privacy">{t('settings.privacyBody')}</p>
        </section>
      </div>

      <footer className="dialog-foot">
        <span className="mono">{t('settings.version')}</span>
        <button type="button" className="primary-button" onClick={close}>
          {t('settings.close')}
        </button>
      </footer>
    </Dialog>
  )
}
