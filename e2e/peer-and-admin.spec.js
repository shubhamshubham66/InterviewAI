import { test, expect } from '@playwright/test'
import { signup, uniqueEmail } from './helpers.js'

test('peer mock interview: two participants exchange a question live over WebSocket', async ({ browser }) => {
  const ctxA = await browser.newContext()
  const pageA = await ctxA.newPage()
  await signup(pageA, { name: 'Peer Host' })

  await pageA.goto('/peer', { waitUntil: 'networkidle' })
  await pageA.getByRole('button', { name: 'Create a room' }).click()
  await pageA.locator('input').first().fill('SDE Intern')
  await pageA.getByRole('button', { name: 'Create room' }).click()

  const code = (await pageA.locator('p.font-display').first().textContent()).trim()
  expect(code).toMatch(/^[0-9A-F]{6}$/)

  const ctxB = await browser.newContext()
  const pageB = await ctxB.newPage()
  await pageB.goto('/peer', { waitUntil: 'networkidle' })
  await pageB.getByRole('button', { name: 'Join with a code' }).click()
  await pageB.getByPlaceholder('Guest name').fill('Peer Guest')
  await pageB.getByPlaceholder('e.g. C2F189').fill(code)
  await pageB.getByRole('button', { name: 'Join room' }).click()

  // A sees B join live, no reload (avatar carries the name as a title attribute)
  await expect(pageA.locator('[title="Peer Guest"]')).toBeVisible({ timeout: 5000 })

  await pageA.locator('input[placeholder*="Explain the difference"]').fill('What is a REST API?')
  await pageA.getByRole('button', { name: 'Ask', exact: true }).click()

  // B receives it live
  await expect(pageB.getByText('What is a REST API?')).toBeVisible({ timeout: 5000 })

  await pageB.locator('input[placeholder="Type your answer…"]').fill('It uses HTTP methods on resource URLs.')
  await pageB.getByRole('button', { name: 'Answer', exact: true }).click()

  // A sees the answer live and leaves feedback
  await expect(pageA.getByText('It uses HTTP methods on resource URLs.')).toBeVisible({ timeout: 5000 })
  await pageA.locator('input[placeholder*="Feedback for their answer"]').fill('Good, concise.')
  await pageA.getByRole('button', { name: 'Send' }).click()

  // B sees the feedback live
  await expect(pageB.getByText('Good, concise.')).toBeVisible({ timeout: 5000 })

  await ctxA.close()
  await ctxB.close()
})

test('admin dashboard is role-gated', async ({ page }) => {
  await signup(page, { name: 'Just A Student', role: 'student' })
  await page.goto('/admin', { waitUntil: 'networkidle' })
  await expect(page.getByText(/only available to placement cell accounts/i)).toBeVisible()
})

test('placement admin sees the dashboard with aggregate stats', async ({ page }) => {
  await signup(page, { name: 'Placement Cell', role: 'placement_admin', email: uniqueEmail('admin') })
  await page.goto('/admin', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { name: 'Placement dashboard' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Students' })).toBeVisible()
})
