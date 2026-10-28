import { create } from 'zustand'
import {
  createDefaultForms,
  createDefaultStyle,
  createEmptyForms,
  STYLE_PRESETS,
} from '@/lib/config'
import type {
  ContentType,
  FormDataMap,
  QrEntry,
  StyleConfig,
  StylePresetId,
} from '@/lib/types'

interface StudioState {
  type: ContentType
  forms: FormDataMap
  style: StyleConfig
  activePreset: StylePresetId | null
  currentEntryId: string | null
  revision: number
  isDirty: boolean
  isSaving: boolean
  lastSavedAt: number | null
  saveError: string | null
  setType: (type: ContentType) => void
  setFormValues: <K extends ContentType>(type: K, values: FormDataMap[K]) => void
  patchStyle: (patch: Partial<StyleConfig>) => void
  applyPreset: (id: StylePresetId) => void
  resetStyle: () => void
  setLogoSource: (source: string | null, name: string | null) => void
  setLogo: (logo: string | null) => void
  loadEntry: (entry: QrEntry) => void
  newCode: () => void
  markSaving: (saving: boolean) => void
  markSaved: (entryId: string, savedAt: number) => void
  setSaveError: (error: string | null) => void
  detachEntry: () => void
}

export const useStudioStore = create<StudioState>((set, get) => ({
  type: 'url',
  forms: createDefaultForms(),
  style: createDefaultStyle(),
  activePreset: null,
  currentEntryId: null,
  revision: 0,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  saveError: null,

  setType: (type) => {
    if (get().type === type) return
    set({
      type,
      currentEntryId: null,
      revision: get().revision + 1,
      isDirty: true,
    })
  },

  setFormValues: (type, values) => {
    set((state) => ({
      forms: { ...state.forms, [type]: values },
      isDirty: true,
    }))
  },

  patchStyle: (patch) => {
    set((state) => ({
      style: { ...state.style, ...patch },
      activePreset: null,
      isDirty: true,
    }))
  },

  applyPreset: (id) => {
    const preset = STYLE_PRESETS.find((candidate) => candidate.id === id)
    if (!preset) return
    set((state) => {
      const errorCorrection = state.style.logo ? 'H' : preset.defaultErrorCorrection
      return {
        style: {
          ...state.style,
          ...preset.style,
          errorCorrection,
        },
        activePreset: id,
        isDirty: true,
      }
    })
  },

  resetStyle: () => {
    const current = get().style
    const defaults = createDefaultStyle()
    set({
      style: {
        ...defaults,
        logoSource: current.logoSource,
        logo: current.logo,
        logoName: current.logoName,
        errorCorrection: current.logo ? 'H' : defaults.errorCorrection,
      },
      activePreset: null,
      isDirty: true,
    })
  },

  setLogoSource: (source, name) => {
    set((state) => ({
      style: {
        ...state.style,
        logoSource: source,
        logo: source ? state.style.logo : null,
        logoName: name,
      },
      isDirty: true,
    }))
  },

  setLogo: (logo) => {
    set((state) => ({
      style: { ...state.style, logo },
    }))
  },

  loadEntry: (entry) => {
    set((state) => {
      const forms = structuredClone(state.forms)
      forms[entry.type] = structuredClone(entry.formData) as never
      return {
        type: entry.type,
        forms,
        style: structuredClone(entry.style),
        currentEntryId: entry.id,
        revision: state.revision + 1,
        activePreset: null,
        isDirty: false,
        isSaving: false,
        lastSavedAt: entry.updatedAt,
        saveError: null,
      }
    })
  },

  newCode: () => {
    set((state) => ({
      forms: createEmptyForms(),
      currentEntryId: null,
      revision: state.revision + 1,
      isDirty: true,
      lastSavedAt: null,
      saveError: null,
    }))
  },

  markSaving: (isSaving) => set({ isSaving }),

  markSaved: (entryId, savedAt) =>
    set({
      currentEntryId: entryId,
      isSaving: false,
      isDirty: false,
      lastSavedAt: savedAt,
      saveError: null,
    }),

  setSaveError: (saveError) => set({ saveError, isSaving: false }),

  detachEntry: () =>
    set({
      currentEntryId: null,
      lastSavedAt: null,
      isSaving: false,
      saveError: null,
    }),
}))
