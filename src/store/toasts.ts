import { create } from 'zustand'

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger'

export interface ToastItem {
  id: string
  message: string
  tone: ToastTone
}

interface ToastState {
  toasts: ToastItem[]
  push: (message: string, tone?: ToastTone) => string
  dismiss: (id: string) => void
  clear: () => void
}

const DISMISS_AFTER = 4200

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  push: (message, tone = 'neutral') => {
    const id = crypto.randomUUID()
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { id, message, tone }],
    }))
    window.setTimeout(() => {
      get().dismiss(id)
    }, DISMISS_AFTER)
    return id
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },

  clear: () => set({ toasts: [] }),
}))
