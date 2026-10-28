import { describe, expect, it } from 'vitest'
import { entry } from '@/test/factories'
import { applyRetention, newestFirst } from '@/lib/storage/retention'

function sample() {
  return [
    entry('url', { id: 'a', updatedAt: 100 }),
    entry('url', { id: 'b', updatedAt: 300 }),
    entry('url', { id: 'c', updatedAt: 200 }),
  ]
}

describe('newestFirst', () => {
  it('sorts without mutating the input', () => {
    const entries = sample()
    const sorted = newestFirst(entries)
    expect(sorted.map((item) => item.id)).toEqual(['b', 'c', 'a'])
    expect(entries.map((item) => item.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('applyRetention', () => {
  it('keeps the most recently updated entries', () => {
    const result = applyRetention(sample(), 2)
    expect(result.kept.map((item) => item.id)).toEqual(['b', 'c'])
    expect(result.removed.map((item) => item.id)).toEqual(['a'])
  })

  it('never keeps fewer than one entry', () => {
    const result = applyRetention(sample(), 0)
    expect(result.kept.map((item) => item.id)).toEqual(['b'])
    expect(result.removed).toHaveLength(2)
  })

  it('floors fractional limits and handles empty input', () => {
    expect(applyRetention(sample(), 2.9).kept).toHaveLength(2)
    expect(applyRetention([], 10)).toEqual({ kept: [], removed: [] })
  })
})
