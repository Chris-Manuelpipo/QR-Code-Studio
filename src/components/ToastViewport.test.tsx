import { beforeEach, describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastViewport } from '@/components/ToastViewport'
import { useSettingsStore } from '@/store/settings'
import { useToastStore } from '@/store/toasts'

beforeEach(() => {
  useSettingsStore.setState({ locale: 'fr' })
  useToastStore.getState().clear()
})

describe('ToastViewport', () => {
  it('renders notifications and dismisses them by accessible label', async () => {
    const user = userEvent.setup()
    render(<ToastViewport />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    act(() => {
      useToastStore.getState().push('Enregistré', 'success')
      useToastStore.getState().push('Attention', 'warning')
    })

    expect(screen.getAllByRole('status')).toHaveLength(2)
    expect(screen.getByText('Enregistré')).toBeInTheDocument()

    const dismissButtons = screen.getAllByRole('button', {
      name: 'Fermer la notification',
    })
    expect(dismissButtons).toHaveLength(2)
    await user.click(dismissButtons[0]!)

    expect(screen.queryByText('Enregistré')).not.toBeInTheDocument()
    expect(screen.getByText('Attention')).toBeInTheDocument()
  })

  it('keeps only the three most recent notifications', () => {
    render(<ToastViewport />)

    act(() => {
      useToastStore.getState().push('un')
      useToastStore.getState().push('deux')
      useToastStore.getState().push('trois')
      useToastStore.getState().push('quatre')
    })

    expect(screen.queryByText('un')).not.toBeInTheDocument()
    expect(screen.getByText('deux')).toBeInTheDocument()
    expect(screen.getByText('quatre')).toBeInTheDocument()
  })

  it('uses the English dismiss label when the locale changes', () => {
    useSettingsStore.setState({ locale: 'en' })
    render(<ToastViewport />)

    act(() => {
      useToastStore.getState().push('Saved')
    })

    expect(
      screen.getByRole('button', { name: 'Dismiss notification' }),
    ).toBeInTheDocument()
  })
})
