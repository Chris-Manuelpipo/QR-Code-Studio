import type { ContentType, Locale, StyleConfig } from '@/lib/types'
import {
  renderQrBlob,
  downscaleBlob,
  blobToDataUrl,
  renderQrDataUrl,
} from '@/lib/qr/engine'

export function buildFilename(
  type: ContentType,
  extension: 'png' | 'svg' | 'pdf',
  date = new Date(),
): string {
  const stamp = date.toISOString().slice(0, 19).replace(/[:T]/g, '-')
  return `qr-${type}-${stamp}.${extension}`
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export async function exportPng(
  payload: string,
  style: StyleConfig,
  type: ContentType,
): Promise<void> {
  const blob = await renderQrBlob(
    {
      payload,
      style,
      size: style.size,
      transparentBackground: style.transparentBackground,
    },
    'png',
  )
  downloadBlob(blob, buildFilename(type, 'png'))
}

export async function exportSvg(
  payload: string,
  style: StyleConfig,
  type: ContentType,
): Promise<void> {
  const blob = await renderQrBlob(
    {
      payload,
      style,
      size: style.size,
      transparentBackground: style.transparentBackground,
    },
    'svg',
  )
  downloadBlob(blob, buildFilename(type, 'svg'))
}

const PDF_LABELS = {
  fr: {
    subject: 'QR code prêt à imprimer',
    heading: 'Votre QR code',
    meta: (typeLabel: string, size: number, level: string) =>
      `${typeLabel} · ${size} px source · correction ${level}`,
    footer: (qrSize: number, margin: number, date: string) =>
      `A4 · QR ${qrSize} mm · marge ${margin} modules · généré le ${date}`,
    check: 'Vérifiez toujours le code sur papier avant diffusion.',
    marks: 'Repères de découpe autour de la zone imprimable.',
    scale: 'Échelle 100 % — ne pas ajuster à la page lors de l’impression.',
    local: 'QR Code Studio · traitement 100 % local',
  },
  en: {
    subject: 'Print-ready QR code',
    heading: 'Your QR code',
    meta: (typeLabel: string, size: number, level: string) =>
      `${typeLabel} · ${size} px source · ${level} correction`,
    footer: (qrSize: number, margin: number, date: string) =>
      `A4 · QR ${qrSize} mm · ${margin}-module margin · generated on ${date}`,
    check: 'Always test the code on paper before distributing it.',
    marks: 'Crop marks around the printable area.',
    scale: '100% scale — do not fit to page when printing.',
    local: 'QR Code Studio · 100% local processing',
  },
} as const

export async function exportPdf(
  payload: string,
  style: StyleConfig,
  type: ContentType,
  typeLabel: string,
  locale: Locale,
): Promise<void> {
  const labels = PDF_LABELS[locale]
  const printSize = Math.max(style.size, 1024)
  const blob = await renderQrBlob({
    payload,
    style,
    size: printSize,
    transparentBackground: false,
  })
  const dataUrl = await blobToDataUrl(blob)
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  pdf.setProperties({
    title: `QR Code Studio — ${typeLabel}`,
    subject: labels.subject,
    creator: 'QR Code Studio',
  })

  const pageWidth = 210
  const pageHeight = 297
  const qrSize = 118
  const qrX = (pageWidth - qrSize) / 2
  const qrY = 76
  const frameInset = 7
  const frameSize = qrSize + frameInset * 2

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.setTextColor(23, 23, 20)
  pdf.text('QR CODE STUDIO', 20, 20)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(107, 105, 95)
  pdf.setFontSize(8)
  pdf.text('LOCAL · VERIFIED · PRINT READY', 20, 25)

  pdf.setDrawColor(23, 23, 20)
  pdf.setLineWidth(0.25)
  pdf.rect(qrX, qrY, qrSize, qrSize)

  const markX = qrX - frameInset
  const markY = qrY - frameInset
  const tick = 5
  pdf.setLineWidth(0.3)
  drawCropMark(pdf, markX, markY, tick, 1, 1)
  drawCropMark(pdf, markX + frameSize, markY, tick, -1, 1)
  drawCropMark(pdf, markX, markY + frameSize, tick, 1, -1)
  drawCropMark(pdf, markX + frameSize, markY + frameSize, tick, -1, -1)

  pdf.addImage(dataUrl, 'PNG', qrX, qrY, qrSize, qrSize, undefined, 'FAST')

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.setTextColor(23, 23, 20)
  pdf.text(labels.heading, 20, 48)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(107, 105, 95)
  pdf.text(labels.meta(typeLabel, style.size, style.errorCorrection), 20, 54)
  pdf.text(
    labels.footer(
      qrSize,
      style.margin,
      new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
        dateStyle: 'long',
      }).format(new Date()),
    ),
    20,
    60,
  )

  pdf.setDrawColor(214, 211, 201)
  pdf.line(20, 218, pageWidth - 20, 218)
  pdf.setFontSize(8)
  pdf.setTextColor(107, 105, 95)
  pdf.text(labels.check, 20, 226)
  pdf.text(labels.marks, 20, 231)
  pdf.text(labels.scale, 20, 236)

  const payloadPreview = payload.length > 170 ? `${payload.slice(0, 167)}…` : payload
  pdf.setFont('courier', 'normal')
  pdf.setFontSize(6.5)
  pdf.setTextColor(139, 136, 125)
  const payloadLines = pdf.splitTextToSize(payloadPreview, pageWidth - 40)
  pdf.text(payloadLines.slice(0, 4), 20, 250)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  pdf.text(labels.local, 20, pageHeight - 12)
  pdf.text('QR Code Studio · v1.0', pageWidth - 20, pageHeight - 12, {
    align: 'right',
  })

  pdf.save(buildFilename(type, 'pdf'))
}

export async function copyPngToClipboard(
  payload: string,
  style: StyleConfig,
): Promise<void> {
  const blob = await renderQrBlob(
    {
      payload,
      style,
      size: style.size,
      transparentBackground: style.transparentBackground,
    },
    'png',
  )
  if (
    typeof ClipboardItem === 'undefined' ||
    !navigator.clipboard ||
    !navigator.clipboard.write
  ) {
    throw new Error('clipboard_unavailable')
  }
  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob,
    }),
  ])
}

export async function getEntryThumbnail(
  payload: string,
  style: StyleConfig,
): Promise<string> {
  const blob = await renderQrBlob(
    {
      payload,
      style,
      size: 256,
      transparentBackground: false,
    },
    'png',
  )
  return downscaleBlob(blob, 128)
}

export async function getPreviewDataUrl(
  payload: string,
  style: StyleConfig,
  size: number,
): Promise<string> {
  return renderQrDataUrl({
    payload,
    style,
    size,
    transparentBackground: false,
  })
}

function drawCropMark(
  pdf: import('jspdf').jsPDF,
  x: number,
  y: number,
  length: number,
  directionX: 1 | -1,
  directionY: 1 | -1,
): void {
  pdf.line(x, y, x + length * directionX, y)
  pdf.line(x, y, x, y + length * directionY)
}
