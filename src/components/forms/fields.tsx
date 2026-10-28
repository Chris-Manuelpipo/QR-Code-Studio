import type { ComponentProps, ReactNode } from 'react'
import { CaretDown } from '@phosphor-icons/react'

interface FieldMeta {
  id: string
  label: string
  hint?: ReactNode
  error?: string
  optional?: string
  required?: boolean
  requiredLabel?: string
}

function describedBy(meta: FieldMeta): string | undefined {
  const ids = [
    meta.hint ? `${meta.id}-hint` : null,
    meta.error ? `${meta.id}-error` : null,
  ].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
}

function FieldShell({ meta, children }: { meta: FieldMeta; children: ReactNode }) {
  return (
    <div className={meta.error ? 'field field--error' : 'field'}>
      <div className="field-head">
        <label htmlFor={meta.id} className="field-label">
          {meta.label}
          {meta.required ? (
            <span className="field-required" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {meta.optional ? (
          <span className="field-badge">{meta.optional}</span>
        ) : meta.required && meta.requiredLabel ? (
          <span className="field-badge field-badge--required">
            {meta.requiredLabel}
          </span>
        ) : null}
      </div>
      {children}
      {meta.hint ? (
        <p id={`${meta.id}-hint`} className="field-hint">
          {meta.hint}
        </p>
      ) : null}
      {meta.error ? (
        <p id={`${meta.id}-error`} className="field-error" role="alert">
          {meta.error}
        </p>
      ) : null}
    </div>
  )
}

type TextFieldProps = Omit<ComponentProps<'input'>, 'id' | 'className'> & {
  id: string
  label: string
  hint?: ReactNode
  error?: string
  optional?: string
  requiredLabel?: string
  mono?: boolean
}

export function TextField({
  id,
  label,
  hint,
  error,
  optional,
  requiredLabel,
  required,
  mono,
  ...input
}: TextFieldProps) {
  const meta: FieldMeta = { id, label, hint, error, optional, required, requiredLabel }
  return (
    <FieldShell meta={meta}>
      <div className={mono ? 'input-wrap input-wrap--mono' : 'input-wrap'}>
        <input
          id={id}
          className="input"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(meta)}
          required={required}
          {...input}
        />
      </div>
    </FieldShell>
  )
}

type TextAreaFieldProps = Omit<ComponentProps<'textarea'>, 'id' | 'className'> & {
  id: string
  label: string
  hint?: ReactNode
  error?: string
  optional?: string
  requiredLabel?: string
  mono?: boolean
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  optional,
  requiredLabel,
  required,
  mono,
  rows = 4,
  ...textarea
}: TextAreaFieldProps) {
  const meta: FieldMeta = { id, label, hint, error, optional, required, requiredLabel }
  return (
    <FieldShell meta={meta}>
      <textarea
        id={id}
        rows={rows}
        className={mono ? 'input textarea textarea--mono' : 'input textarea'}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(meta)}
        required={required}
        {...textarea}
      />
    </FieldShell>
  )
}

type SelectFieldProps = Omit<ComponentProps<'select'>, 'id' | 'className'> & {
  id: string
  label: string
  hint?: ReactNode
  error?: string
  optional?: string
  requiredLabel?: string
  children: ReactNode
}

export function SelectField({
  id,
  label,
  hint,
  error,
  optional,
  requiredLabel,
  required,
  children,
  ...select
}: SelectFieldProps) {
  const meta: FieldMeta = { id, label, hint, error, optional, required, requiredLabel }
  return (
    <FieldShell meta={meta}>
      <div className="select-wrap">
        <select
          id={id}
          className="input select"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(meta)}
          required={required}
          {...select}
        >
          {children}
        </select>
        <CaretDown size={16} className="select-icon" aria-hidden="true" />
      </div>
    </FieldShell>
  )
}

interface CheckboxFieldProps extends Omit<
  ComponentProps<'input'>,
  'type' | 'id' | 'className'
> {
  id: string
  label: string
  hint?: ReactNode
}

export function CheckboxField({ id, label, hint, ...input }: CheckboxFieldProps) {
  return (
    <div className="checkbox-field">
      <label htmlFor={id} className="checkbox-label">
        <input id={id} type="checkbox" className="checkbox" {...input} />
        <span className="checkbox-box" aria-hidden="true">
          <span className="checkbox-mark" />
        </span>
        <span className="checkbox-text">{label}</span>
      </label>
      {hint ? <p className="field-hint checkbox-hint">{hint}</p> : null}
    </div>
  )
}

export interface SegmentOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface SegmentedProps<T extends string> {
  name: string
  label: string
  value: T
  options: ReadonlyArray<SegmentOption<T>>
  onChange: (value: T) => void
  compact?: boolean
}

export function Segmented<T extends string>({
  name,
  label,
  value,
  options,
  onChange,
  compact,
}: SegmentedProps<T>) {
  return (
    <div
      className={compact ? 'segmented segmented--compact' : 'segmented'}
      role="group"
      aria-label={label}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            name={name}
            className={selected ? 'segment segment--active' : 'segment'}
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
          >
            {option.icon ? (
              <span className="segment-icon" aria-hidden="true">
                {option.icon}
              </span>
            ) : null}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
