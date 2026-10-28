import type { QrEntry } from '@/lib/types'

export interface RetentionResult {
  kept: QrEntry[]
  removed: QrEntry[]
}

export function applyRetention(entries: QrEntry[], limit: number): RetentionResult {
  const safeLimit = Math.max(1, Math.floor(limit))
  const sorted = [...entries].sort((a, b) => b.updatedAt - a.updatedAt)
  return {
    kept: sorted.slice(0, safeLimit),
    removed: sorted.slice(safeLimit),
  }
}

export function newestFirst(entries: QrEntry[]): QrEntry[] {
  return [...entries].sort((a, b) => b.updatedAt - a.updatedAt)
}
