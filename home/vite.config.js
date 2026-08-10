import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss()],
  base: '/home/',
  build: {
    outDir: '../dist/home/',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
})
