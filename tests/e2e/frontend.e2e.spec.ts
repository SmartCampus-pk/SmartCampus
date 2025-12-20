import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toContainText('Odkryj wydarzenia')
  })
})
