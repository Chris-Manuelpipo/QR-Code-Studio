import { create } from 'zustand'
import { DEFAULT_HISTORY_LIMIT, HISTORY_LIMITS } from '@/lib/config'
import type { Locale, ThemeMode } from '@/lib/types'

const SETTINGS_KEY = 'qrcs.settings'
const THEME_KEY = 'qrcs.theme'

interface PersistedSettings {
  locale: Locale
  privateMode: boolean
  historyLimit: number
}

interface SettingsState {
  theme: ThemeMode
  locale: Locale
  privateMode: boolean
  historyLimit: number
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  setPrivateMode: (enabled: boolean) => void
  setHistoryLimit: (limit: number) => void
}

function readInitialTheme(): ThemeMode {
  if (typeof document !== 'undefined') {
    const fromDocument = document.documentElement.dataset.theme
    if (fromDocument === 'light' || fromDocument === 'dark') return fromDocument
  }
  return 'light'
}

function readStoredSettings(): PersistedSettings {
  const fallback: PersistedSettings = {
    locale: 'fr',
    privateMode: false,
    historyLimit: DEFAULT_HISTORY_LIMIT,
  }
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<PersistedSettings>
    const locale: Locale = parsed.locale === 'en' ? 'en' : 'fr'
    const limit = Number(parsed.historyLimit)
    return {
      locale,
      privateMode: parsed.privateMode === true,
      historyLimit: HISTORY_LIMITS.includes(limit as (typeof HISTORY_LIMITS)[number])
        ? limit
        : fallback.historyLimit,
    }
  } catch {
    return fallback
  }
}

function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
}

function persistSettings(state: PersistedSettings): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state))
  } catch {
    // Preferences simply stay in memory if storage is blocked.
  }
}

const initial = readStoredSettings()

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: readInitialTheme(),
  locale: initial.locale,
  privateMode: initial.privateMode,
  historyLimit: initial.historyLimit,

  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },

  toggleTheme: () => {
    const next: ThemeMode = get().theme === 'light' ? 'dark' : 'light'
    applyTheme(next)
    set({ theme: next })
  },

  setLocale: (locale) => {
    set({ locale })
    persistSettings({
      locale,
      privateMode: get().privateMode,
      historyLimit: get().historyLimit,
    })
  },

  toggleLocale: () => {
    const locale: Locale = get().locale === 'fr' ? 'en' : 'fr'
    set({ locale })
    persistSettings({
      locale,
      privateMode: get().privateMode,
      historyLimit: get().historyLimit,
    })
  },

  setPrivateMode: (privateMode) => {
    set({ privateMode })
    persistSettings({
      locale: get().locale,
      privateMode,
      historyLimit: get().historyLimit,
    })
  },

  setHistoryLimit: (historyLimit) => {
    set({ historyLimit })
    persistSettings({
      locale: get().locale,
      privateMode: get().privateMode,
      historyLimit,
    })
  },
}))
