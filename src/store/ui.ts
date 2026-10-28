import { create } from 'zustand'

interface UiState {
  settingsOpen: boolean
  helpOpen: boolean
  clearHistoryOpen: boolean
  openSettings: () => void
  closeSettings: () => void
  openHelp: () => void
  closeHelp: () => void
  openClearHistory: () => void
  closeClearHistory: () => void
}

export const useUiStore = create<UiState>((set) => ({
  settingsOpen: false,
  helpOpen: false,
  clearHistoryOpen: false,
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  openHelp: () => set({ helpOpen: true }),
  closeHelp: () => set({ helpOpen: false }),
  openClearHistory: () => set({ clearHistoryOpen: true }),
  closeClearHistory: () => set({ clearHistoryOpen: false }),
}))
