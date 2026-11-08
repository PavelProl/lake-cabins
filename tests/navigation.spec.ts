import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const houseUrl = '/houses/large-log-house'
const houseName = 'Большой бревенчатый дом'

async function expectHouse(page: Page) {
  await expect(page).toHaveURL(new RegExp(`${houseUrl}$`))
  await expect(page.getByRole('heading', { name: houseName, exact: true })).toBeVisible()
  await expect(page.locator('[data-transition-layer]')).toHaveCount(0)
}

async function expectCatalog(page: Page) {
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('link', { name: `Открыть: ${houseName}` })).toBeVisible()
  await expect(page.locator('[data-transition-layer]')).toHaveCount(0)
}

test('opening and return preserve the selected card, scroll and focus', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  const card = page.getByRole('link', { name: `Открыть: ${houseName}` })
  await card.scrollIntoViewIfNeeded()
  const scrollBefore = await page.evaluate(() => scrollY)
  await card.click()
  await expectHouse(page)
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
  await expect(page.getByRole('heading', { name: houseName, exact: true })).toBeFocused()
  await page.getByRole('link', { name: 'Все дома', exact: true }).click()
  await expectCatalog(page)
  await expect
    .poll(async () => Math.abs((await page.evaluate(() => scrollY)) - scrollBefore))
    .toBeLessThan(2)
  await expect(card).toBeFocused()
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe('')
  expect(errors).toEqual([])
})

test('browser Back and Forward preserve working navigation', async ({ page }) => {
  await page.goto('/')
  await page.locator('#house-large-log-house').click()
  await expectHouse(page)
  await page.goBack()
  await expectCatalog(page)
  await page.goForward()
  await expectHouse(page)
})

test('a direct house URL and return work without a preceding catalog visit', async ({ page }) => {
  await page.goto(houseUrl)
  await expectHouse(page)
  await page.getByRole('link', { name: 'Все дома', exact: true }).click()
  await expectCatalog(page)
  await expect(page.locator('#house-large-log-house')).toBeInViewport({ ratio: 0.5 })
})

test('gallery navigates each photo and finishes at the right edge', async ({ page }) => {
  await page.goto(houseUrl)
  const gallery = page.getByRole('region', {
    name: 'Фотографии дома, можно прокручивать по горизонтали',
  })
  const images = gallery.getByRole('img')
  await expect(images).toHaveCount(9)
  await gallery.scrollIntoViewIfNeeded()
  const expectLoadedPhoto = async (index: number) => {
    await expect
      .poll(() =>
        images
          .nth(index)
          .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
      )
      .toBe(true)
  }
  await expectLoadedPhoto(0)
  const leadingGap = await gallery.evaluate(
    (element) =>
      element.firstElementChild!.getBoundingClientRect().left -
      element.getBoundingClientRect().left,
  )
  expect(Math.abs(leadingGap)).toBeLessThan(3)
  const next = page.getByRole('button', { name: 'Следующее фото' })
  const previous = page.getByRole('button', { name: 'Предыдущее фото' })
  const ranges = Array.from({ length: 9 }, (_, i) => `${String(i + 1).padStart(2, '0')} / 09`)
  const counter = page.locator('[aria-live="polite"]')

  await expect(counter).toHaveText(ranges[0])
  await expect(previous).toBeDisabled()
  for (const expected of ranges.slice(1)) {
    const scrolling = gallery.evaluate(
      (el) =>
        new Promise<void>((resolve) => {
          el.addEventListener('scrollend', () => resolve(), { once: true })
        }),
    )
    await next.click()
    await scrolling
    await expect(counter).toHaveText(expected)
    await expectLoadedPhoto(ranges.indexOf(expected))
  }
  await expect(next).toBeDisabled()
  const trailingGap = await gallery.evaluate((element) => {
    const last = element.lastElementChild!
    return element.getBoundingClientRect().right - last.getBoundingClientRect().right
  })
  expect(Math.abs(trailingGap)).toBeLessThan(3)
  await expect(previous).toBeEnabled()
  for (const expected of ranges.slice(0, -1).reverse()) {
    const scrolling = gallery.evaluate(
      (el) =>
        new Promise<void>((resolve) => {
          el.addEventListener('scrollend', () => resolve(), { once: true })
        }),
    )
    await previous.click()
    await scrolling
    await expect(counter).toHaveText(expected)
  }
  await expect(previous).toBeDisabled()
  await expect(next).toBeEnabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('gallery keeps the first photo selected when the viewport changes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(houseUrl)
  const gallery = page.getByRole('region', {
    name: 'Фотографии дома, можно прокручивать по горизонтали',
  })
  const counter = page.locator('[aria-live="polite"]')
  await gallery.scrollIntoViewIfNeeded()
  await expect(counter).toHaveText('01 / 09')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(counter).toHaveText('01 / 09')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(counter).toHaveText('01 / 09')
})

test('reduced motion and keyboard activation remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const card = page.locator('#house-large-log-house')
  await card.focus()
  await page.keyboard.press('Enter')
  await expectHouse(page)
  await expect(page.getByRole('heading', { name: houseName, exact: true })).toBeFocused()
  await page.getByRole('link', { name: 'Все дома', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expectCatalog(page)
  await expect(card).toBeFocused()
})

test('rapid repeat activation does not create duplicate history entries', async ({ page }) => {
  await page.goto('/')
  await page.locator('#house-large-log-house').dblclick({ delay: 30 })
  await expectHouse(page)
  await page.goBack()
  await expectCatalog(page)
})

test('Back during an opening transition restores scroll and focus without a stale callback', async ({
  page,
}) => {
  await page.goto('/')
  const card = page.locator('#house-large-log-house')
  await card.scrollIntoViewIfNeeded()
  const scrollBefore = await page.evaluate(() => scrollY)
  expect(scrollBefore).toBeGreaterThan(0)
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 1000))
  await card.evaluate((element: HTMLAnchorElement) => element.click())
  await expect(page.locator('[data-transition-phase]')).toHaveAttribute(
    'data-transition-phase',
    'opening',
  )
  await page.goBack()
  await expectCatalog(page)
  await expect(card).toBeFocused()
  await expect
    .poll(async () => Math.abs((await page.evaluate(() => scrollY)) - scrollBefore))
    .toBeLessThan(2)
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe('')
  await page.clock.runFor(1500)
  await expectCatalog(page)
  await expect(card).toBeFocused()
  await page.clock.resume()
  await card.click()
  await expectHouse(page)
})

test('resizing during opening leaves a responsive full-screen hero', async ({ page }) => {
  await page.goto('/')
  await page.locator('#house-large-log-house').click()
  await page.setViewportSize({ width: 600, height: 900 })
  await expectHouse(page)
  const rect = await page.locator('[data-house-visual]').boundingBox()
  expect(rect?.y).toBe(0)
  expect(rect?.height).toBe(900)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('an unknown house has a useful route back to the catalog', async ({ page }) => {
  await page.goto('/houses/unknown')
  await expect(page.getByRole('heading', { name: 'Этой страницы пока нет.' })).toBeVisible()
  await page.getByRole('link', { name: 'Вернуться к домам', exact: true }).click()
  await expectCatalog(page)
})

test('return from the house footer restores the catalog scroll and focus', async ({ page }) => {
  await page.goto('/')
  const card = page.locator('#house-large-log-house')
  await card.scrollIntoViewIfNeeded()
  const scrollBefore = await page.evaluate(() => scrollY)
  await card.click()
  await expectHouse(page)
  await page.getByRole('link', { name: 'Вернуться к домам', exact: true }).click()
  await expectCatalog(page)
  await expect(card).toBeFocused()
  await expect
    .poll(async () => Math.abs((await page.evaluate(() => scrollY)) - scrollBefore))
    .toBeLessThan(2)
})

test('Forward during closing cancels the overlay and allows another return', async ({ page }) => {
  await page.goto('/')
  await page.locator('#house-large-log-house').click()
  await expectHouse(page)
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 1000))
  await page.goBack()
  await expect(page.locator('[data-transition-phase]')).toHaveAttribute(
    'data-transition-phase',
    'closing',
  )
  await page.goForward()
  await expectHouse(page)
  await page.clock.runFor(1500)
  await expectHouse(page)
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe('')
  await page.clock.resume()
  await page.getByRole('link', { name: 'Все дома', exact: true }).click()
  await expectCatalog(page)
})

test('enabling reduced motion during opening finishes and cleans up the transition', async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('#house-large-log-house').click()
  await expect(page.locator('[data-transition-phase]')).toHaveAttribute(
    'data-transition-phase',
    'opening',
  )
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expectHouse(page)
  await expect(page.getByRole('heading', { name: houseName, exact: true })).toBeFocused()
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe('')
})
