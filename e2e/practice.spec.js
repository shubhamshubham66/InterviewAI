import { test, expect } from '@playwright/test'

test('coding practice: a correct solution passes all tests', async ({ page }) => {
  await page.goto('/practice', { waitUntil: 'networkidle' })

  const editor = page.locator('.cm-content')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Delete')
  await page.keyboard.insertText(
    [
      'function twoSum(nums, target) {',
      '  const seen = {};',
      '  for (let i = 0; i < nums.length; i++) {',
      '    const need = target - nums[i];',
      '    if (seen[need] !== undefined) return [seen[need], i];',
      '    seen[nums[i]] = i;',
      '  }',
      '}',
    ].join('\n')
  )

  await page.getByRole('button', { name: 'Run tests' }).click()
  await expect(page.getByText('4/4 test cases passed')).toBeVisible({ timeout: 10000 })
})

test('coding practice: a broken solution reports failures, not a crash', async ({ page }) => {
  await page.goto('/practice', { waitUntil: 'networkidle' })

  const editor = page.locator('.cm-content')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Delete')
  await page.keyboard.insertText('function twoSum(nums, target) { return [0, 0]; }')

  await page.getByRole('button', { name: 'Run tests' }).click()
  await expect(page.getByText(/0\/4 test cases passed/)).toBeVisible({ timeout: 10000 })
})

test('question bank: browse a category and reveal an answer', async ({ page }) => {
  await page.goto('/practice', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Question Bank' }).click()
  await page.getByRole('button', { name: /^SQL/ }).click()

  const firstQuestion = page.locator('details summary').first()
  await firstQuestion.click()
  await expect(page.locator('details').first()).toContainText(/JOIN|key|index/i)
})

test('question bank: download for offline practice, then browse fully offline', async ({ page, context }) => {
  await page.goto('/practice', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Question Bank' }).click()
  await page.getByRole('button', { name: 'Download for offline' }).click()
  await expect(page.getByText(/Downloaded for offline practice/)).toBeVisible()

  await context.setOffline(true)
  try {
    await expect(page.getByText("You're offline — showing your downloaded question set.")).toBeVisible()
    await page.getByRole('button', { name: /^DSA/ }).click()
    await expect(page.getByText('What is the time complexity of binary search?')).toBeVisible()
  } finally {
    await context.setOffline(false)
  }
})
