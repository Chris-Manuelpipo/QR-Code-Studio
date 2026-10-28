import { useState } from 'react'
import { CircleNotch, Trash, X } from '@phosphor-icons/react'
import { Dialog } from '@/components/dialogs/Dialog'
import { useI18n } from '@/hooks/useI18n'
import { useHistoryStore } from '@/store/history'
import { useStudioStore } from '@/store/studio'
import { useToastStore } from '@/store/toasts'
import { useUiStore } from '@/store/ui'

export function ClearHistoryDialog() {
  const { t } = useI18n()
  const open = useUiStore((state) => state.clearHistoryOpen)
  const close = useUiStore((state) => state.closeClearHistory)
  const clearAll = useHistoryStore((state) => state.clearAll)
  const detachEntry = useStudioStore((state) => state.detachEntry)
  const pushToast = useToastStore((state) => state.push)
  const [busy, setBusy] = useState(false)

  async function confirm() {
    setBusy(true)
    try {
      await clearAll()
      detachEntry()
      pushToast(t('toast.historyCleared'), 'neutral')
      close()
    } catch {
      pushToast(t('toast.error'), 'danger')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      labelledBy="clear-history-title"
      className="dialog--confirm"
    >
      <header className="dialog-head">
        <span className="dialog-kicker dialog-kicker--danger mono">
          <Trash size={14} />
          {t('history.clear')}
        </span>
        <button
          type="button"
          className="icon-button dialog-close"
          onClick={close}
          aria-label={t('common.close')}
        >
          <X size={20} />
        </button>
        <h2 id="clear-history-title" className="dialog-title">
          {t('history.clearTitle')}
        </h2>
        <p className="dialog-subtitle">{t('history.clearBody')}</p>
      </header>

      <footer className="dialog-foot dialog-foot--confirm">
        <button type="button" className="ghost-button" onClick={close}>
          {t('history.cancel')}
        </button>
        <button
          type="button"
          className="danger-button"
          onClick={() => void confirm()}
          disabled={busy}
        >
          {busy ? <CircleNotch size={16} className="spin" /> : <Trash size={16} />}
          {t('history.confirmClear')}
        </button>
      </footer>
    </Dialog>
  )
}
