import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { QrEntry } from '@/lib/types'
import { applyRetention, newestFirst } from '@/lib/storage/retention'

interface StudioDatabase extends DBSchema {
  entries: {
    key: string
    value: QrEntry
    indexes: { 'by-updated': number }
  }
  settings: {
    key: string
    value: { key: string; value: unknown }
  }
}

const DB_NAME = 'qr-code-studio'
const DB_VERSION = 1

let databasePromise: Promise<IDBPDatabase<StudioDatabase>> | null = null

export function getDb(): Promise<IDBPDatabase<StudioDatabase>> {
  if (!databasePromise) {
    databasePromise = openDB<StudioDatabase>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('entries')) {
          const entries = db.createObjectStore('entries', { keyPath: 'id' })
          entries.createIndex('by-updated', 'updatedAt')
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
      },
    })
  }
  return databasePromise
}

export async function listEntries(): Promise<QrEntry[]> {
  const db = await getDb()
  const entries = await db.getAllFromIndex('entries', 'by-updated')
  return newestFirst(entries)
}

export async function getEntry(id: string): Promise<QrEntry | undefined> {
  const db = await getDb()
  return db.get('entries', id)
}

export async function saveEntry(
  entry: QrEntry,
  retentionLimit: number,
): Promise<QrEntry[]> {
  const db = await getDb()
  const tx = db.transaction('entries', 'readwrite')
  await tx.store.put(entry)
  const all = await tx.store.getAll()
  const { kept, removed } = applyRetention(all, retentionLimit)
  for (const oldEntry of removed) {
    await tx.store.delete(oldEntry.id)
  }
  await tx.done
  return newestFirst(kept)
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('entries', id)
}

export async function purgeEntries(limit: number): Promise<QrEntry[]> {
  const db = await getDb()
  const all = await db.getAll('entries')
  const { kept, removed } = applyRetention(all, limit)
  if (removed.length > 0) {
    const tx = db.transaction('entries', 'readwrite')
    for (const entry of removed) {
      await tx.store.delete(entry.id)
    }
    await tx.done
  }
  return newestFirst(kept)
}

export async function clearEntries(): Promise<void> {
  const db = await getDb()
  await db.clear('entries')
}

export async function countEntries(): Promise<number> {
  const db = await getDb()
  return db.count('entries')
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = await getDb()
  await db.put('settings', { key, value })
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDb()
  const setting = await db.get('settings', key)
  return setting?.value as T | undefined
}

export async function getAllSettings(): Promise<Record<string, unknown>> {
  const db = await getDb()
  const settings = await db.getAll('settings')
  return Object.fromEntries(settings.map((setting) => [setting.key, setting.value]))
}

export async function resetDatabaseForTests(): Promise<void> {
  if (databasePromise) {
    const db = await databasePromise
    db.close()
  }
  databasePromise = null
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve()
  })
}
