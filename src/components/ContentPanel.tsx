import type { ReactElement } from 'react'
import { ContactForm } from '@/components/forms/ContactForm'
import { CryptoForm } from '@/components/forms/CryptoForm'
import { GeoForm } from '@/components/forms/GeoForm'
import { TextForm } from '@/components/forms/TextForm'
import { UrlForm } from '@/components/forms/UrlForm'
import { VCardForm } from '@/components/forms/VCardForm'
import { VEventForm } from '@/components/forms/VEventForm'
import { WifiForm } from '@/components/forms/WifiForm'
import { SaveIndicator } from '@/components/SaveIndicator'
import { TypePicker } from '@/components/TypePicker'
import { Panel } from '@/components/ui/Panel'
import { useI18n } from '@/hooks/useI18n'
import { CONTENT_TYPE_LABEL_KEYS } from '@/lib/config'
import type { ContentType } from '@/lib/types'
import { CONTENT_TYPES } from '@/lib/types'
import { useStudioStore } from '@/store/studio'
import type { TranslationKey } from '@/i18n'

const FORM_COMPONENTS: Record<ContentType, () => ReactElement> = {
  url: UrlForm,
  text: TextForm,
  wifi: WifiForm,
  vcard: VCardForm,
  vevent: VEventForm,
  geo: GeoForm,
  contact: ContactForm,
  crypto: CryptoForm,
}

export function ContentPanel() {
  const { t } = useI18n()
  const type = useStudioStore((state) => state.type)
  const revision = useStudioStore((state) => state.revision)
  const Form = FORM_COMPONENTS[type]

  return (
    <Panel
      id="content"
      step={t('step.one')}
      title={t('section.content')}
      hint={t(`typeDesc.${type}` as TranslationKey)}
      actions={
        <span className="panel-chip">
          <span className="panel-chip-index mono">
            {String(CONTENT_TYPES.indexOf(type) + 1).padStart(2, '0')}
          </span>
          {t(CONTENT_TYPE_LABEL_KEYS[type])}
        </span>
      }
    >
      <div className="type-section">
        <h3 className="subsection-label">{t('section.type')}</h3>
        <TypePicker />
      </div>

      <div className="form-area" key={`${type}-${revision}`}>
        <div className="form-area-head">
          <span className="mono form-area-label">{t('section.content')}</span>
          <span className="form-area-type">{t(CONTENT_TYPE_LABEL_KEYS[type])}</span>
        </div>
        <Form />
      </div>
      <SaveIndicator />
    </Panel>
  )
}
