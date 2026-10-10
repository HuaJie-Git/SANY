import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/SANY/admin/' : './',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5175,
    strictPort: true,
    proxy: {
      '/pc': { target: 'http://127.0.0.1:5174', changeOrigin: true, ws: true },
    },
  },
})
