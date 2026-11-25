import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), tailwindcss()],
    server: {
      proxy: {
        // Na macOS port 5000 zajmuje AirPlay. Wtedy uruchom backend z PORT=5001
        // i ustaw API_PROXY_TARGET=http://localhost:5001 w frontend/.env.local.
        '/api': env.API_PROXY_TARGET || 'http://localhost:5000',
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
