import { CheckCircle, Info, Warning, X, XCircle } from '@phosphor-icons/react'
import { useI18n } from '@/hooks/useI18n'
import { useToastStore, type ToastTone } from '@/store/toasts'

function ToneIcon({ tone }: { tone: ToastTone }) {
  if (tone === 'success') return <CheckCircle size={18} weight="fill" />
  if (tone === 'danger') return <XCircle size={18} weight="fill" />
  if (tone === 'warning') return <Warning size={18} weight="fill" />
  return <Info size={18} weight="fill" />
}

export function ToastViewport() {
  const { t } = useI18n()
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  if (toasts.length === 0) return null

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`} role="status">
          <span className="toast-icon" aria-hidden="true">
            <ToneIcon tone={toast.tone} />
          </span>
          <span className="toast-message">{toast.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => dismiss(toast.id)}
            aria-label={t('toast.dismiss')}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
