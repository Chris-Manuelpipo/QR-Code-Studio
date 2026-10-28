import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { gotoStudio } from './helpers'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

async function expectNoViolations(page: Page, label: string): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  const violations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target.join(' ')).slice(0, 4),
  }))
  expect(violations, `${label} accessibility violations`).toEqual([])
}

test('D — WCAG 2.1 AA in both themes, dialogs and at 320 px', async ({ page }) => {
  await gotoStudio(page)
  await expectNoViolations(page, 'light theme')

  await page.getByRole('button', { name: 'Changer de thème' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expectNoViolations(page, 'dark theme')

  await page.locator('header').getByRole('button', { name: 'Aide' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expectNoViolations(page, 'help dialog')
  await page.keyboard.press('Escape')

  await page.locator('header').getByRole('button', { name: 'Réglages' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expectNoViolations(page, 'settings dialog')
  await page.keyboard.press('Escape')

  await page.locator('.lang-button').click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expectNoViolations(page, 'English interface')

  await page.setViewportSize({ width: 320, height: 900 })
  await page.waitForTimeout(300)
  await expectNoViolations(page, '320 px layout')

  await page.locator('.lang-button').click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await page.getByRole('button', { name: 'Changer de thème' }).click()
  await expectNoViolations(page, 'French light theme after switching back')
})
