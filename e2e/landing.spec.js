import { test, expect } from '@playwright/test'

test('landing page renders the hero and nav without errors', async ({ page }) => {
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto('/', { waitUntil: 'networkidle' })

  await expect(page.getByRole('heading', { name: /Rehearse the interview/i })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
  expect(errors).toEqual([])
})

test('Start practice button navigates to the interview setup', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: /Start .* practice/i }).click()
  await expect(page).toHaveURL(/\/interview$/)
  await expect(page.getByRole('heading', { name: 'Set up your mock interview' })).toBeVisible()
})
