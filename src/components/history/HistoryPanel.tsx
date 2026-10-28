import { useEffect, useState } from 'react'
import {
  ClockCounterClockwise,
  GearSix,
  LockSimple,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react'
import { CONTENT_ICONS } from '@/components/contentMeta'
import { SpecimenQr } from '@/components/SpecimenQr'
import { Panel } from '@/components/ui/Panel'
import { useI18n } from '@/hooks/useI18n'
import { CONTENT_TYPE_LABEL_KEYS, HISTORY_LIMITS } from '@/lib/config'
import { describeEntry } from '@/lib/history/describe'
import { formatRelativeDate } from '@/i18n'
import { useHistoryStore } from '@/store/history'
import { useSettingsStore } from '@/store/settings'
import { useStudioStore } from '@/store/studio'
import { useToastStore } from '@/store/toasts'
import { useUiStore } from '@/store/ui'
import type { QrEntry } from '@/lib/types'

export function HistoryPanel() {
  const { t, locale } = useI18n()
  const entries = useHistoryStore((state) => state.entries)
  const status = useHistoryStore((state) => state.status)
  const refresh = useHistoryStore((state) => state.refresh)
  const remove = useHistoryStore((state) => state.remove)
  const currentEntryId = useStudioStore((state) => state.currentEntryId)
  const loadEntry = useStudioStore((state) => state.loadEntry)
  const detachEntry = useStudioStore((state) => state.detachEntry)
  const historyLimit = useSettingsStore((state) => state.historyLimit)
  const setHistoryLimit = useSettingsStore((state) => state.setHistoryLimit)
  const privateMode = useSettingsStore((state) => state.privateMode)
  const openSettings = useUiStore((state) => state.openSettings)
  const openClearHistory = useUiStore((state) => state.openClearHistory)
  const pushToast = useToastStore((state) => state.push)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'idle') void refresh()
  }, [status, refresh])

  function handleLoad(entry: QrEntry) {
    loadEntry(entry)
    pushToast(t('toast.entryLoaded'), 'success')
    document.getElementById('content')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  async function handleDelete(entry: QrEntry) {
    setDeleting(entry.id)
    try {
      await remove(entry.id)
      if (entry.id === currentEntryId) detachEntry()
      pushToast(t('toast.entryDeleted'), 'neutral')
    } catch {
      pushToast(t('toast.error'), 'danger')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <Panel
      id="history"
      step="↳"
      title={t('section.history')}
      hint={t('history.purgeNote', { limit: historyLimit })}
      className="history-panel"
      actions={
        entries.length > 0 ? (
          <button
            type="button"
            className="ghost-button ghost-button--danger"
            onClick={openClearHistory}
          >
            <Trash size={15} />
            {t('history.clear')}
          </button>
        ) : null
      }
    >
      <div className="history-toolbar">
        <div className="history-count">
          <ClockCounterClockwise size={16} />
          <span>
            {entries.length === 1
              ? t('history.oneEntry')
              : t('history.manyEntries', { count: entries.length })}
          </span>
          <span className="history-local mono">
            <LockSimple size={12} />
            {t('history.local')}
          </span>
        </div>

        <label className="history-limit" htmlFor="history-limit">
          <span>{t('history.limit')}</span>
          <span className="select-wrap select-wrap--small">
            <select
              id="history-limit"
              className="input select select--small"
              value={historyLimit}
              onChange={(event) => {
                setHistoryLimit(Number(event.target.value))
                pushToast(t('toast.retentionUpdated'), 'neutral')
              }}
            >
              {HISTORY_LIMITS.map((limit) => (
                <option key={limit} value={limit}>
                  {limit}
                </option>
              ))}
            </select>
          </span>
        </label>
      </div>

      {privateMode ? (
        <p className="history-private">
          <LockSimple size={15} weight="fill" aria-hidden="true" />
          {t('history.privateOn')}
          <button type="button" className="text-link" onClick={openSettings}>
            <GearSix size={14} />
            {t('history.privateAction')}
          </button>
        </p>
      ) : null}

      {entries.length === 0 ? (
        <div className="history-empty">
          <span className="history-empty-art" aria-hidden="true">
            <SpecimenQr className="history-specimen" />
          </span>
          <div>
            <h3 className="history-empty-title">{t('history.emptyTitle')}</h3>
            <p className="history-empty-text">{t('history.emptyText')}</p>
          </div>
        </div>
      ) : (
        <ul className="history-grid">
          {entries.map((entry) => {
            const Icon = CONTENT_ICONS[entry.type]
            const current = entry.id === currentEntryId
            return (
              <li
                key={entry.id}
                className={
                  current ? 'history-card history-card--current' : 'history-card'
                }
              >
                <div className="history-thumb">
                  <img src={entry.thumbnail} alt="" loading="lazy" />
                  {current ? (
                    <span className="history-current mono">{t('history.current')}</span>
                  ) : null}
                </div>
                <div className="history-card-body">
                  <span className="history-type">
                    <Icon size={14} />
                    {t(CONTENT_TYPE_LABEL_KEYS[entry.type])}
                  </span>
                  <span className="history-title" title={describeEntry(entry)}>
                    {describeEntry(entry)}
                  </span>
                  <span className="history-date mono">
                    {formatRelativeDate(locale, entry.updatedAt)}
                  </span>
                </div>
                <div className="history-actions">
                  <button
                    type="button"
                    className="icon-button icon-button--small"
                    onClick={() => handleLoad(entry)}
                    aria-label={t('history.loadAria', {
                      type: t(CONTENT_TYPE_LABEL_KEYS[entry.type]),
                    })}
                    title={t('history.load')}
                  >
                    <PencilSimple size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-button icon-button--small icon-button--danger"
                    onClick={() => void handleDelete(entry)}
                    disabled={deleting === entry.id}
                    aria-label={t('history.delete', {
                      name: describeEntry(entry),
                    })}
                    title={t('history.delete', { name: describeEntry(entry) })}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {status === 'error' ? (
        <p className="inline-warning">{t('errors.history')}</p>
      ) : null}
    </Panel>
  )
}
