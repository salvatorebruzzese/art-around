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
        guided: 'guided.html',
        guidedVue: 'guided.vue',
        libre: 'libre.html',
        libreVue: 'libre.vue',
        master: 'master.html',
        masterVue: 'master.vue',
        tour: 'tour.html',
        tourVue: 'tour.vue',
      },
    },
  },
})
