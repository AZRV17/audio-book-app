import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true, proxyTimeout: 300000, timeout: 300000 },
      '/static': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
})
