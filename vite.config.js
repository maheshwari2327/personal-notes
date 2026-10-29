import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Layer: Frontend Configuration
// File: vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
})
