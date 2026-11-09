import { expect, test } from '@playwright/test'

test('hero, fixed header and compact footers fit desktop and narrow screens', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000)
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    for (const path of [
      '/',
      '/houses/large-log-house',
      '/houses/medium-house',
      '/houses/small-house',
    ]) {
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
      await page.evaluate(() => document.fonts.ready)
      await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
        )
        .toBeLessThanOrEqual(1)
      if (path === '/') {
        const hero = page.getByRole('region', { name: 'Неспешные дни у озера.' })
        const image = hero.getByRole('img')
        await expect(image).toHaveCSS('position', 'absolute')
        const bounds = (await hero.boundingBox())!
        const photo = (await image.boundingBox())!
        expect(Math.abs(photo.width - bounds.width)).toBeLessThan(1)
        expect(Math.abs(photo.height - bounds.height)).toBeLessThan(1)
        if (width !== 320)
          await page.screenshot({
            path: `/private/tmp/lake-cabins-browser/layout-${testInfo.project.name}-${width}-hero.png`,
          })
      }
      await page.locator('body > #root footer').scrollIntoViewIfNeeded()
      const header = page.getByRole('banner')
      await expect(header).toHaveCSS('position', 'fixed')
      await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await expect.poll(async () => (await header.boundingBox())!.y).toBe(0)
      const footer = page.getByRole('contentinfo')
      expect((await footer.boundingBox())!.height).toBeLessThan(width > 700 ? 320 : 580)
      if (path === '/houses/medium-house' && width !== 320) {
        await page.screenshot({
          path: `/private/tmp/lake-cabins-browser/layout-${testInfo.project.name}-${width}-footer.png`,
        })
      }
    }
  }
})

test('first screen fits laptop and phone viewports, with the arrow and contacts visible', async ({
  page,
}) => {
  for (const [width, height] of [
    [1366, 768],
    [1280, 660],
    [844, 390],
    [390, 844],
    [320, 568],
  ]) {
    await page.setViewportSize({ width, height })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
    await page.evaluate(() => document.fonts.ready)
    await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
    const hero = page.getByRole('region', { name: 'Неспешные дни у озера.' })
    const box = (await hero.boundingBox())!
    expect(Math.abs(box.height - height)).toBeLessThan(2)
    await expect(hero.getByRole('link', { name: 'Перейти к домам' })).toBeInViewport({ ratio: 1 })
    await expect(hero.getByRole('link', { name: 'Позвонить ↗', exact: true })).toBeInViewport({
      ratio: 1,
    })
    await expect(
      hero.getByRole('link', { name: 'Написать в WhatsApp ↗', exact: true }),
    ).toBeInViewport({ ratio: 1 })
    const arrow = (await hero.getByRole('link', { name: 'Перейти к домам' }).boundingBox())!
    const call = (await hero.getByRole('link', { name: 'Написать в WhatsApp ↗' }).boundingBox())!
    expect(call.y + call.height).toBeLessThanOrEqual(arrow.y)
    const sectionOrder = await page.evaluate(() => {
      const about = document.getElementById('place-heading')!
      const houses = document.getElementById('houses')!
      return !!(about.compareDocumentPosition(houses) & Node.DOCUMENT_POSITION_FOLLOWING)
    })
    expect(sectionOrder).toBe(true)
    if (width === 1366 || width === 390)
      await page.screenshot({ path: `/private/tmp/lake-cabins-browser/hero-fit-${width}.png` })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1)
  }
})

test('desktop card cursor follows the pointer and disappears on leave', async ({
  page,
  isMobile,
}) => {
  await page.setViewportSize({ width: isMobile ? 390 : 1440, height: 1000 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
  const card = page.locator('[data-house-card]').first()
  await card.scrollIntoViewIfNeeded()
  const bounds = (await card.boundingBox())!
  const cursor = card.locator('[data-card-cursor]')
  if (isMobile) {
    await expect(cursor).toHaveCSS('display', 'none')
    await expect(card).not.toHaveCSS('cursor', 'none')
    return
  }
  for (const [x, y] of [
    [bounds.x + 100, bounds.y + 100],
    [bounds.x + 400, bounds.y + 200],
  ]) {
    await page.mouse.move(x, y)
    await expect(card).toHaveCSS('cursor', 'none')
    await expect
      .poll(async () => {
        const circle = (await cursor.locator('span').boundingBox())!
        return Math.hypot(circle.x + circle.width / 2 - x, circle.y + circle.height / 2 - y)
      })
      .toBeLessThan(3)
  }
  await page.mouse.move(5, 200)
  await expect(cursor).toHaveCSS('opacity', '0')
  await expect(card).not.toHaveCSS('cursor', 'none')
})

test('nature sound starts only on request and toggles off', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
  const sound = page.locator('audio')
  expect(await sound.evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true)
  await expect(sound).toHaveAttribute('preload', 'none')
  await page.getByRole('button', { name: 'Включить звуки природы', exact: true }).click()
  const toggle = page.getByRole('button', { name: 'Выключить звуки природы', exact: true })
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  expect(
    await sound.evaluate(
      (audio: HTMLAudioElement) => audio.loop && audio.currentTime >= 0 && !audio.paused,
    ),
  ).toBe(true)
  await toggle.click()
  await expect(
    page.getByRole('button', { name: 'Включить звуки природы', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false')
  expect(await sound.evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true)
})

test('house details keep opposite captions, a slim amenities ribbon and a return below the photos', async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/houses/large-log-house', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
    const left = (await page.locator('[data-caption-left]').boundingBox())!
    const right = (await page.locator('[data-caption-right]').boundingBox())!
    expect(left.x + left.width).toBeLessThan(right.x)
    const ribbon = page.getByLabel(/^Удобства: Wi-Fi/)
    await ribbon.scrollIntoViewIfNeeded()
    expect((await ribbon.boundingBox())!.height).toBeLessThan(65)
    await page.screenshot({ path: `/private/tmp/lake-cabins-browser/amenities-${width}.png` })
    const back = page.getByRole('link', { name: 'Вернуться к домам', exact: true })
    await back.scrollIntoViewIfNeeded()
    await expect(back).toBeVisible()
    await expect(page.getByText('На обложке — сгенерированная концепция.')).toHaveCount(0)
    await expect(page.getByText(/Ближе к природе/)).toHaveCount(0)
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded()
    await page.screenshot({ path: `/private/tmp/lake-cabins-browser/centered-footer-${width}.png` })
  }
})

test('home keeps a quiet header edge and breathing room after the last house', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
  const header = page.getByRole('banner')
  await expect(header).toHaveCSS('border-bottom-width', '0px')
  await expect(header).toHaveCSS('backdrop-filter', 'none')
  const lastCaption = page.locator('[data-house-card]').last().locator('..').locator('p')
  const caption = (await lastCaption.boundingBox())!
  const location = (await page.locator('#location').boundingBox())!
  expect(location.y - caption.y - caption.height).toBeGreaterThanOrEqual(64)
})
