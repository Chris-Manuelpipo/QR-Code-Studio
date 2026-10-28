import { beforeEach, describe, expect, it } from 'vitest'
import { useSettingsStore } from '@/store/settings'

function resetSettings() {
  useSettingsStore.setState({
    theme: 'light',
    locale: 'fr',
    privateMode: false,
    historyLimit: 50,
  })
  localStorage.clear()
  document.documentElement.dataset.theme = 'light'
}

beforeEach(resetSettings)

describe('preferences', () => {
  it('toggles the locale and persists it', () => {
    useSettingsStore.getState().toggleLocale()
    expect(useSettingsStore.getState().locale).toBe('en')

    useSettingsStore.getState().toggleLocale()
    expect(useSettingsStore.getState().locale).toBe('fr')

    expect(JSON.parse(localStorage.getItem('qrcs.settings') ?? '{}')).toMatchObject({
      locale: 'fr',
    })
  })

  it('sets the locale directly', () => {
    useSettingsStore.getState().setLocale('en')
    expect(useSettingsStore.getState().locale).toBe('en')
  })

  it('toggles the theme, updates the document and persists the choice', () => {
    useSettingsStore.getState().toggleTheme()

    expect(useSettingsStore.getState().theme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(localStorage.getItem('qrcs.theme')).toBe('dark')

    useSettingsStore.getState().setTheme('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('persists private mode and the history limit together', () => {
    useSettingsStore.getState().setPrivateMode(true)
    useSettingsStore.getState().setHistoryLimit(25)

    expect(useSettingsStore.getState().privateMode).toBe(true)
    expect(useSettingsStore.getState().historyLimit).toBe(25)
    expect(JSON.parse(localStorage.getItem('qrcs.settings') ?? '{}')).toEqual({
      locale: 'fr',
      privateMode: true,
      historyLimit: 25,
    })
  })
})
