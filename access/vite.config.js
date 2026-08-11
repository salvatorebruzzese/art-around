import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss()],
  base: '/access/',
  build: {
    outDir: '../dist/access/',
    rollupOptions: {
      input: {
        login: 'login.html',
        profile: 'profile.html',
        signup: 'signup.html',
      },
    },
  },
})
