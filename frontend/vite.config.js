import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    fs: {
      allow: [fileURLToPath(new URL('.', import.meta.url))],
      deny: ['.env', '.env.*', '*.{crt,pem,key}', '**/.git/**', '**/.local-postgres/**', '**/.local-media/**'],
    },
    proxy: { "/api": process.env.API_PROXY_TARGET || "http://127.0.0.1:3001" },
  },
})
