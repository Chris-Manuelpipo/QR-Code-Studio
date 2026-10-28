interface BrandMarkProps {
  size?: number
}

export function BrandMark({ size = 32 }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className="brand-mark"
    >
      <rect
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect x="5.5" y="5.5" width="5" height="5" fill="currentColor" />
      <rect
        x="25.5"
        y="1.5"
        width="13"
        height="13"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect x="29.5" y="5.5" width="5" height="5" fill="currentColor" />
      <rect
        x="1.5"
        y="25.5"
        width="13"
        height="13"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect x="5.5" y="29.5" width="5" height="5" fill="currentColor" />
      <rect x="25.5" y="25.5" width="5" height="5" fill="currentColor" />
      <rect x="33.5" y="25.5" width="5" height="5" fill="currentColor" />
      <rect x="25.5" y="33.5" width="5" height="5" fill="currentColor" />
      <rect x="33.5" y="33.5" width="5" height="5" fill="currentColor" />
      <rect x="19" y="19" width="2" height="2" fill="currentColor" />
    </svg>
  )
}
