import { defineConfig } from 'vite'

export default defineConfig({
  base: '/access/',
  build: {
    outDir: '../dist/access/',
    rollupOptions: {
      input: {
        login: 'login.html',
        signup: 'signup.html',
      },
    },
  },
})
