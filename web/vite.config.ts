import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5190,
    strictPort: true,
    fs: { allow: ['..'] },
    proxy: { '/api': 'http://localhost:4001' },
  },
})
