import { beforeEach, describe, expect, it } from 'vitest'
import { useHistoryStore } from '@/store/history'
import { countEntries, resetDatabaseForTests, saveEntry } from '@/lib/storage/db'
import { entry } from '@/test/factories'

beforeEach(async () => {
  await resetDatabaseForTests()
  useHistoryStore.setState({ entries: [], status: 'idle', error: null })
})

describe('history store', () => {
  it('refreshes entries from IndexedDB', async () => {
    await saveEntry(entry('url', { id: 'a', updatedAt: 100 }), 50)
    await saveEntry(entry('wifi', { id: 'b', updatedAt: 200 }), 50)

    await useHistoryStore.getState().refresh()

    const state = useHistoryStore.getState()
    expect(state.status).toBe('ready')
    expect(state.error).toBeNull()
    expect(state.entries.map((item) => item.id)).toEqual(['b', 'a'])
  })

  it('accepts entries prepared elsewhere', () => {
    useHistoryStore.getState().setEntries([entry('text', { id: 'only' })])

    const state = useHistoryStore.getState()
    expect(state.status).toBe('ready')
    expect(state.entries).toHaveLength(1)
    expect(state.entries[0]?.id).toBe('only')
  })

  it('removes one entry from the database and the list', async () => {
    await saveEntry(entry('url', { id: 'a' }), 50)
    await saveEntry(entry('url', { id: 'b' }), 50)
    await useHistoryStore.getState().refresh()

    await useHistoryStore.getState().remove('a')

    expect(useHistoryStore.getState().entries.map((item) => item.id)).toEqual(['b'])
    expect(await countEntries()).toBe(1)
  })

  it('clears every entry', async () => {
    await saveEntry(entry('url', { id: 'a' }), 50)
    await saveEntry(entry('url', { id: 'b' }), 50)
    await useHistoryStore.getState().refresh()

    await useHistoryStore.getState().clearAll()

    expect(useHistoryStore.getState().entries).toEqual([])
    expect(useHistoryStore.getState().status).toBe('ready')
    expect(await countEntries()).toBe(0)
  })
})
