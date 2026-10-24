import { defineConfig, devices } from '@playwright/test'
import fs from 'fs'

const PORT = 5180

// Reuse the sandbox's pre-installed Chromium when present (avoids a browser
// download). Falls back to Playwright's own managed browser elsewhere (e.g.
// CI, after `npx playwright install chromium`).
const candidatePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const executablePath = fs.existsSync(candidatePath) ? candidatePath : undefined

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    ...devices['Desktop Chrome'],
    launchOptions: executablePath ? { executablePath } : {},
  },
  webServer: [
    {
      command: 'npm run dev',
      cwd: 'server',
      port: 8787,
      // Force mock mode regardless of a local server/.env — tests must never
      // trigger a real email send (these override --env-file-if-exists: Node
      // only applies .env values for vars not already present in the process env).
      env: { DATABASE_PATH: ':memory:', BREVO_API_KEY: '', BREVO_SMTP_KEY: '', ANTHROPIC_API_KEY: '' },
      reuseExistingServer: !process.env.CI,
      timeout: 20000,
    },
    {
      command: `npx vite --port ${PORT} --host 127.0.0.1`,
      port: PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 20000,
    },
  ],
})
