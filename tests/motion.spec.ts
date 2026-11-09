import { expect, test } from '@playwright/test'

test('amenities cover the viewport throughout the full ribbon cycle', async ({ page }) => {
  for (const width of [1440, 2560, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/houses/medium-house', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
    const ribbon = page.getByLabel(/^Удобства: Wi-Fi/)
    for (const progress of [0, 0.5, 0.9999, 1.0001]) {
      const covered = await ribbon.evaluate(async (element, fraction) => {
        const track = element.firstElementChild!
        const animation = track.getAnimations()[0]
        animation.pause()
        const duration = Number(animation.effect!.getTiming().duration)
        animation.currentTime = duration * fraction
        await new Promise(requestAnimationFrame)
        const viewport = element.getBoundingClientRect()
        const groups = [...track.children].map((group) => group.getBoundingClientRect())
        return (
          groups[0].left <= viewport.left + 1 &&
          groups[1].right >= viewport.right - 1 &&
          groups[0].width >= viewport.width
        )
      }, progress)
      expect(covered).toBe(true)
    }
  }
})

test('house copy rises into place and the footer never stays hidden', async ({ page }) => {
  await page.goto('/houses/medium-house', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
  const copy = page.locator('#about-house p[data-reveal]').nth(1)
  await expect(copy).toHaveCSS('opacity', '0')
  await copy.scrollIntoViewIfNeeded()
  await expect(copy).toHaveCSS('opacity', '1')
  await expect
    .poll(() => copy.evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).m42))
    .toBe(0)
  const footer = page.getByRole('contentinfo')
  await footer.scrollIntoViewIfNeeded()
  for (const group of await footer.locator('[data-reveal]').all())
    await expect(group).toHaveCSS('opacity', '1')
  await page.screenshot({ path: '/private/tmp/lake-cabins-browser/revealed-footer.png' })
})

test('reduced motion keeps text and ribbon readable without animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/houses/medium-house', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
  await expect(page.locator('#about-house p[data-reveal]').nth(1)).toHaveCSS('opacity', '1')
  const ribbon = page.getByLabel(/^Удобства: Wi-Fi/)
  await expect(ribbon.locator('div').first()).toHaveCSS('animation-name', 'none')
  await expect(page.getByRole('contentinfo').locator('[data-reveal]').first()).toHaveCSS(
    'opacity',
    '1',
  )
})
