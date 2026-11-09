import { expect, test } from '@playwright/test'

test('concept label stays within a short landscape viewport', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto('/')
  await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
  const hero = page.getByRole('region', { name: 'Неспешные дни у озера.' })
  await expect(hero.getByText('Концепция · сгенерированное изображение')).toBeInViewport({
    ratio: 1,
  })
  await expect
    .poll(() => hero.getByRole('img').evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
