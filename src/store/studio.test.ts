import { beforeEach, describe, expect, it } from 'vitest'
import { entry } from '@/test/factories'
import { createDefaultForms, createDefaultStyle } from '@/lib/config'
import { useStudioStore } from '@/store/studio'

function resetStudio() {
  useStudioStore.setState({
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
  })
}

beforeEach(resetStudio)

describe('content state', () => {
  it('updates one form and marks the studio dirty', () => {
    useStudioStore.getState().setFormValues('url', { url: 'https://changed.test' })

    const state = useStudioStore.getState()
    expect(state.forms.url.url).toBe('https://changed.test')
    expect(state.forms.text.text).toBe('')
    expect(state.isDirty).toBe(true)
  })

  it('switches type, detaches the current entry and bumps the revision', () => {
    useStudioStore.getState().setType('wifi')

    const state = useStudioStore.getState()
    expect(state.type).toBe('wifi')
    expect(state.currentEntryId).toBeNull()
    expect(state.isDirty).toBe(true)
    expect(state.revision).toBe(1)
  })

  it('ignores a switch to the current type', () => {
    useStudioStore.getState().setType('url')
    expect(useStudioStore.getState().revision).toBe(0)
    expect(useStudioStore.getState().isDirty).toBe(false)
  })
})

describe('style state', () => {
  it('patches style values and clears the active preset', () => {
    useStudioStore.getState().applyPreset('minimal')
    expect(useStudioStore.getState().activePreset).toBe('minimal')

    useStudioStore.getState().patchStyle({ margin: 6 })
    const state = useStudioStore.getState()
    expect(state.style.margin).toBe(6)
    expect(state.activePreset).toBeNull()
    expect(state.isDirty).toBe(true)
  })

  it('applies presets without changing the logo or content', () => {
    useStudioStore.getState().setLogoSource('data:image/png;base64,AAAA', 'brand.png')
    useStudioStore.getState().setLogo('data:image/png;base64,BBBB')

    useStudioStore.getState().applyPreset('event')

    const state = useStudioStore.getState()
    expect(state.style.logoSource).toBe('data:image/png;base64,AAAA')
    expect(state.style.logo).toBe('data:image/png;base64,BBBB')
    expect(state.style.logoName).toBe('brand.png')
    expect(state.style.errorCorrection).toBe('H')
    expect(state.style.dotStyle).toBe('dots')
    expect(state.forms.url.url).toBe('https://example.com/atelier')
  })

  it('uses the preset error correction when no logo is present', () => {
    useStudioStore.getState().applyPreset('corporate')
    expect(useStudioStore.getState().style.errorCorrection).toBe('Q')
  })

  it('ignores unknown presets', () => {
    const before = useStudioStore.getState().style
    useStudioStore.getState().applyPreset('unknown' as never)
    expect(useStudioStore.getState().style).toEqual(before)
  })

  it('resets style but keeps the logo and protects it with level H', () => {
    useStudioStore.getState().setLogoSource('source', 'brand.png')
    useStudioStore.getState().setLogo('composed')
    useStudioStore.getState().patchStyle({
      margin: 0,
      dotStyle: 'dots',
      errorCorrection: 'L',
    })

    useStudioStore.getState().resetStyle()

    const state = useStudioStore.getState()
    expect(state.style.margin).toBe(4)
    expect(state.style.dotStyle).toBe('rounded')
    expect(state.style.errorCorrection).toBe('H')
    expect(state.style.logo).toBe('composed')
    expect(state.style.logoSource).toBe('source')
    expect(state.activePreset).toBeNull()
  })

  it('removes both logo layers when the source is cleared', () => {
    useStudioStore.getState().setLogoSource('source', 'brand.png')
    useStudioStore.getState().setLogo('composed')

    useStudioStore.getState().setLogoSource(null, null)

    const state = useStudioStore.getState()
    expect(state.style.logoSource).toBeNull()
    expect(state.style.logo).toBeNull()
    expect(state.style.logoName).toBeNull()
  })
})

describe('history state', () => {
  it('loads an entry and its forms without cloning references', () => {
    const source = entry('wifi', {
      id: 'wifi-1',
      formData: {
        ssid: 'Studio',
        password: 'secret',
        encryption: 'WPA',
        hidden: false,
      },
      updatedAt: 1234,
    })

    useStudioStore.getState().loadEntry(source)

    const state = useStudioStore.getState()
    expect(state.type).toBe('wifi')
    expect(state.currentEntryId).toBe('wifi-1')
    expect(state.forms.wifi.ssid).toBe('Studio')
    expect(state.lastSavedAt).toBe(1234)
    expect(state.isDirty).toBe(false)
    expect(state.revision).toBe(1)
    expect(state.forms.wifi).not.toBe(source.formData)
    expect(state.style).not.toBe(source.style)
  })

  it('starts a new empty code while preserving style and logo', () => {
    useStudioStore.getState().setLogoSource('source', 'brand.png')
    useStudioStore.getState().markSaved('old', 999)
    useStudioStore.getState().setFormValues('url', { url: 'https://old.test' })

    useStudioStore.getState().newCode()

    const state = useStudioStore.getState()
    expect(state.forms.url.url).toBe('')
    expect(state.currentEntryId).toBeNull()
    expect(state.lastSavedAt).toBeNull()
    expect(state.isDirty).toBe(true)
    expect(state.style.logoSource).toBe('source')
    expect(state.revision).toBe(1)
  })

  it('tracks save lifecycle and detaches cleanly', () => {
    useStudioStore.getState().markSaving(true)
    expect(useStudioStore.getState().isSaving).toBe(true)

    useStudioStore.getState().markSaved('entry-1', 500)
    expect(useStudioStore.getState()).toMatchObject({
      currentEntryId: 'entry-1',
      lastSavedAt: 500,
      isSaving: false,
      isDirty: false,
      saveError: null,
    })

    useStudioStore.getState().setSaveError('history')
    expect(useStudioStore.getState().saveError).toBe('history')
    expect(useStudioStore.getState().isSaving).toBe(false)

    useStudioStore.getState().detachEntry()
    expect(useStudioStore.getState()).toMatchObject({
      currentEntryId: null,
      lastSavedAt: null,
      isSaving: false,
      saveError: null,
    })
  })
})
