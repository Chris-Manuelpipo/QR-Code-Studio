import { expect, test } from '@playwright/test'
import { gotoStudio, historyCount, monitorErrors, waitForSaved } from './helpers'

test('C — language, theme, dialogs and mobile reflow', async ({ page }) => {
  const errors = monitorErrors(page)
  await gotoStudio(page)

  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page.locator('h1').first()).toContainText('Un code. Huit usages.')

  await page.locator('.lang-button').click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('h1').first()).toContainText('One code. Eight uses.')
  await expect(page.locator('#content')).toContainText('Content type')
  await expect(page.locator('#export')).toContainText('Export')
  await expect(page.locator('#history')).toContainText('Stored locally')

  await page.locator('.lang-button').click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page.locator('h1').first()).toContainText('Un code. Huit usages.')

  await page.getByRole('button', { name: 'Changer de thème' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('button', { name: 'Changer de thème' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

  const helpButton = page.locator('header').getByRole('button', { name: 'Aide' })
  await helpButton.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('Aide & bonnes pratiques')
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(helpButton).toBeFocused()

  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.waitForTimeout(300)
    const layout = await page.evaluate(() => {
      const top = (selector: string) =>
        document.querySelector(selector)?.getBoundingClientRect().top ?? 0
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        content: top('#content'),
        preview: top('#preview'),
        style: top('#style'),
        export: top('#export'),
        headerWidth: document.querySelector('header')?.scrollWidth ?? 0,
      }
    })
    expect(layout.scrollWidth, `overflow at ${width}px`).toBeLessThanOrEqual(
      layout.clientWidth,
    )
    expect(layout.headerWidth).toBeLessThanOrEqual(layout.clientWidth)
    expect(layout.content).toBeLessThan(layout.preview)
    expect(layout.preview).toBeLessThan(layout.style)
    expect(layout.style).toBeLessThan(layout.export)
  }

  expect(errors).toEqual([])
})

test('C — private mode pauses history, then resumes autosave', async ({ page }) => {
  const errors = monitorErrors(page)
  await gotoStudio(page)

  await page.locator('header').getByRole('button', { name: 'Réglages' }).click()
  await page.locator('#private-mode').check()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.save-indicator--private')).toContainText(
    'Mode privé actif',
  )
  await expect(page.locator('.history-private')).toContainText(
    'l’historique est en pause',
  )

  await page.locator('#url').fill('https://example.com/private-session')
  await page.waitForTimeout(2_000)
  expect(await historyCount(page)).toBe(0)
  await expect(page.locator('.save-indicator')).toContainText('Mode privé actif')

  await page.locator('header').getByRole('button', { name: 'Réglages' }).click()
  await page.locator('#private-mode').uncheck()
  await page.keyboard.press('Escape')
  await waitForSaved(page)
  expect(await historyCount(page)).toBe(1)
  await expect(page.locator('.history-title').first()).toHaveText(
    'https://example.com/private-session',
  )

  expect(errors).toEqual([])
})
