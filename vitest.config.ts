import { defineConfig } from 'vitest/config';

// Unit tests for the framework-free date helpers in src/lib/core (the components are covered by the
// Playwright suite in tests/e2e). Kept apart from vite.config.ts so no Qwik plugin is loaded.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    // each file runs in its own process, so a test can switch `process.env.TZ`
    pool: 'forks',
  },
});
