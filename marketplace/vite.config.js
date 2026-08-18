import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss()],
  base: '/marketplace/',
  build: {
    outDir: '../dist/marketplace/',
    rollupOptions: {
      input: {
        marketplace: 'marketplace.html',
        editor: 'editor.html',
        profile: 'profile.html',
        viewer: 'viewer.html',
      },
    },
  },
})
