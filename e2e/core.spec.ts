import { expect, test } from '@playwright/test'
import {
  LOGO_SVG,
  decodePng,
  downloadExport,
  gotoStudio,
  historyCount,
  monitorErrors,
  waitForSaved,
} from './helpers'

test('A — build, verify, export and copy a URL code', async ({ page }) => {
  const errors = monitorErrors(page)
  await gotoStudio(page)

  await expect(page.getByText('0 créations')).toBeVisible()
  await expect(page.locator('.save-indicator')).toHaveCount(0)

  const payload = 'https://example.com/e2e-export?from=studio&lang=fr'
  await page.locator('#url').fill(payload)
  await waitForSaved(page)
  await expect(page.getByText('1 création')).toBeVisible()
  await expect(page.locator('.history-card--current')).toHaveCount(1)
  await expect(page.locator('.payload-value')).toContainText('example.com')

  const png = await downloadExport(page, 'png')
  expect(png.download.suggestedFilename()).toMatch(
    /^qr-url-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.png$/,
  )
  expect(png.buffer.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
  expect(png.buffer.readUInt32BE(16)).toBe(512)
  expect(png.buffer.readUInt32BE(20)).toBe(512)
  await expect.poll(() => decodePng(page, png.buffer)).toBe(payload)

  const svg = await downloadExport(page, 'svg')
  const svgSource = svg.buffer.toString('utf8')
  expect(svg.download.suggestedFilename()).toMatch(/\.svg$/)
  expect(svgSource).toContain('<?xml version="1.0"')
  expect(svgSource).toContain('<svg')
  expect(svgSource).toContain('width="512"')
  expect(svgSource).toMatch(/<(path|rect|circle)/)

  const pdf = await downloadExport(page, 'pdf')
  expect(pdf.download.suggestedFilename()).toMatch(/\.pdf$/)
  expect(pdf.buffer.subarray(0, 5).toString('utf8')).toBe('%PDF-')
  expect(pdf.buffer.length).toBeGreaterThan(20_000)

  await page.locator('#export .export-card').filter({ hasText: 'Copier' }).click()
  await expect(page.locator('.toast-viewport')).toContainText(
    'Image copiée dans le presse-papiers.',
  )
  const clipboardTypes = await page.evaluate(async () => {
    const items = await navigator.clipboard.read()
    return items.flatMap((item) => item.types)
  })
  expect(clipboardTypes).toContain('image/png')

  await page.locator('#url').fill('')
  await expect(page.locator('#export .export-card').first()).toBeDisabled()
  await expect(page.locator('.export-warning')).toContainText(
    'Renseignez un contenu valide pour exporter.',
  )

  expect(errors).toEqual([])
})

test('B — UTF-8 WiFi, logo limits and local history round-trip', async ({ page }) => {
  const errors = monitorErrors(page)
  await gotoStudio(page)

  await page.locator('.type-option').filter({ hasText: 'WiFi' }).click()
  const ssid = 'Café de l’Atelier'
  const password = 'S3cret;é'
  await page.locator('#ssid').fill(ssid)
  await page.locator('#password').fill(password)
  await waitForSaved(page)
  expect(await historyCount(page)).toBe(1)

  const firstPng = await downloadExport(page, 'png')
  const expectedWifi = 'WIFI:T:WPA;S:Café de l’Atelier;P:S3cret\\;é;H:false;;'
  await expect.poll(() => decodePng(page, firstPng.buffer)).toBe(expectedWifi)

  await page.locator('input[type=file]').setInputFiles({
    name: 'atelier.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(LOGO_SVG, 'utf8'),
  })
  await expect(page.locator('.preview-logo-note')).toBeVisible({
    timeout: 20_000,
  })
  await expect(page.locator('.correction-control .range-value')).toHaveText('H')
  await expect(page.locator('.toast-viewport')).toContainText(
    'Logo ajouté. Correction H activée automatiquement.',
  )
  await waitForSaved(page)

  const logoRange = page.locator('#logo-size')
  await logoRange.focus()
  await logoRange.press('End')
  await page.waitForTimeout(600)
  await expect(page.locator('.warning-list')).toContainText(
    'Le logo dépasse 20 % de la surface du QR code.',
  )
  await expect(page.locator('.status-badge')).not.toHaveText('Scannable')

  await page.getByRole('button', { name: 'Réduire le logo' }).click()
  await expect(page.locator('.preview-logo-note')).toContainText('9 %')
  await expect(page.locator('.status-badge')).toHaveText('Scannable', {
    timeout: 20_000,
  })

  const logosPng = await downloadExport(page, 'png')
  await expect.poll(() => decodePng(page, logosPng.buffer)).toBe(expectedWifi)

  await expect(page.locator('.history-card--current')).toHaveCount(1)
  await expect(page.locator('.history-title').first()).toHaveText(ssid)
  await waitForSaved(page)

  await page.getByRole('button', { name: /Nouveau code/ }).click()
  await expect(page.locator('#ssid')).toHaveValue('')
  await expect(page.locator('.save-indicator')).toHaveCount(0)
  expect(await historyCount(page)).toBe(1)

  const secondSsid = 'Studio Bis'
  await page.locator('#ssid').fill(secondSsid)
  await page.locator('#password').fill('mot-de-passe')
  await waitForSaved(page)
  expect(await historyCount(page)).toBe(2)
  await expect(page.locator('.history-title')).toHaveText([secondSsid, ssid])

  await page
    .locator('.history-card')
    .nth(1)
    .getByRole('button', { name: /Modifier ce QR code/ })
    .click()
  await expect(page.locator('#ssid')).toHaveValue(ssid)
  await expect(
    page.locator('img[alt="Logo utilisé au centre du QR code"]'),
  ).toHaveCount(1)
  await expect(page.locator('.status-badge')).toHaveText('Scannable', {
    timeout: 20_000,
  })
  await expect(page.locator('.save-indicator')).toContainText('Enregistré localement')
  expect(await historyCount(page)).toBe(2)

  await page
    .locator('.history-card--current')
    .getByRole('button', { name: /Supprimer/ })
    .click()
  await expect(page.locator('.toast-viewport')).toContainText('Entrée supprimée.')
  expect(await historyCount(page)).toBe(1)
  await expect(page.locator('.save-indicator')).toHaveCount(0)

  await page.getByRole('button', { name: 'Tout effacer' }).click()
  await expect(page.getByRole('dialog')).toContainText('Effacer tout l’historique ?')
  await page.getByRole('button', { name: 'Effacer définitivement' }).click()
  await expect(page.locator('.history-empty-title')).toHaveText(
    'Rien ici pour l’instant',
  )
  expect(await historyCount(page)).toBe(0)
  await expect(page.locator('.save-indicator')).toHaveCount(0)

  expect(errors).toEqual([])
})
