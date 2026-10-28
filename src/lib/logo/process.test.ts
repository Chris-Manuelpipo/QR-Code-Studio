import { describe, expect, it } from 'vitest'
import { LogoError, sanitizeSvg, validateLogoFile } from '@/lib/logo/process'
import { MAX_LOGO_BYTES } from '@/lib/config'

describe('validateLogoFile', () => {
  it('accepts PNG, JPEG and SVG files by MIME type', () => {
    expect(() =>
      validateLogoFile(new File(['x'], 'logo.png', { type: 'image/png' })),
    ).not.toThrow()
    expect(() =>
      validateLogoFile(new File(['x'], 'logo.jpg', { type: 'image/jpeg' })),
    ).not.toThrow()
    expect(() =>
      validateLogoFile(new File(['x'], 'logo.svg', { type: 'image/svg+xml' })),
    ).not.toThrow()
  })

  it('accepts a known extension when the MIME type is missing', () => {
    expect(() =>
      validateLogoFile(new File(['x'], 'logo.PNG', { type: '' })),
    ).not.toThrow()
  })

  it('rejects unsupported formats and oversized files', () => {
    expect(() =>
      validateLogoFile(new File(['x'], 'logo.gif', { type: 'image/gif' })),
    ).toThrow(LogoError)
    expect(() =>
      validateLogoFile(new File(['x'], 'notes.txt', { type: 'text/plain' })),
    ).toThrow(LogoError)

    const oversized = new File([new Uint8Array(MAX_LOGO_BYTES + 1)], 'big.png', {
      type: 'image/png',
    })
    expect(() => validateLogoFile(oversized)).toThrow(LogoError)
  })
})

describe('sanitizeSvg', () => {
  it('removes scripts, event handlers and external references', () => {
    const source = `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="50">
        <script>alert(1)</script>
        <rect width="10" height="10" onclick="alert(2)" style="fill:url(http://evil.test/x)" />
        <image href="https://evil.test/pixel.png" />
        <use xlink:href="#safe" />
        <style>@import url("https://evil.test/a.css"); .a { fill: red }</style>
      </svg>
    `
    const sanitized = sanitizeSvg(source)

    expect(sanitized).not.toContain('script')
    expect(sanitized).not.toContain('onclick')
    expect(sanitized).not.toContain('evil.test')
    expect(sanitized).not.toContain('@import')
    expect(sanitized).toContain('#safe')
    expect(sanitized).toContain('fill: red')
  })

  it('keeps inline data images', () => {
    const sanitized = sanitizeSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><image href="data:image/png;base64,AAAA"/></svg>',
    )
    expect(sanitized).toContain('data:image/png;base64,AAAA')
  })

  it('adds a viewBox derived from the dimensions', () => {
    const sanitized = sanitizeSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160"></svg>',
    )
    expect(sanitized).toContain('viewBox="0 0 320 160"')
  })

  it('falls back to a square canvas when dimensions are missing', () => {
    const sanitized = sanitizeSvg('<svg></svg>')
    expect(sanitized).toContain('viewBox="0 0 512 512"')
    expect(sanitized).toContain('width="512"')
  })

  it('rejects malformed documents and non-SVG roots', () => {
    expect(() => sanitizeSvg('<svg><g></svg>')).toThrow(LogoError)
    expect(() => sanitizeSvg('<div>hello</div>')).toThrow(LogoError)
  })
})
