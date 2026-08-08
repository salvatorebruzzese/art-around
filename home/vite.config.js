import { defineConfig } from 'vite'

export default defineConfig({
  base: '/home/',
  build: {
    outDir: '../dist/home/',
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
        signup: 'signup.html',
      },
    },
  },
})
