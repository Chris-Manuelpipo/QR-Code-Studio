import { expect, type Download, type Page } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'

export const DOWNLOADS = {
  png: 'PNG',
  svg: 'SVG',
  pdf: 'PDF A4',
} as const

export function monitorErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(`console: ${message.text()} (${message.location().url || 'unknown'})`)
    }
  })
  page.on('pageerror', (error) => {
    errors.push(`pageerror: ${error.message}`)
  })
  page.on('requestfailed', (request) => {
    const failure = request.failure()?.errorText
    if (failure && !failure.includes('ERR_ABORTED')) {
      errors.push(`requestfailed: ${request.url()} (${failure})`)
    }
  })
  return errors
}

export async function waitForScan(
  page: Page,
  status: 'Scannable' | 'Attention' | 'Non scannable' = 'Scannable',
): Promise<void> {
  await page.waitForTimeout(320)
  await expect(page.locator('.status-badge')).toHaveText(status, {
    timeout: 20_000,
  })
}

export async function gotoStudio(
  page: Page,
  status: 'Scannable' | 'Attention' | 'Non scannable' = 'Scannable',
): Promise<void> {
  await page.goto('/')
  await waitForScan(page, status)
}

export async function waitForSaved(page: Page): Promise<void> {
  await expect(
    page.locator('.save-indicator').filter({ hasText: 'Enregistré localement' }),
  ).toBeVisible({ timeout: 15_000 })
}

export async function downloadExport(
  page: Page,
  name: keyof typeof DOWNLOADS,
): Promise<{ download: Download; buffer: Buffer }> {
  const pending = page.waitForEvent('download', { timeout: 30_000 })
  await page
    .locator('#export .export-card')
    .filter({ hasText: DOWNLOADS[name] })
    .click()
  const download = await pending
  const filePath = await download.path()
  if (!filePath) throw new Error(`No download path for ${name}`)
  return { download, buffer: await fs.readFile(filePath) }
}

export async function decodePng(page: Page, buffer: Buffer): Promise<string | null> {
  await page.addScriptTag({
    path: path.resolve(process.cwd(), 'node_modules/jsqr/dist/jsQR.js'),
  })
  return page.evaluate(async (base64) => {
    const library = (
      window as unknown as {
        jsQR: (
          data: Uint8ClampedArray,
          width: number,
          height: number,
        ) => { data: string } | null
      }
    ).jsQR
    const image = new Image()
    image.src = `data:image/png;base64,${base64}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) return null
    context.drawImage(image, 0, 0)
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
    return library(pixels.data, canvas.width, canvas.height)?.data ?? null
  }, buffer.toString('base64'))
}

export async function setRange(
  page: Page,
  selector: string,
  value: number,
): Promise<void> {
  const range = page.locator(selector)
  await range.focus()
  await range.press('Home')
  const minimum = Number(await range.getAttribute('min'))
  const step = Number((await range.getAttribute('step')) ?? '1')
  const steps = Math.round((value - minimum) / step)
  for (let index = 0; index < steps; index += 1) {
    await range.press('ArrowRight')
  }
}

export async function historyCount(page: Page): Promise<number> {
  return page.locator('.history-card').count()
}

export const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#e85d2a"/>
  <path d="M20 22h11v11H20zM33 31h11v11H33z" fill="#fff6ec"/>
</svg>`
