import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from 'vite'


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Prefer IPv4: Spring Boot commonly binds to IPv4 while localhost may resolve to ::1.
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8082'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          timeout: 30000,
          proxyTimeout: 30000,
        }
      }
    }
  }
})

