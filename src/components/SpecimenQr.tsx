interface SpecimenQrProps {
  className?: string
}

const SIZE = 21
const CELL = 7
const PAD = 10.5
const FINDERS: Array<[number, number]> = [
  [0, 0],
  [14, 0],
  [0, 14],
]

function inFinder(x: number, y: number): boolean {
  return FINDERS.some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7)
}

function isModule(x: number, y: number): boolean {
  if (inFinder(x, y)) return false
  const hash = (x * 17 + y * 31 + x * y * 7 + 13) % 11
  const ring = (x > 7 && x < 13) || (y > 7 && y < 13)
  return hash < (ring ? 4 : 5)
}

export function SpecimenQr({ className }: SpecimenQrProps) {
  const modules: Array<{ x: number; y: number; accent: boolean }> = []
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (inFinder(x, y) || !isModule(x, y)) continue
      modules.push({
        x: PAD + x * CELL,
        y: PAD + y * CELL,
        accent: (x * 5 + y * 3) % 23 === 0,
      })
    }
  }

  return (
    <svg
      viewBox="0 0 168 168"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <rect width="168" height="168" rx="4" fill="var(--specimen-paper, #fbfaf5)" />
      {FINDERS.map(([x, y]) => {
        const originX = PAD + x * CELL
        const originY = PAD + y * CELL
        return (
          <g key={`${x}-${y}`}>
            <rect
              x={originX}
              y={originY}
              width={CELL * 7}
              height={CELL * 7}
              rx="3"
              fill="none"
              stroke="var(--specimen-ink, #171714)"
              strokeWidth={CELL}
            />
            <rect
              x={originX + CELL * 2}
              y={originY + CELL * 2}
              width={CELL * 3}
              height={CELL * 3}
              rx="1.5"
              fill="var(--specimen-ink, #171714)"
            />
          </g>
        )
      })}
      {modules.map((module) => (
        <rect
          key={`${module.x}-${module.y}`}
          x={module.x}
          y={module.y}
          width={CELL - 1.4}
          height={CELL - 1.4}
          rx={module.accent ? 2.6 : 1}
          fill={
            module.accent
              ? 'var(--specimen-accent, #b6e83c)'
              : 'var(--specimen-ink, #171714)'
          }
        />
      ))}
    </svg>
  )
}
