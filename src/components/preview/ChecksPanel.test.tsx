import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChecksPanel } from '@/components/preview/ChecksPanel'
import { createDefaultStyle } from '@/lib/config'
import { useSettingsStore } from '@/store/settings'
import { useStudioStore } from '@/store/studio'
import { validation } from '@/test/factories'
import type { ScannabilityResult, StyleConfig } from '@/lib/types'

function renderPanel(
  styleOverrides: Partial<StyleConfig> = {},
  validationOverrides: Partial<ScannabilityResult> = {},
  checking = false,
) {
  const style: StyleConfig = { ...createDefaultStyle(), ...styleOverrides }
  useStudioStore.setState({ style })
  render(
    <ChecksPanel
      validation={validation(validationOverrides)}
      style={style}
      checking={checking}
    />,
  )
  return style
}

beforeEach(() => {
  useSettingsStore.setState({ locale: 'fr' })
  useStudioStore.setState({ style: createDefaultStyle() })
})

describe('ChecksPanel', () => {
  it('shows the four verification dimensions', () => {
    renderPanel()

    expect(screen.getByText('Détails du contrôle')).toBeInTheDocument()
    expect(screen.getByText('Décodage conforme')).toBeInTheDocument()
    expect(screen.getByText('Sans logo')).toBeInTheDocument()
    expect(screen.getByText('Marge de 4 modules')).toBeInTheDocument()
    expect(screen.getByText(/^Contraste /)).toBeInTheDocument()
    expect(screen.getByText('Décodé en 12 ms')).toBeInTheDocument()
    expect(screen.getByText('Vérifié localement')).toBeInTheDocument()
  })

  it('exposes warning counts and the decode failure message', () => {
    renderPanel(
      { margin: 0 },
      {
        status: 'unscannable',
        decoded: null,
        expected: 'hello',
        durationMs: 8,
        message: 'decode_failed',
        warnings: [{ code: 'margin_low', action: 'set_margin' }],
      },
    )

    expect(
      screen.getByText(/Le décodeur n’a pas pu lire ce code/, {
        selector: '.check-message',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/point d’attention/)).toBeInTheDocument()
    expect(screen.getByText('Marge de 0 modules')).toBeInTheDocument()
  })

  it('pluralizes warnings', () => {
    renderPanel(
      { logo: 'data:image/png;base64,AAAA' },
      {
        status: 'attention',
        warnings: [
          { code: 'logo_too_large', action: 'reduce_logo' },
          { code: 'ec_low_for_logo', action: 'set_h' },
        ],
      },
    )
    expect(screen.getByText('2 points d’attention')).toBeInTheDocument()
  })

  it('reduces an oversized logo from the warning action', async () => {
    const user = userEvent.setup()
    renderPanel(
      {
        logo: 'data:image/png;base64,AAAA',
        logoImageSize: 0.8,
        errorCorrection: 'H',
      },
      {
        status: 'attention',
        warnings: [{ code: 'logo_too_large', action: 'reduce_logo' }],
      },
    )

    await user.click(screen.getByRole('button', { name: 'Réduire le logo' }))
    expect(useStudioStore.getState().style.logoImageSize).toBe(0.3)
  })

  it('restores a safe margin and colour setup', async () => {
    const user = userEvent.setup()
    renderPanel(
      { margin: 0 },
      {
        status: 'attention',
        warnings: [
          { code: 'margin_low', action: 'set_margin' },
          { code: 'contrast_low', action: 'set_size' },
        ],
      },
    )

    await user.click(screen.getByRole('button', { name: 'Mettre la marge à 4' }))
    expect(useStudioStore.getState().style.margin).toBe(4)

    await user.click(screen.getByRole('button', { name: 'Renforcer le contraste' }))
    expect(useStudioStore.getState().style).toMatchObject({
      colorMode: 'solid',
      dotColor: '#171714',
      backgroundColor: '#fbfaf5',
      transparentBackground: false,
    })
  })

  it('shows a pending decode while checking', () => {
    renderPanel({}, {}, true)
    expect(screen.getByText('Décodage en attente')).toBeInTheDocument()
  })
})
