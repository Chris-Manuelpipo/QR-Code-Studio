export interface Rgb {
  r: number
  g: number
  b: number
}

export function parseHexColor(value: string): Rgb | null {
  const normalized = value.trim().replace('#', '')
  if (/^[0-9a-f]{3}$/i.test(normalized)) {
    const [r, g, b] = normalized.split('')
    if (!r || !g || !b) return null
    return {
      r: Number.parseInt(r + r, 16),
      g: Number.parseInt(g + g, 16),
      b: Number.parseInt(b + b, 16),
    }
  }
  if (/^[0-9a-f]{6}$/i.test(normalized)) {
    return {
      r: Number.parseInt(normalized.slice(0, 2), 16),
      g: Number.parseInt(normalized.slice(2, 4), 16),
      b: Number.parseInt(normalized.slice(4, 6), 16),
    }
  }
  return null
}

export function isHexColor(value: string): boolean {
  return parseHexColor(value) !== null
}

export function relativeLuminance(color: string | Rgb): number {
  const rgb = typeof color === 'string' ? parseHexColor(color) : color
  if (!rgb) return 0
  const channels = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  const [r = 0, g = 0, b = 0] = channels
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground)
  const l2 = relativeLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function isLightColor(color: string): boolean {
  return relativeLuminance(color) > 0.4
}

export function readableInk(background: string): '#171714' | '#fbfaf5' {
  return isLightColor(background) ? '#171714' : '#fbfaf5'
}

export function getQrContrast(
  dotColor: string,
  dotColor2: string,
  backgroundColor: string,
): number {
  return Math.min(
    contrastRatio(dotColor, backgroundColor),
    contrastRatio(dotColor2, backgroundColor),
  )
}

export function getInversionRisk(
  dotColor: string,
  dotColor2: string,
  backgroundColor: string,
): boolean {
  const dotLuminance = Math.max(
    relativeLuminance(dotColor),
    relativeLuminance(dotColor2),
  )
  return dotLuminance > relativeLuminance(backgroundColor)
}
