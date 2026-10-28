import type { ReactNode } from 'react'

interface PanelProps {
  step: string
  title: string
  hint?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  id: string
}

export function Panel({
  step,
  title,
  hint,
  actions,
  children,
  className,
  id,
}: PanelProps) {
  return (
    <section
      id={id}
      className={className ? `panel ${className}` : 'panel'}
      aria-labelledby={`${id}-title`}
    >
      <header className="panel-header">
        <div className="panel-heading">
          <span className="panel-step mono" aria-hidden="true">
            {step}
          </span>
          <div>
            <h2 id={`${id}-title`} className="panel-title">
              {title}
            </h2>
            {hint ? <p className="panel-hint">{hint}</p> : null}
          </div>
        </div>
        {actions ? <div className="panel-actions">{actions}</div> : null}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  )
}
