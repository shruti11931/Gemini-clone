import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: false,   // localhost is fine without HTTPS
    host: 'localhost',  // ✅ use 'localhost' not '127.0.0.1'
  }
})
