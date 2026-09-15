import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: '/navigator/',
  build: {
    outDir: '../dist/navigator/',
    rollupOptions: {
      input: {
        main: 'index.html',
        otp: 'otp.html',
        app: 'app.html',
        appVue: 'app.vue',
        tour: 'tour.html',
        tourVue: 'tour.vue',
      },
    },
  },
})
