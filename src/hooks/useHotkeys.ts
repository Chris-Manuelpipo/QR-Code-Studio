import { useEffect, useRef } from 'react'

interface HotkeyHandlers {
  onExport: () => void
  onTheme: () => void
  onLanguage: () => void
}

export function useHotkeys(handlers: HotkeyHandlers): void {
  const ref = useRef(handlers)

  useEffect(() => {
    ref.current = handlers
  }, [handlers])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey
      if (!mod) return

      if (event.key.toLowerCase() === 's') {
        event.preventDefault()
        ref.current.onExport()
        return
      }
      if (event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        ref.current.onTheme()
        return
      }
      if (event.shiftKey && event.key.toLowerCase() === 'l') {
        event.preventDefault()
        ref.current.onLanguage()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
