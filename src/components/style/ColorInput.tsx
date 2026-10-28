import { useState } from 'react'
import { isHexColor } from '@/lib/utils/colors'

interface ColorInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  hint?: string
}

function normalizeHex(input: string): string | null {
  const value = input.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(value)) {
    const [r, g, b] = value
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  if (/^[0-9a-f]{6}$/i.test(value)) return `#${value.toLowerCase()}`
  return null
}

export function ColorInput({
  id,
  label,
  value,
  onChange,
  disabled,
  hint,
}: ColorInputProps) {
  const [draft, setDraft] = useState(value)
  const [lastValue, setLastValue] = useState(value)

  // Reset the draft when the colour changes from the outside (presets, picker).
  if (value !== lastValue) {
    setLastValue(value)
    setDraft(value)
  }

  function commit(next: string) {
    const normalized = normalizeHex(next)
    if (normalized) {
      onChange(normalized)
    } else {
      setDraft(value)
    }
  }

  return (
    <div
      className={disabled ? 'color-control color-control--disabled' : 'color-control'}
    >
      <label htmlFor={`${id}-picker`} className="color-label">
        {label}
      </label>
      <div className="color-row">
        <span
          className="color-swatch"
          style={{ backgroundColor: isHexColor(value) ? value : '#000000' }}
        >
          <input
            id={`${id}-picker`}
            type="color"
            className="color-native"
            value={isHexColor(value) ? value : '#000000'}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            aria-label={label}
          />
        </span>
        <input
          id={`${id}-hex`}
          className="input input--hex mono"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit(draft)
            }
          }}
          disabled={disabled}
          aria-label={label}
          spellCheck={false}
          maxLength={7}
        />
      </div>
      {hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  )
}
