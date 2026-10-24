import { test, expect } from '@playwright/test'
import { signup, uniqueEmail } from './helpers.js'

test('signup logs the user in and shows their name in the sidebar', async ({ page }) => {
  await signup(page, { name: 'Test Student' })
  await expect(page.getByText('Test Student')).toBeVisible()
  await expect(page.getByText('Student', { exact: true })).toBeVisible()
})

test('rejects a weak password with a clear error', async ({ page }) => {
  await page.goto('/signup', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Password', exact: true }).click()
  await page.fill('#name', 'Weak Pass')
  await page.fill('#email', uniqueEmail('weak'))
  await page.fill('#password', '123')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByText(/at least 8 characters/i)).toBeVisible()
})

test('full interview flow: setup, skip, answer, early end, report', async ({ page }) => {
  await signup(page, { name: 'Interview Tester' })

  await page.goto('/interview', { waitUntil: 'networkidle' })
  await page.fill('#company', 'Acme Corp')
  await page.getByRole('button', { name: '10 min' }).click()
  await page.getByRole('button', { name: /Start .* practice/i }).click()

  await expect(page.getByText(/Question 1 of 3/)).toBeVisible()
  await expect(page.getByText('Acme Corp')).toBeVisible()

  // skip the first question
  await page.getByRole('button', { name: 'Skip', exact: true }).click()
  await expect(page.getByText(/Question 2 of 3/)).toBeVisible()

  // answer the second
  await page.locator('textarea').fill('For example, I built this with React and it improved load time significantly.')
  await page.getByRole('button', { name: 'Submit answer' }).click()
  await expect(page.getByText(/Previous answer score/i)).toBeVisible()

  // end early instead of answering the third
  await page.getByRole('button', { name: 'End interview now' }).click()

  await expect(page.getByRole('heading', { name: 'Session report' })).toBeVisible()
  await expect(page.getByText('Skipped')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start another interview' })).toBeVisible()
})
