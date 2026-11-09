import { expect, test } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test('first visit highlights sound, permits a silent visit and remembers that choice', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const welcome = page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })
  await expect(welcome.getByRole('button', { name: 'Продолжить без звука' })).toBeVisible()
  expect(await page.locator('audio').evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true)
  await expect(welcome.getByRole('button', { name: 'Продолжить без звука' })).toBeFocused()
  await page.screenshot({ path: '/private/tmp/lake-cabins-browser/arrival-desktop.png' })
  await welcome.getByRole('button', { name: 'Продолжить без звука' }).click()
  await expect(welcome).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
  expect(await page.locator('audio').evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(welcome).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Включить звуки природы', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Подсказка о звуке', exact: true }).click()
  await expect(
    welcome.getByText('Хотите чуть больше атмосферы? Включите звуки природы.', { exact: true }),
  ).toBeVisible()
  await expect(welcome.getByRole('heading')).toHaveCount(0)
  await welcome.getByRole('button', { name: 'Продолжить без звука' }).click()
  await expect(welcome).toHaveCount(0)
})

test('mobile spotlight starts audio only after an explicit tap', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const welcome = page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })
  const target = welcome.getByRole('button', {
    name: 'Включить звуки природы и продолжить',
    exact: true,
  })
  await expect(target).toBeVisible()
  await expect(welcome.getByRole('button', { name: 'Продолжить без звука' })).toBeInViewport({
    ratio: 1,
  })
  await page.screenshot({ path: '/private/tmp/lake-cabins-browser/arrival-mobile.png' })
  await target.click()
  await expect(welcome).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Выключить звуки природы', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Подсказка о звуке', exact: true }).click()
  await welcome
    .getByRole('button', { name: 'Включить звуки природы и продолжить', exact: true })
    .click()
  await expect(welcome).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Выключить звуки природы', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Выключить звуки природы', exact: true }).click()
  expect(await page.locator('audio').evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true)
})

test('history changes during the loader or sound prompt never leave scroll locked', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => {
    history.pushState(
      { ...history.state, key: 'during-arrival', idx: 1 },
      '',
      '/houses/medium-house',
    )
    dispatchEvent(new PopStateEvent('popstate'))
  })
  await expect(page.getByRole('heading', { name: 'Лад', level: 1, exact: true })).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
  await page.getByRole('button', { name: 'Подсказка о звуке', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
  await expect(page.locator('[data-transition-layer]')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
  await page.mouse.wheel(0, 600)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
})

test('Escape leaves the first-visit prompt without sound or a locked page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/houses/medium-house', { waitUntil: 'domcontentloaded' })
  const welcome = page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })
  await expect(welcome.getByRole('button', { name: 'Продолжить без звука' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(welcome).toHaveCount(0)
  expect(await page.locator('audio').evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true)
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
})

test('sound hint cannot interrupt the return curtain', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('roshcha-sound-intro', 'seen'))
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
  await page.locator('#house-medium-house').click()
  await expect(page.getByRole('heading', { name: 'Лад', level: 1, exact: true })).toBeVisible()
  await expect(page.locator('[data-transition-layer]')).toHaveCount(0)
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 1000))
  await page.getByRole('link', { name: 'Все дома', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Лад', level: 1, exact: true })).toBeVisible()
  await page.clock.runFor(200)
  await expect(page.locator('[data-transition-phase]')).toHaveAttribute(
    'data-transition-phase',
    'closing',
  )
  await page
    .getByRole('button', { name: 'Подсказка о звуке', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click())
  await expect(page.getByRole('dialog', { name: 'Добро пожаловать в Рощу' })).toHaveCount(0)
  await page.clock.runFor(1000)
  await expect(page.locator('[data-transition-layer]')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
})
