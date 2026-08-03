import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**'], // Ignore dist/ folder
    setupFiles: ['./test.setup.ts'],
  },
})
