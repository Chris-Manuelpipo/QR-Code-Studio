import { beforeEach, describe, expect, it } from 'vitest'
import { entry } from '@/test/factories'
import {
  clearEntries,
  countEntries,
  deleteEntry,
  getAllSettings,
  getEntry,
  getSetting,
  listEntries,
  resetDatabaseForTests,
  saveEntry,
  setSetting,
} from '@/lib/storage/db'

beforeEach(async () => {
  await resetDatabaseForTests()
})

describe('entry storage', () => {
  it('saves, reads and sorts entries newest first', async () => {
    await saveEntry(entry('url', { id: 'old', updatedAt: 100 }), 50)
    await saveEntry(entry('wifi', { id: 'new', updatedAt: 300 }), 50)
    await saveEntry(entry('text', { id: 'mid', updatedAt: 200 }), 50)

    const entries = await listEntries()
    expect(entries.map((item) => item.id)).toEqual(['new', 'mid', 'old'])
    expect((await getEntry('mid'))?.type).toBe('text')
    expect(await countEntries()).toBe(3)
  })

  it('updates an existing entry instead of duplicating it', async () => {
    await saveEntry(entry('url', { id: 'same', updatedAt: 100 }), 50)
    await saveEntry(
      entry('url', { id: 'same', payload: 'https://changed.example', updatedAt: 400 }),
      50,
    )

    const entries = await listEntries()
    expect(entries).toHaveLength(1)
    expect(entries[0]?.payload).toBe('https://changed.example')
    expect(entries[0]?.updatedAt).toBe(400)
  })

  it('applies retention on every save', async () => {
    for (let index = 0; index < 5; index += 1) {
      await saveEntry(entry('url', { id: `entry-${index}`, updatedAt: index * 100 }), 2)
    }

    const entries = await listEntries()
    expect(entries.map((item) => item.id)).toEqual(['entry-4', 'entry-3'])
    expect(await countEntries()).toBe(2)
  })

  it('deletes and clears entries', async () => {
    await saveEntry(entry('url', { id: 'a' }), 50)
    await saveEntry(entry('url', { id: 'b' }), 50)

    await deleteEntry('a')
    expect(await countEntries()).toBe(1)
    expect(await getEntry('a')).toBeUndefined()

    await clearEntries()
    expect(await listEntries()).toEqual([])
  })
})

describe('settings storage', () => {
  it('stores typed values and returns all settings', async () => {
    await setSetting('locale', 'en')
    await setSetting('historyLimit', 25)

    expect(await getSetting<string>('locale')).toBe('en')
    expect(await getSetting<number>('historyLimit')).toBe(25)
    expect(await getSetting('missing')).toBeUndefined()
    expect(await getAllSettings()).toEqual({ locale: 'en', historyLimit: 25 })
  })

  it('overwrites a setting by key', async () => {
    await setSetting('theme', 'light')
    await setSetting('theme', 'dark')
    expect(await getAllSettings()).toEqual({ theme: 'dark' })
  })
})
