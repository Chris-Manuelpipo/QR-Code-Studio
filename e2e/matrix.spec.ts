import { expect, test, type Page } from '@playwright/test'
import { gotoStudio } from './helpers'

interface MatrixConfig {
  label: string
  dot: string
  cornerSquare: string
  cornerDot: string
  mode: 'Uni' | 'Linéaire' | 'Radial'
  primary: string
  secondary?: string
  size: 128 | 256 | 512 | 1024 | 2048
  margin: number
  ec: 'L' | 'M' | 'Q' | 'H'
}

const CONFIGS: MatrixConfig[] = [
  {
    label: 'square · solid · 512',
    dot: 'Carrés',
    cornerSquare: 'Carré',
    cornerDot: 'Carré',
    mode: 'Uni',
    primary: '#171714',
    size: 512,
    margin: 4,
    ec: 'M',
  },
  {
    label: 'rounded · solid · 512',
    dot: 'Arrondis',
    cornerSquare: 'Carré',
    cornerDot: 'Carré',
    mode: 'Uni',
    primary: '#171714',
    size: 512,
    margin: 4,
    ec: 'M',
  },
  {
    label: 'dots · solid · 512',
    dot: 'Points',
    cornerSquare: 'Carré',
    cornerDot: 'Carré',
    mode: 'Uni',
    primary: '#171714',
    size: 512,
    margin: 4,
    ec: 'M',
  },
  {
    label: 'classy · solid · 512',
    dot: 'Classy',
    cornerSquare: 'Carré',
    cornerDot: 'Carré',
    mode: 'Uni',
    primary: '#171714',
    size: 512,
    margin: 4,
    ec: 'M',
  },
  {
    label: 'classy-rounded · solid · 512',
    dot: 'Classy arrondi',
    cornerSquare: 'Carré',
    cornerDot: 'Carré',
    mode: 'Uni',
    primary: '#171714',
    size: 512,
    margin: 4,
    ec: 'M',
  },
  {
    label: 'extra-rounded · solid · 512',
    dot: 'Très arrondis',
    cornerSquare: 'Carré',
    cornerDot: 'Carré',
    mode: 'Uni',
    primary: '#171714',
    size: 512,
    margin: 4,
    ec: 'M',
  },
  {
    label: 'rounded · linear · rounded corners',
    dot: 'Arrondis',
    cornerSquare: 'Arrondi',
    cornerDot: 'Point',
    mode: 'Linéaire',
    primary: '#171714',
    secondary: '#3d4a26',
    size: 512,
    margin: 4,
    ec: 'M',
  },
  {
    label: 'dots · radial · dot corners',
    dot: 'Points',
    cornerSquare: 'Point',
    cornerDot: 'Point',
    mode: 'Radial',
    primary: '#1c2d3a',
    secondary: '#4a2c1c',
    size: 512,
    margin: 4,
    ec: 'M',
  },
  {
    label: 'classy · linear · dot outer corner',
    dot: 'Classy',
    cornerSquare: 'Point',
    cornerDot: 'Carré',
    mode: 'Linéaire',
    primary: '#17324d',
    secondary: '#2f4a34',
    size: 512,
    margin: 4,
    ec: 'M',
  },
  {
    label: 'classy-rounded · radial · rounded outer corner',
    dot: 'Classy arrondi',
    cornerSquare: 'Arrondi',
    cornerDot: 'Point',
    mode: 'Radial',
    primary: '#2d1f3a',
    secondary: '#4a2a1c',
    size: 512,
    margin: 4,
    ec: 'M',
  },
  {
    label: 'extra-rounded · linear · dot outer corner',
    dot: 'Très arrondis',
    cornerSquare: 'Point',
    cornerDot: 'Carré',
    mode: 'Linéaire',
    primary: '#203a2b',
    secondary: '#1c2a44',
    size: 512,
    margin: 4,
    ec: 'M',
  },
  {
    label: 'square · radial · rounded outer corner',
    dot: 'Carrés',
    cornerSquare: 'Arrondi',
    cornerDot: 'Point',
    mode: 'Radial',
    primary: '#3a1f1f',
    secondary: '#1f2a3a',
    size: 512,
    margin: 4,
    ec: 'M',
  },
  {
    label: 'dots · solid · 256',
    dot: 'Points',
    cornerSquare: 'Point',
    cornerDot: 'Point',
    mode: 'Uni',
    primary: '#171714',
    size: 256,
    margin: 4,
    ec: 'M',
  },
  {
    label: 'classy · solid · 1024',
    dot: 'Classy',
    cornerSquare: 'Point',
    cornerDot: 'Carré',
    mode: 'Uni',
    primary: '#171714',
    size: 1024,
    margin: 4,
    ec: 'M',
  },
  {
    label: 'extra-rounded · solid · margin 6',
    dot: 'Très arrondis',
    cornerSquare: 'Arrondi',
    cornerDot: 'Point',
    mode: 'Uni',
    primary: '#171714',
    size: 512,
    margin: 6,
    ec: 'M',
  },
  {
    label: 'rounded · solid · margin 8',
    dot: 'Arrondis',
    cornerSquare: 'Point',
    cornerDot: 'Carré',
    mode: 'Uni',
    primary: '#171714',
    size: 512,
    margin: 8,
    ec: 'M',
  },
  {
    label: 'classy-rounded · solid · 128',
    dot: 'Classy arrondi',
    cornerSquare: 'Arrondi',
    cornerDot: 'Point',
    mode: 'Uni',
    primary: '#171714',
    size: 128,
    margin: 4,
    ec: 'M',
  },
  {
    label: 'square · solid · 1024 · Q',
    dot: 'Carrés',
    cornerSquare: 'Carré',
    cornerDot: 'Carré',
    mode: 'Uni',
    primary: '#171714',
    size: 1024,
    margin: 4,
    ec: 'Q',
  },
  {
    label: 'rounded · solid · H',
    dot: 'Arrondis',
    cornerSquare: 'Arrondi',
    cornerDot: 'Point',
    mode: 'Uni',
    primary: '#171714',
    size: 512,
    margin: 4,
    ec: 'H',
  },
  {
    label: 'extra-rounded · solid · dot corners',
    dot: 'Très arrondis',
    cornerSquare: 'Point',
    cornerDot: 'Point',
    mode: 'Uni',
    primary: '#171714',
    size: 512,
    margin: 4,
    ec: 'M',
  },
]

async function setRangeValue(
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

async function applyConfig(page: Page, config: MatrixConfig): Promise<void> {
  await page
    .locator('#style .size-chip')
    .filter({ hasText: String(config.size) })
    .click()

  await setRangeValue(page, '#margin', config.margin)

  await page
    .getByRole('group', { name: 'Couleurs', exact: true })
    .getByRole('button', { name: config.mode, exact: true })
    .click()

  const primary = page.locator('#dot-color-hex')
  await primary.fill(config.primary)
  await primary.press('Enter')

  if (config.secondary) {
    const secondary = page.locator('#dot-color-2-hex')
    await expect(secondary).toBeVisible()
    await secondary.fill(config.secondary)
    await secondary.press('Enter')
  }

  await page
    .getByRole('group', { name: 'Forme des points' })
    .getByRole('button', { name: config.dot, exact: true })
    .click()
  await page
    .getByRole('group', { name: 'Coin extérieur' })
    .getByRole('button', { name: config.cornerSquare, exact: true })
    .click()
  await page
    .getByRole('group', { name: 'Cœur du coin' })
    .getByRole('button', { name: config.cornerDot, exact: true })
    .click()
  await page
    .getByRole('group', { name: 'Correction' })
    .getByRole('button', { name: config.ec, exact: true })
    .click()
}

test('E — 20 styled configurations remain scannable', async ({ page }) => {
  test.setTimeout(600_000)
  await gotoStudio(page)

  for (const config of CONFIGS) {
    await test.step(config.label, async () => {
      const previousCheck = await page
        .locator('.checks')
        .getAttribute('data-checked-at')
      await applyConfig(page, config)
      await expect
        .poll(() => page.locator('.checks').getAttribute('data-checked-at'), {
          timeout: 30_000,
        })
        .not.toBe(previousCheck)
      await expect(page.locator('.status-badge')).toHaveText('Scannable', {
        timeout: 30_000,
      })
      await expect(page.locator('.checks')).toContainText('Décodage conforme')
      await expect(page.locator('.warning-list')).toHaveCount(0)
      await expect(page.locator('.checks')).toContainText(
        `Marge de ${config.margin} modules`,
      )
      await expect(page.locator('.correction-control .range-value')).toHaveText(
        config.ec,
      )
    })
  }
})
