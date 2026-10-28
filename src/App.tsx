import { useEffect, useMemo } from 'react'
import { ContentPanel } from '@/components/ContentPanel'
import { ClearHistoryDialog } from '@/components/dialogs/ClearHistoryDialog'
import { HelpDialog } from '@/components/dialogs/HelpDialog'
import { SettingsDialog } from '@/components/dialogs/SettingsDialog'
import { ExportPanel } from '@/components/export/ExportPanel'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { HistoryPanel } from '@/components/history/HistoryPanel'
import { PreviewStage } from '@/components/preview/PreviewStage'
import { StylePanel } from '@/components/style/StylePanel'
import { ToastViewport } from '@/components/ToastViewport'
import { useAutosave } from '@/hooks/useAutosave'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useI18n } from '@/hooks/useI18n'
import { useQrPreview } from '@/hooks/useQrPreview'
import { exportPng } from '@/lib/export'
import { getPayloadForForms } from '@/lib/payloads'
import { useSettingsStore } from '@/store/settings'
import { useStudioStore } from '@/store/studio'
import { useToastStore } from '@/store/toasts'

const TITLES = {
  fr: 'QR Code Studio — des QR codes qui tiennent leurs promesses',
  en: 'QR Code Studio — QR codes that keep their promises',
}

const DESCRIPTIONS = {
  fr: 'Créez, stylisez et vérifiez vos QR codes avant impression. Huit formats, traitement 100 % local.',
  en: 'Create, style and verify QR codes before printing. Eight formats, 100% local processing.',
}

function App() {
  const { t, locale } = useI18n()
  const type = useStudioStore((state) => state.type)
  const forms = useStudioStore((state) => state.forms)
  const style = useStudioStore((state) => state.style)
  const theme = useSettingsStore((state) => state.theme)
  const toggleTheme = useSettingsStore((state) => state.toggleTheme)
  const toggleLocale = useSettingsStore((state) => state.toggleLocale)
  const pushToast = useToastStore((state) => state.push)

  const payloadResult = useMemo(() => getPayloadForForms(type, forms), [type, forms])
  const payload = payloadResult.ok ? payloadResult.payload : null

  const preview = useQrPreview(payload, style)
  useAutosave(payload, type, style)

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = TITLES[locale]
    const description = document.querySelector('meta[name="description"]')
    if (description) description.setAttribute('content', DESCRIPTIONS[locale])
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', TITLES[locale])
  }, [locale])

  useEffect(() => {
    const themeColor = document.querySelector('meta[name="theme-color"]')
    if (themeColor) {
      themeColor.setAttribute('content', theme === 'dark' ? '#111110' : '#f2f0e9')
    }
  }, [theme])

  async function quickExport() {
    if (!payload) {
      pushToast(t('toast.exportBlocked'), 'warning')
      return
    }
    try {
      await exportPng(payload, style, type)
      pushToast(t('export.success.png'), 'success')
    } catch {
      pushToast(t('export.error'), 'danger')
    }
  }

  useHotkeys({
    onExport: () => void quickExport(),
    onTheme: toggleTheme,
    onLanguage: toggleLocale,
  })

  return (
    <div className="app">
      <Header />
      <main id="main" className="main">
        <Hero />
        <div className="studio-grid">
          <div className="workspace">
            <ContentPanel />
            <StylePanel />
          </div>
          <aside className="rail">
            <PreviewStage payload={payload} preview={preview} />
            <ExportPanel
              payload={payload}
              validation={preview.validation}
              checking={preview.checking}
            />
          </aside>
        </div>
        <HistoryPanel />
      </main>
      <Footer />
      <ToastViewport />
      <SettingsDialog />
      <HelpDialog />
      <ClearHistoryDialog />
    </div>
  )
}

export default App
