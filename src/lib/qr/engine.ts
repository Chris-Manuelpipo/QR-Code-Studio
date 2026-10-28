import qrcode from 'qrcode-generator'
import QRCodeStyling from 'qr-code-styling'
import type { ErrorCorrectionLevel, QrMetrics, StyleConfig } from '@/lib/types'
import { isHexColor } from '@/lib/utils/colors'
import { toUtf8BinaryString } from '@/lib/payloads'

export class QrGenerationError extends Error {
  code: 'capacity' | 'render' | 'decode'

  constructor(code: 'capacity' | 'render' | 'decode', message?: string) {
    super(message ?? code)
    this.name = 'QrGenerationError'
    this.code = code
  }
}

function detectMode(data: string): 'Numeric' | 'Alphanumeric' | 'Byte' {
  if (/^[0-9]*$/.test(data)) return 'Numeric'
  if (/^[0-9A-Z $%*+\-./:]*$/.test(data)) return 'Alphanumeric'
  return 'Byte'
}

export function getQrMetrics(
  payload: string,
  errorCorrection: ErrorCorrectionLevel,
): QrMetrics {
  try {
    const binary = toUtf8BinaryString(payload)
    const qr = qrcode(0, errorCorrection)
    qr.addData(binary, detectMode(binary))
    qr.make()
    return { moduleCount: qr.getModuleCount(), capacityError: false }
  } catch {
    return { moduleCount: 0, capacityError: true }
  }
}

export function marginInPixels(
  size: number,
  moduleCount: number,
  marginModules: number,
): number {
  if (moduleCount <= 0 || marginModules <= 0 || size <= 0) return 0
  const totalModules = moduleCount + marginModules * 2
  return Math.round((marginModules / totalModules) * size)
}

export interface QrOptionsInput {
  payload: string
  style: StyleConfig
  size: number
  transparentBackground?: boolean
}

export function buildQrOptions({
  payload,
  style,
  size,
  transparentBackground = false,
}: QrOptionsInput) {
  const metrics = getQrMetrics(payload, style.errorCorrection)
  if (metrics.capacityError) {
    throw new QrGenerationError('capacity')
  }

  const dark = isHexColor(style.dotColor) ? style.dotColor : '#171714'
  const dark2 = isHexColor(style.dotColor2) ? style.dotColor2 : dark
  const background = isHexColor(style.backgroundColor)
    ? style.backgroundColor
    : '#fbfaf5'
  const gradient =
    style.colorMode === 'solid'
      ? undefined
      : {
          type: style.colorMode,
          rotation: (style.gradientRotation * Math.PI) / 180,
          colorStops: [
            { offset: 0, color: dark },
            { offset: 1, color: dark2 },
          ],
        }

  return {
    type: 'canvas' as const,
    shape: 'square' as const,
    width: size,
    height: size,
    data: toUtf8BinaryString(payload),
    margin: marginInPixels(size, metrics.moduleCount, style.margin),
    qrOptions: {
      typeNumber: 0 as const,
      errorCorrectionLevel: style.errorCorrection,
    },
    dotsOptions: {
      type: style.dotStyle,
      ...(gradient ? { gradient } : { color: dark }),
      roundSize: true,
    },
    cornersSquareOptions: {
      type: style.cornerSquareStyle,
    },
    cornersDotOptions: {
      type: style.cornerDotStyle,
    },
    backgroundOptions: {
      color: transparentBackground ? 'transparent' : background,
    },
    ...(style.logo
      ? {
          image: style.logo,
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: style.logoImageSize,
            margin: Math.max(2, Math.round(size * 0.012)),
            saveAsBlob: true,
          },
        }
      : {
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.3,
            margin: 0,
            saveAsBlob: true,
          },
        }),
  }
}

export async function renderQrBlob(
  input: QrOptionsInput,
  extension: 'png' | 'svg' = 'png',
): Promise<Blob> {
  const options = buildQrOptions(input)
  const qr = new QRCodeStyling(options)
  let data: Blob | ArrayBuffer | Uint8Array | null
  try {
    data = (await qr.getRawData(extension)) as Blob | ArrayBuffer | Uint8Array | null
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('overflow')) {
      throw new QrGenerationError('capacity', message)
    }
    throw new QrGenerationError('render', message)
  }
  if (!data) throw new QrGenerationError('render')
  if (data instanceof Blob) return data
  return new Blob([data as BlobPart], {
    type: extension === 'svg' ? 'image/svg+xml' : 'image/png',
  })
}

export async function renderQrDataUrl(
  input: QrOptionsInput,
  extension: 'png' | 'svg' = 'png',
): Promise<string> {
  const blob = await renderQrBlob(input, extension)
  return blobToDataUrl(blob)
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new QrGenerationError('decode'))
    reader.readAsDataURL(blob)
  })
}

export function downscaleBlob(blob: Blob, size = 128): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    const url = URL.createObjectURL(blob)
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const context = canvas.getContext('2d')
      if (!context) {
        URL.revokeObjectURL(url)
        reject(new QrGenerationError('decode'))
        return
      }
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, size, size)
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      context.drawImage(image, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new QrGenerationError('decode'))
    }
    image.src = url
  })
}

export interface DecodeResult {
  data: string | null
  durationMs: number
}

export async function decodeQrBlob(blob: Blob): Promise<DecodeResult> {
  const startedAt = performance.now()
  const { default: jsQR } = await import('jsqr')
  const image = new Image()
  image.decoding = 'async'
  const url = URL.createObjectURL(blob)
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new QrGenerationError('decode'))
      image.src = url
    })
    const width = image.naturalWidth || image.width
    const height = image.naturalHeight || image.height
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new QrGenerationError('decode')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0)
    const imageData = context.getImageData(0, 0, width, height)
    const result = jsQR(imageData.data, width, height, {
      inversionAttempts: 'attemptBoth',
    })
    return {
      data: result?.data ?? null,
      durationMs: Math.round(performance.now() - startedAt),
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function createPreviewQr(input: QrOptionsInput): QRCodeStyling {
  const qr = new QRCodeStyling(buildQrOptions(input))
  return qr
}
