import { expect, test } from '@playwright/test'

test('guest copy, published contacts and map point are consistent on home and house pages', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
  await expect(page).toHaveTitle('Роща — домики у озера Парное')
  await expect(page.getByText(/визуальный прототип/i)).toHaveCount(0)
  await expect(
    page.getByRole('link', { name: 'Позвонить ↗', exact: true }).first(),
  ).toHaveAttribute('href', 'tel:+79659036548')
  await expect(page.getByRole('link', { name: /\+7 965 903-65-38/ })).toHaveAttribute(
    'href',
    'tel:+79659036538',
  )
  await expect(page.getByRole('link', { name: 'Написать в WhatsApp ↗' }).first()).toHaveAttribute(
    'href',
    /^https:\/\/wa.me\/79659036548\?text=/,
  )
  await expect(page.locator('iframe')).toHaveAttribute('src', /oid=15994984644/)
  await expect(page.getByRole('link', { name: 'Построить маршрут ↗' })).toHaveAttribute(
    'href',
    /55.261251%2C89.214732/,
  )
  for (const id of ['large-log-house', 'medium-house', 'small-house']) {
    await page.goto(`/houses/${id}`)
    await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
    const whatsapp = page
      .locator('#about-house')
      .getByRole('link', { name: 'Написать в WhatsApp ↗' })
    const href = await whatsapp.getAttribute('href')
    const name = await page.locator('h1').getAttribute('aria-label')
    expect(decodeURIComponent(href!)).toContain(`«${name}»`)
    await expect(
      page.locator('#about-house').getByRole('link', { name: 'Позвонить ↗' }),
    ).toHaveAttribute('href', 'tel:+79659036548')
  }
})

test('footer navigation reaches the home location section from a house', async ({ page }) => {
  await page.goto('/houses/medium-house')
  await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
  await page
    .getByRole('navigation', { name: 'Навигация в подвале' })
    .getByRole('link', { name: 'Как нас найти' })
    .click()
  await expect(page).toHaveURL(/\/#location$/)
  await expect(page.locator('[data-transition-layer]')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Встретимся у озера.' })).toBeInViewport()
})

test('desktop gallery arrows flank the images and mobile arrows stay below', async ({
  page,
  isMobile,
}) => {
  await page.goto('/houses/medium-house')
  await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
  const rail = page.locator('[data-photo-rail]')
  const previous = page.getByRole('button', { name: 'Предыдущее фото', exact: true })
  const next = page.getByRole('button', { name: 'Следующее фото', exact: true })
  await rail.scrollIntoViewIfNeeded()
  const box = (await rail.boundingBox())!
  const left = (await previous.boundingBox())!
  const right = (await next.boundingBox())!
  if (isMobile) {
    expect(left.y).toBeGreaterThanOrEqual(box.y + box.height)
    expect(right.y).toBeGreaterThanOrEqual(box.y + box.height)
  } else {
    expect(left.x + left.width).toBeLessThanOrEqual(box.x)
    expect(right.x).toBeGreaterThanOrEqual(box.x + box.width)
    expect(Math.abs(left.y - right.y)).toBeLessThan(2)
    expect(left.y).toBeLessThan(box.y + box.height)
  }
  await next.click()
  await expect(previous).toBeEnabled()
  await page
    .getByRole('button', { name: /^Открыть фото:/ })
    .nth(1)
    .click()
  const viewer = page.getByRole('dialog')
  await expect(viewer).toHaveAttribute('aria-busy', 'false')
  const before = (await viewer
    .getByRole('button', { name: 'Предыдущая фотография', exact: true })
    .boundingBox())!
  const after = (await viewer
    .getByRole('button', { name: 'Следующая фотография', exact: true })
    .boundingBox())!
  if (isMobile) {
    expect(Math.abs(before.y - after.y)).toBeLessThan(2)
    expect(after.x - before.x).toBeLessThan(100)
  } else {
    expect(after.x - before.x).toBeGreaterThan(1000)
    expect(Math.abs(before.y - after.y)).toBeLessThan(2)
  }
})

test('reduced motion stops the ribbon and the small viewport has no horizontal overflow', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/')
  await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
  await page.evaluate(() => document.fonts.ready)
  const ribbon = page.getByLabel(
    'Тишина у озера · Домики среди природы · Время для близких · Баня · Сапы · Прогулки на природе · Неспешные дни',
  )
  await expect(ribbon.locator('div').first()).toHaveCSS('animation-name', 'none')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
