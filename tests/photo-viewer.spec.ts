import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const houseUrl = '/houses/large-log-house'
const photoButtons = (page: Page) => page.getByRole('button', { name: /^Открыть фото:/ })
const viewer = (page: Page) => page.getByRole('dialog', { name: 'Просмотр фотографий дома' })

async function openPhoto(page: Page, index = 0) {
  await page.goto(houseUrl)
  const button = photoButtons(page).nth(index)
  await button.scrollIntoViewIfNeeded()
  await expect
    .poll(() =>
      button
        .locator('img')
        .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
    )
    .toBe(true)
  const scroll = await page.evaluate(() => scrollY)
  await button.click()
  await expect(viewer(page)).toBeVisible()
  await expect(viewer(page)).toHaveAttribute('aria-busy', 'false')
  return scroll
}

async function expectFitted(page: Page) {
  await expect
    .poll(async () => {
      return viewer(page)
        .getByRole('img')
        .evaluate((img: HTMLImageElement) => {
          const rect = img.getBoundingClientRect()
          return (
            Math.abs(rect.width / rect.height - img.naturalWidth / img.naturalHeight) < 0.005 &&
            rect.x >= 0 &&
            rect.y >= 0 &&
            rect.right <= innerWidth &&
            rect.bottom <= innerHeight
          )
        })
    })
    .toBe(true)
}

test('photo opens by keyboard, traps focus, locks the background and restores scroll', async ({
  page,
}) => {
  await page.goto(houseUrl)
  const photo = photoButtons(page).first()
  await photo.scrollIntoViewIfNeeded()
  await photo.focus()
  const scroll = await page.evaluate(() => scrollY)
  const history = await page.evaluate(() => window.history.length)
  await page.keyboard.press('Enter')
  const modal = viewer(page)
  const close = modal.getByRole('button', { name: 'Закрыть просмотр' })
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(
    modal.getByRole('button', { name: 'Следующая фотография', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.mouse.wheel(0, 600)
  await expect.poll(() => page.evaluate(() => document.body.style.position)).toBe('fixed')
  await expectFitted(page)
  await expect(page).toHaveURL(new RegExp(`${houseUrl}$`))
  expect(await page.evaluate(() => window.history.length)).toBe(history)
  await page.keyboard.press('Escape')
  await expect(modal).toHaveCount(0)
  await expect(photo).toBeFocused()
  expect(Math.abs((await page.evaluate(() => scrollY)) - scroll)).toBeLessThan(2)
  expect(await page.evaluate(() => document.body.style.position)).toBe('')
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
})

test('buttons and keyboard navigate to both edges and close onto the current photo', async ({
  page,
}) => {
  const scroll = await openPhoto(page)
  const modal = viewer(page)
  const previous = modal.getByRole('button', { name: 'Предыдущая фотография', exact: true })
  const next = modal.getByRole('button', { name: 'Следующая фотография', exact: true })
  await expect(previous).toBeDisabled()
  await expectFitted(page)
  await expect(modal).toHaveAttribute('aria-busy', 'false')
  for (let index = 1; index < 9; index++) {
    await expect(next).toBeEnabled()
    await next.click()
    await expect(modal.locator('[aria-live]')).toContainText(`0${index + 1} / 09`)
    await expectFitted(page)
    // Wait for the incoming image to finish fading before requesting another change.
    await expect(modal.getByRole('img')).toHaveCSS('opacity', '1')
  }
  await expect(next).toBeDisabled()
  await page.keyboard.press('ArrowRight')
  await expect(modal.locator('[aria-live]')).toContainText('09 / 09')
  await page.keyboard.press('ArrowLeft')
  await expect(modal.locator('[aria-live]')).toContainText('08 / 09')
  await expect(modal.getByRole('img')).toHaveCSS('opacity', '1')
  await modal.getByRole('button', { name: 'Закрыть просмотр' }).click()
  await expect(modal).toHaveCount(0)
  await expect(photoButtons(page).nth(7)).toBeFocused()
  await expect(photoButtons(page).nth(7)).toBeInViewport()
  expect(Math.abs((await page.evaluate(() => scrollY)) - scroll)).toBeLessThan(2)
})

test('opening and closing animate from and to the actual photo without changing its source', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto(houseUrl)
  const button = photoButtons(page).first()
  await button.scrollIntoViewIfNeeded()
  await expect
    .poll(() =>
      button
        .locator('img')
        .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
    )
    .toBe(true)
  const original = await button.locator('img').boundingBox()
  const source = await button.locator('img').getAttribute('src')
  await page.clock.pauseAt(new Date(Date.now() + 1000))
  await button.evaluate((element: HTMLButtonElement) => element.click())
  const image = viewer(page).getByRole('img')
  await expect(image).toHaveAttribute('src', source!)
  const start = await image.boundingBox()
  expect(Math.abs(start!.width - original!.width)).toBeLessThan(2)
  expect(Math.abs(start!.y - original!.y)).toBeLessThan(2)
  await page.clock.runFor(250)
  const middle = await image.boundingBox()
  expect(middle!.height).toBeGreaterThan(original!.height)
  await page.clock.runFor(400)
  await expectFitted(page)
  await viewer(page)
    .getByRole('button', { name: 'Закрыть просмотр' })
    .evaluate((element: HTMLButtonElement) => element.click())
  await page.clock.runFor(220)
  expect((await image.boundingBox())!.height).toBeGreaterThan(original!.height)
  await page.clock.runFor(400)
  await expect(viewer(page)).toHaveCount(0)
  await expect(button).toBeFocused()
})

test('Escape during opening and repeated actions leave no locked page', async ({ page }) => {
  await page.clock.install()
  await page.goto(houseUrl)
  await photoButtons(page).first().scrollIntoViewIfNeeded()
  await page.clock.pauseAt(new Date(Date.now() + 1000))
  await photoButtons(page)
    .first()
    .evaluate((element: HTMLButtonElement) => element.click())
  await page.keyboard.press('Escape')
  await page.keyboard.press('Escape')
  await page.clock.runFor(1000)
  await expect(viewer(page)).toHaveCount(0)
  expect(await page.evaluate(() => document.body.style.position)).toBe('')
  await page.clock.resume()
  await photoButtons(page).first().click()
  await expectFitted(page)
  await viewer(page).getByRole('button', { name: 'Закрыть просмотр' }).click()
  await expect(viewer(page)).toHaveCount(0)
})

test('resizing and enabling reduced motion settle opening and closing transitions', async ({
  page,
}) => {
  await openPhoto(page)
  await page.setViewportSize({ width: 600, height: 600 })
  await expectFitted(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.keyboard.press('ArrowRight')
  await expect(viewer(page).locator('[aria-live]')).toContainText('02 / 09')
  await expectFitted(page)
  await page.keyboard.press('Escape')
  await expect(viewer(page)).toHaveCount(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await photoButtons(page).nth(1).click()
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(viewer(page)).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
})

test('horizontal swipe changes the photo; vertical gestures do not', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openPhoto(page)
  const session = await page.context().newCDPSession(page)
  const swipe = async (dx: number, dy: number) => {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: 200, y: 300 }],
    })
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: 200 + dx, y: 300 + dy }],
    })
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }
  await swipe(-100, 8)
  await expect(viewer(page).locator('[aria-live]')).toContainText('02 / 09')
  await swipe(4, 120)
  await expect(viewer(page).locator('[aria-live]')).toContainText('02 / 09')
  await swipe(100, -5)
  await expect(viewer(page).locator('[aria-live]')).toContainText('01 / 09')
  await page.keyboard.press('Escape')
  await expect(viewer(page)).toHaveCount(0)
})

test('route navigation while viewing removes the modal and restores page styles', async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('#house-large-log-house').click()
  await expect(
    page.getByRole('heading', { name: 'Большой бревенчатый дом', exact: true }),
  ).toBeVisible()
  await photoButtons(page).first().scrollIntoViewIfNeeded()
  await photoButtons(page).first().click()
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
  await expect(viewer(page)).toHaveCount(0)
  await expect(page.locator('[data-transition-layer]')).toHaveCount(0)
  expect(await page.evaluate(() => document.body.style.position)).toBe('')
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
})

test('a landscape photo fits without cropping in the same viewer', async ({ page }) => {
  await page.goto('/houses/medium-house')
  const photo = photoButtons(page).first()
  await photo.scrollIntoViewIfNeeded()
  await photo.click()
  await expect(viewer(page)).toHaveAttribute('aria-busy', 'false')
  await expect
    .poll(() =>
      viewer(page)
        .getByRole('img')
        .evaluate((image: HTMLImageElement) => image.naturalWidth > image.naturalHeight),
    )
    .toBe(true)
  await expectFitted(page)
  const box = (await viewer(page).getByRole('img').boundingBox())!
  expect(box.width).toBeGreaterThan(box.height)
  await page.keyboard.press('Escape')
  await expect(viewer(page)).toHaveCount(0)
})

test('reduced motion during a photo change completes the requested selection', async ({ page }) => {
  await page.clock.install()
  await openPhoto(page)
  await page.clock.pauseAt(new Date(Date.now() + 1000))
  await page.keyboard.press('ArrowRight')
  const modal = viewer(page)
  // Stop in the outgoing fade, before the caption and image source change.
  await expect
    .poll(async () => {
      await page.clock.runFor(16)
      return Number(
        await modal.getByRole('img').evaluate((image) => getComputedStyle(image).opacity),
      )
    })
    .toBeLessThan(0.99)
  await expect(modal.locator('[aria-live]')).toContainText('01 / 09')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.clock.runFor(32)
  await expect(modal).toHaveAttribute('aria-busy', 'false')
  await expect(modal.locator('[aria-live]')).toContainText('02 / 09')
  await expectFitted(page)
  await page.keyboard.press('Escape')
  await page.clock.runFor(32)
  await expect(modal).toHaveCount(0)
  expect(await page.evaluate(() => document.body.style.position)).toBe('')
})

test('photo and controls stay within the visible mobile viewport after page zoom', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Page scale is exercised in mobile emulation')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(houseUrl)
  await photoButtons(page).first().scrollIntoViewIfNeeded()
  const session = await page.context().newCDPSession(page)
  await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1.5 })
  await expect.poll(() => page.evaluate(() => visualViewport!.scale)).toBeCloseTo(1.5)
  await photoButtons(page).first().click()
  await expect(viewer(page)).toHaveAttribute('aria-busy', 'false')
  const expectVisible = async () => {
    await expect
      .poll(() =>
        viewer(page).evaluate((modal) => {
          const viewport = window.visualViewport!
          return Array.from(modal.querySelectorAll('img, button, [aria-live]')).map((element) => {
            const box = element.getBoundingClientRect()
            return (
              box.bottom <= viewport.offsetTop + viewport.height + 1 &&
              box.top >= viewport.offsetTop - 1 &&
              box.left >= viewport.offsetLeft - 1 &&
              box.right <= viewport.offsetLeft + viewport.width + 1
            )
          })
        }),
      )
      .toEqual([true, true, true, true, true])
  }
  await expectVisible()
  // Zooming an already open viewer must update the photo and its controls as well.
  await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 })
  await expect.poll(() => page.evaluate(() => visualViewport!.scale)).toBeCloseTo(2)
  await expectVisible()
  await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 })
  await expect.poll(() => page.evaluate(() => visualViewport!.scale)).toBeCloseTo(1)
  await expectVisible()
  await page.keyboard.press('Escape')
  await expect(viewer(page)).toHaveCount(0)
})
