import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss()],
  base: '/marketplace/',
  build: {
    outDir: '../dist/marketplace',
    rollupOptions: {
      input: {
        main: 'index.html',
        card: 'card.html',
      },
    },
  },
})
