import { MAX_LOGO_BYTES } from '@/lib/config'
import type { LogoBackground, StyleConfig } from '@/lib/types'
import { isHexColor } from '@/lib/utils/colors'

export type LogoErrorCode = 'file_type' | 'file_size' | 'invalid_image' | 'svg_invalid'

export class LogoError extends Error {
  code: LogoErrorCode

  constructor(code: LogoErrorCode) {
    super(code)
    this.name = 'LogoError'
    this.code = code
  }
}

const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/svg+xml'])

const BLOCKED_ELEMENTS = new Set([
  'script',
  'foreignObject',
  'iframe',
  'object',
  'embed',
  'audio',
  'video',
  'canvas',
  'handler',
])

const URL_ATTRIBUTES = new Set(['href', 'xlink:href', 'src', 'action', 'formaction'])

export function validateLogoFile(file: File): void {
  const isAllowedType =
    ALLOWED_MIME.has(file.type) || /\.(png|jpe?g|svg)$/i.test(file.name)
  if (!isAllowedType) throw new LogoError('file_type')
  if (file.size > MAX_LOGO_BYTES) throw new LogoError('file_size')
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new LogoError('invalid_image'))
    reader.readAsDataURL(file)
  })
}

export function sanitizeSvg(source: string): string {
  const parser = new DOMParser()
  const documentNode = parser.parseFromString(source, 'image/svg+xml')
  if (documentNode.querySelector('parsererror')) {
    throw new LogoError('svg_invalid')
  }
  const root = documentNode.documentElement
  if (!root || root.tagName.toLowerCase() !== 'svg') {
    throw new LogoError('svg_invalid')
  }

  for (const element of Array.from(root.querySelectorAll('*'))) {
    if (BLOCKED_ELEMENTS.has(element.tagName)) {
      element.remove()
      continue
    }
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase()
      const localName = attribute.localName.toLowerCase()
      if (name.startsWith('on')) {
        element.removeAttribute(attribute.name)
        continue
      }
      if (URL_ATTRIBUTES.has(localName)) {
        const value = attribute.value.trim()
        if (!value.startsWith('#') && !value.startsWith('data:image/')) {
          element.removeAttribute(attribute.name)
        }
        continue
      }
      if (localName === 'style') {
        const cleaned = attribute.value
          .replace(/@import[^;]+;?/gi, '')
          .replace(/url\((?!['"]?#)[^)]*\)/gi, 'none')
        if (cleaned.trim()) {
          element.setAttribute(attribute.name, cleaned)
        } else {
          element.removeAttribute(attribute.name)
        }
      }
    }
  }

  for (const styleElement of Array.from(root.querySelectorAll('style'))) {
    styleElement.textContent = (styleElement.textContent ?? '')
      .replace(/@import[^;]+;?/gi, '')
      .replace(/url\((?!['"]?#)[^)]*\)/gi, 'none')
  }

  if (!root.getAttribute('xmlns')) {
    root.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  }
  if (!root.getAttribute('viewBox')) {
    const width = Number.parseFloat(root.getAttribute('width') ?? '0')
    const height = Number.parseFloat(root.getAttribute('height') ?? '0')
    if (width > 0 && height > 0) {
      root.setAttribute('viewBox', `0 0 ${width} ${height}`)
    } else {
      root.setAttribute('viewBox', '0 0 512 512')
    }
  }
  if (!root.getAttribute('width')) root.setAttribute('width', '512')
  if (!root.getAttribute('height')) root.setAttribute('height', '512')

  return new XMLSerializer().serializeToString(root)
}

export function prepareLogoSource(file: File): Promise<string> {
  validateLogoFile(file)
  return readFileAsDataUrl(file).then((dataUrl) => {
    if (file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)) {
      const svgData = dataUrl.replace(
        /^data:image\/svg\+xml(?:;charset=[^;,]+)?(;base64)?,/,
        '',
      )
      const svgText =
        dataUrl.includes(';base64,') && svgData
          ? new TextDecoder().decode(
              Uint8Array.from(atob(svgData), (character) => character.charCodeAt(0)),
            )
          : decodeURIComponent(svgData)
      const sanitized = sanitizeSvg(svgText)
      return rasterizeToPng(
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sanitized)}`,
        512,
      )
    }
    return rasterizeToPng(dataUrl, 512)
  })
}

export function getLogoBackgroundColor(
  background: LogoBackground,
  customColor: string,
): string | null {
  if (background === 'none') return null
  if (background === 'light') return '#fbfaf5'
  if (background === 'dark') return '#171714'
  return isHexColor(customColor) ? customColor : '#fbfaf5'
}

export function composeLogo(
  source: string,
  background: LogoBackground,
  customColor: string,
): Promise<string> {
  const backgroundColor = getLogoBackgroundColor(background, customColor)
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new LogoError('invalid_image'))
        return
      }

      if (backgroundColor) {
        context.fillStyle = backgroundColor
        roundedRect(context, 0, 0, 512, 512, 112)
        context.fill()
      }

      const padding = backgroundColor ? 76 : 38
      const available = 512 - padding * 2
      const scale = Math.min(available / image.width, available / image.height)
      const width = image.width * scale
      const height = image.height * scale
      context.drawImage(image, (512 - width) / 2, (512 - height) / 2, width, height)
      resolve(canvas.toDataURL('image/png'))
    }
    image.onerror = () => reject(new LogoError('invalid_image'))
    image.src = source
  })
}

export async function buildLogo(
  source: string,
  style: Pick<StyleConfig, 'logoBackground' | 'logoBackgroundColor'>,
): Promise<string> {
  return composeLogo(source, style.logoBackground, style.logoBackgroundColor)
}

function rasterizeToPng(source: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new LogoError('invalid_image'))
        return
      }
      const scale = Math.min(size / image.width, size / image.height)
      const width = image.width * scale
      const height = image.height * scale
      context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height)
      resolve(canvas.toDataURL('image/png'))
    }
    image.onerror = () => reject(new LogoError('invalid_image'))
    image.src = source
  })
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2)
  context.beginPath()
  context.moveTo(x + r, y)
  context.arcTo(x + width, y, x + width, y + height, r)
  context.arcTo(x + width, y + height, x, y + height, r)
  context.arcTo(x, y + height, x, y, r)
  context.arcTo(x, y, x + width, y, r)
  context.closePath()
}
