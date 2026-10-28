import { describe, expect, it } from 'vitest'
import { buildFilename } from '@/lib/export'
import { blobToDataUrl } from '@/lib/qr/engine'

describe('buildFilename', () => {
  it('includes the content type and a sortable timestamp', () => {
    expect(buildFilename('wifi', 'png', new Date('2026-10-27T12:34:56.000Z'))).toBe(
      'qr-wifi-2026-10-27-12-34-56.png',
    )
    expect(buildFilename('vcard', 'svg', new Date('2026-01-02T03:04:05.000Z'))).toBe(
      'qr-vcard-2026-01-02-03-04-05.svg',
    )
    expect(buildFilename('contact', 'pdf', new Date('2026-12-31T23:59:59.000Z'))).toBe(
      'qr-contact-2026-12-31-23-59-59.pdf',
    )
  })
})

describe('blobToDataUrl', () => {
  it('encodes a PNG blob as a data URL', async () => {
    const blob = new Blob([new Uint8Array([137, 80, 78, 71])], {
      type: 'image/png',
    })
    await expect(blobToDataUrl(blob)).resolves.toBe('data:image/png;base64,iVBORw==')
  })
})
