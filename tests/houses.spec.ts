import { expect, test } from '@playwright/test'

const cases = [
  { id: 'large-log-house', name: 'Усадьба Парная', count: 9, folder: 'large-house' },
  { id: 'medium-house', name: 'Лад', count: 19, folder: 'medium-house' },
  { id: 'small-house', name: 'Тишь и Гладь', count: 14, folder: 'small-house' },
]

for (const house of cases) {
  test(`${house.id}: selected card opens its own gallery and restores scroll and focus`, async ({
    page,
  }) => {
    await page.clock.install()
    await page.goto('/')
    await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
    const card = page.locator(`#house-${house.id}`)
    await card.scrollIntoViewIfNeeded()
    const scroll = await page.evaluate(() => scrollY)
    const source = (await card.locator('[data-house-visual]').boundingBox())!
    const cover = await card.getByRole('img').getAttribute('src')
    await page.clock.pauseAt(new Date(Date.now() + 1000))
    await card.evaluate((link: HTMLAnchorElement) => link.click())
    const layer = page.locator('[data-transition-layer]')
    await expect(layer).toBeVisible()
    await expect(layer.getByRole('img', { includeHidden: true })).toHaveAttribute('src', cover!)
    const animated = (await layer.locator('[data-house-visual]').boundingBox())!
    for (const key of ['x', 'y', 'width', 'height'] as const)
      expect(Math.abs(animated[key] - source[key])).toBeLessThan(3)
    await page.clock.resume()
    await expect(page).toHaveURL(new RegExp(`/houses/${house.id}$`))
    await expect(page.getByRole('heading', { name: house.name, exact: true })).toBeFocused()
    await expect(layer).toHaveCount(0)
    await expect(page).toHaveTitle(`${house.name} — Роща · домики у озера`)

    const photos = page.getByRole('button', { name: /^Открыть фото:/ })
    await expect(photos).toHaveCount(house.count)
    for (const photo of await photos.all()) {
      await photo.scrollIntoViewIfNeeded()
      const image = photo.getByRole('img')
      await expect(image).toHaveAttribute('src', new RegExp(`/assets/${house.folder}/`))
      await expect
        .poll(() =>
          image.evaluate((img: HTMLImageElement) => {
            const rect = img.getBoundingClientRect()
            return (
              img.complete &&
              img.naturalWidth === Number(img.getAttribute('width')) &&
              img.naturalHeight === Number(img.getAttribute('height')) &&
              Math.abs(rect.width / rect.height - img.naturalWidth / img.naturalHeight) < 0.01
            )
          }),
        )
        .toBe(true)
    }
    await photos.last().click()
    const viewer = page.getByRole('dialog', { name: 'Просмотр фотографий дома' })
    await expect(viewer).toHaveAttribute('aria-busy', 'false')
    const count = String(house.count).padStart(2, '0')
    await expect(viewer.locator('[aria-live]')).toContainText(`${count} / ${count}`)
    await expect(viewer.getByRole('button', { name: 'Следующая фотография' })).toBeDisabled()
    await page.keyboard.press('Escape')
    await expect(viewer).toHaveCount(0)
    await expect(photos.last()).toBeFocused()
    await page.goBack()
    await expect(card).toBeFocused()
    await expect
      .poll(async () => Math.abs((await page.evaluate(() => scrollY)) - scroll))
      .toBeLessThan(2)
  })

  test(`${house.id}: direct link returns to its corresponding card`, async ({ page }) => {
    await page.goto(`/houses/${house.id}`)
    await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: house.name, exact: true })).toBeVisible()
    await page.getByRole('link', { name: 'Все дома', exact: true }).click()
    const card = page.locator(`#house-${house.id}`)
    await expect(card).toBeFocused()
    await expect(card).toBeInViewport({ ratio: 0.5 })
    await expect(page.locator('[data-transition-layer]')).toHaveCount(0)
    await page.goBack()
    await expect(page.getByRole('heading', { name: house.name, exact: true })).toBeVisible()
  })
}
