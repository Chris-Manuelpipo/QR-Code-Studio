import { useEffect, useRef } from 'react'
import { saveEntry } from '@/lib/storage/db'
import { getEntryThumbnail } from '@/lib/export'
import { useHistoryStore } from '@/store/history'
import { useSettingsStore } from '@/store/settings'
import { useStudioStore } from '@/store/studio'
import type { ContentType, QrEntry, StyleConfig } from '@/lib/types'

/**
 * Persists the current creation once the user has stopped editing. The payload
 * is the validity signal: invalid or incomplete forms are never stored.
 */
export function useAutosave(
  payload: string | null,
  type: ContentType,
  style: StyleConfig,
): void {
  const privateMode = useSettingsStore((state) => state.privateMode)
  const historyLimit = useSettingsStore((state) => state.historyLimit)
  const isDirty = useStudioStore((state) => state.isDirty)
  const requestRef = useRef(0)

  useEffect(() => {
    // Every effect run supersedes any save still in flight, including the
    // transitions back to an incomplete form or to private mode.
    const request = ++requestRef.current
    if (!payload || privateMode || !isDirty) {
      if (useStudioStore.getState().isSaving) {
        useStudioStore.getState().markSaving(false)
      }
      return
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        if (requestRef.current !== request) return
        useStudioStore.getState().markSaving(true)
        try {
          const thumbnail = await getEntryThumbnail(payload, style)
          if (requestRef.current !== request) return

          const studio = useStudioStore.getState()
          const history = useHistoryStore.getState()
          const existing = studio.currentEntryId
            ? history.entries.find((entry) => entry.id === studio.currentEntryId)
            : undefined
          const now = Date.now()
          const entry: QrEntry = {
            id: existing?.id ?? crypto.randomUUID(),
            type,
            payload,
            formData: structuredClone(studio.forms[type]),
            style: structuredClone(style),
            thumbnail,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
          }
          const entries = await saveEntry(entry, historyLimit)
          if (requestRef.current !== request) return

          useHistoryStore.getState().setEntries(entries)
          useStudioStore.getState().markSaved(entry.id, now)
        } catch {
          if (requestRef.current !== request) return
          useStudioStore.getState().setSaveError('history')
        }
      })()
    }, 1200)

    return () => {
      window.clearTimeout(timer)
    }
  }, [payload, type, style, privateMode, historyLimit, isDirty])
}
