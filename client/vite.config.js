import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 41009,
    proxy: {
      '/api': {
        target: 'http://localhost:41109',
        changeOrigin: true
      }
    }
  }
})
