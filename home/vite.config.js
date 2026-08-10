import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/home/',
  plugins: tailwindcss(),
  build: {
    outDir: '../dist/home/',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
})
