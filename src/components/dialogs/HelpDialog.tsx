import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle,
  Keyboard,
  ShieldCheck,
  X,
} from '@phosphor-icons/react'
import { CONTENT_ICONS } from '@/components/contentMeta'
import { Dialog } from '@/components/dialogs/Dialog'
import { useI18n } from '@/hooks/useI18n'
import { CONTENT_TYPE_LABEL_KEYS } from '@/lib/config'
import { CONTENT_TYPES } from '@/lib/types'
import { useUiStore } from '@/store/ui'
import type { TranslationKey } from '@/i18n'

type HelpTab = 'guide' | 'privacy'

export function HelpDialog() {
  const { t } = useI18n()
  const open = useUiStore((state) => state.helpOpen)
  const close = useUiStore((state) => state.closeHelp)
  const [tab, setTab] = useState<HelpTab>('guide')

  return (
    <Dialog
      open={open}
      onClose={close}
      labelledBy="help-title"
      className="dialog--help"
    >
      <header className="dialog-head">
        <span className="dialog-kicker mono">{t('help.guide')}</span>
        <button
          type="button"
          className="icon-button dialog-close"
          onClick={close}
          aria-label={t('help.close')}
        >
          <X size={20} />
        </button>
        <h2 id="help-title" className="dialog-title">
          {t('help.title')}
        </h2>
        <p className="dialog-subtitle">{t('help.intro')}</p>
      </header>

      <div className="help-tabs" role="tablist" aria-label={t('help.title')}>
        <button
          type="button"
          role="tab"
          id="help-tab-guide"
          aria-selected={tab === 'guide'}
          aria-controls="help-panel-guide"
          className={tab === 'guide' ? 'help-tab help-tab--active' : 'help-tab'}
          onClick={() => setTab('guide')}
        >
          {t('help.guide')}
        </button>
        <button
          type="button"
          role="tab"
          id="help-tab-privacy"
          aria-selected={tab === 'privacy'}
          aria-controls="help-panel-privacy"
          className={tab === 'privacy' ? 'help-tab help-tab--active' : 'help-tab'}
          onClick={() => setTab('privacy')}
        >
          {t('help.privacyTab')}
        </button>
      </div>

      <div className="dialog-body help-body">
        {tab === 'guide' ? (
          <div
            role="tabpanel"
            id="help-panel-guide"
            aria-labelledby="help-tab-guide"
            className="help-panel"
          >
            <section className="help-section">
              <h3 className="help-heading">
                <span className="mono">01</span>
                {t('help.typesTitle')}
              </h3>
              <ul className="help-types">
                {CONTENT_TYPES.map((type) => {
                  const Icon = CONTENT_ICONS[type]
                  return (
                    <li key={type} className="help-type">
                      <span className="help-type-icon" aria-hidden="true">
                        <Icon size={17} />
                      </span>
                      <span>
                        <strong>{t(CONTENT_TYPE_LABEL_KEYS[type])}</strong>
                        <span>{t(`help.type.${type}` as TranslationKey)}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className="help-section">
              <h3 className="help-heading">
                <span className="mono">02</span>
                {t('help.logoTitle')}
              </h3>
              <p>{t('help.logoBody')}</p>
            </section>

            <section className="help-section">
              <h3 className="help-heading">
                <span className="mono">03</span>
                {t('help.printTitle')}
              </h3>
              <ul className="help-checklist">
                <li>
                  <CheckCircle size={16} weight="fill" aria-hidden="true" />
                  {t('help.print1')}
                </li>
                <li>
                  <CheckCircle size={16} weight="fill" aria-hidden="true" />
                  {t('help.print2')}
                </li>
                <li>
                  <CheckCircle size={16} weight="fill" aria-hidden="true" />
                  {t('help.print3')}
                </li>
                <li>
                  <CheckCircle size={16} weight="fill" aria-hidden="true" />
                  {t('help.print4')}
                </li>
              </ul>
            </section>

            <section className="help-section">
              <h3 className="help-heading">
                <Keyboard size={17} />
                {t('help.shortcutsTitle')}
              </h3>
              <dl className="shortcut-list">
                <div>
                  <dt>{t('help.shortcutExport')}</dt>
                  <dd>
                    <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>S</kbd>
                  </dd>
                </div>
                <div>
                  <dt>{t('help.shortcutTheme')}</dt>
                  <dd>
                    <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>
                  </dd>
                </div>
                <div>
                  <dt>{t('help.shortcutLanguage')}</dt>
                  <dd>
                    <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd>
                  </dd>
                </div>
                <div>
                  <dt>{t('help.shortcutClose')}</dt>
                  <dd>
                    <kbd>Esc</kbd>
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        ) : (
          <div
            role="tabpanel"
            id="help-panel-privacy"
            aria-labelledby="help-tab-privacy"
            className="help-panel help-panel--privacy"
          >
            <span className="help-privacy-icon" aria-hidden="true">
              <ShieldCheck size={44} weight="fill" />
            </span>
            <h3 className="help-privacy-title">{t('help.privacyTitle')}</h3>
            <p className="help-privacy-body">{t('help.privacyBody')}</p>
            <p className="help-local-only">
              <CheckCircle size={16} weight="fill" aria-hidden="true" />
              {t('help.localOnly')}
            </p>
            <p className="help-privacy-body">{t('settings.privacyBody')}</p>
          </div>
        )}
      </div>

      <footer className="dialog-foot">
        <span className="mono">{t('footer.version')}</span>
        <button type="button" className="primary-button" onClick={close}>
          {t('help.back')}
          <ArrowRight size={16} />
        </button>
      </footer>
    </Dialog>
  )
}
