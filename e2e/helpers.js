export function uniqueEmail(prefix) {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 10000)}@test.com`
}

export async function signup(page, { name, email, password = 'password123', role = 'student' } = {}) {
  await page.goto('/signup', { waitUntil: 'networkidle' })
  // Signup defaults to the "Email code" tab — these tests want the
  // deterministic password flow (no email step to read a code from).
  await page.getByRole('button', { name: 'Password', exact: true }).click()
  await page.fill('#name', name)
  await page.fill('#email', email || uniqueEmail('user'))
  await page.fill('#password', password)
  if (role === 'placement_admin') {
    await page.getByRole('button', { name: 'Placement cell' }).click()
  }

  // waitForLoadState('networkidle') is unreliable here: the signup submit
  // triggers a client-side (SPA) navigation, not a real page load, so it can
  // resolve before the signup request has even fired. Wait for the actual
  // API response instead.
  const [response] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/auth/signup')),
    page.getByRole('button', { name: 'Create account' }).click(),
  ])
  if (!response.ok()) {
    throw new Error(`Signup failed: ${response.status()} ${await response.text()}`)
  }
  await page.waitForURL('/')
}
