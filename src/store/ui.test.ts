import { beforeEach, describe, expect, it } from 'vitest'
import { useUiStore } from '@/store/ui'

beforeEach(() => {
  useUiStore.setState({
    settingsOpen: false,
    helpOpen: false,
    clearHistoryOpen: false,
  })
})

describe('ui store', () => {
  it('opens and closes the settings dialog', () => {
    useUiStore.getState().openSettings()
    expect(useUiStore.getState().settingsOpen).toBe(true)
    useUiStore.getState().closeSettings()
    expect(useUiStore.getState().settingsOpen).toBe(false)
  })

  it('opens and closes the help dialog', () => {
    useUiStore.getState().openHelp()
    expect(useUiStore.getState().helpOpen).toBe(true)
    useUiStore.getState().closeHelp()
    expect(useUiStore.getState().helpOpen).toBe(false)
  })

  it('opens and closes the clear-history confirmation', () => {
    useUiStore.getState().openClearHistory()
    expect(useUiStore.getState().clearHistoryOpen).toBe(true)
    useUiStore.getState().closeClearHistory()
    expect(useUiStore.getState().clearHistoryOpen).toBe(false)
  })
})
