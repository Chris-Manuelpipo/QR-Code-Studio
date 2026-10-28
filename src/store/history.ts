import { create } from 'zustand'
import { clearEntries, deleteEntry, listEntries } from '@/lib/storage/db'
import type { QrEntry } from '@/lib/types'

export type HistoryStatus = 'idle' | 'loading' | 'ready' | 'error'

interface HistoryState {
  entries: QrEntry[]
  status: HistoryStatus
  error: string | null
  refresh: () => Promise<void>
  setEntries: (entries: QrEntry[]) => void
  remove: (id: string) => Promise<void>
  clearAll: () => Promise<void>
}

export const useHistoryStore = create<HistoryState>((set) => ({
  entries: [],
  status: 'idle',
  error: null,

  refresh: async () => {
    set({ status: 'loading', error: null })
    try {
      const entries = await listEntries()
      set({ entries, status: 'ready' })
    } catch {
      set({ status: 'error', error: 'history' })
    }
  },

  setEntries: (entries) => set({ entries, status: 'ready', error: null }),

  remove: async (id) => {
    await deleteEntry(id)
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    }))
  },

  clearAll: async () => {
    await clearEntries()
    set({ entries: [], status: 'ready', error: null })
  },
}))
