import { defineConfig } from 'vite'

export default defineConfig({
  base: '/app/',
  build: {
    outDir: '../dist/app',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
})
