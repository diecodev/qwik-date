import { defineConfig, devices } from '@playwright/test';

// a port of its own, so the suite doesn't collide with a `pnpm dev` already running on 5173
const PORT = 5180;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // one retry in CI, for a slow runner: the report marks what only passed on it as flaky, so it doesn't go unseen
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  // the playground dev server renders the library straight from src/lib; the fixture pages the
  // specs open live in src/routes/e2e
  webServer: {
    command: `pnpm exec vite --mode ssr --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/e2e/calendar/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
