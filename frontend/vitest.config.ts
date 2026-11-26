import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default defineConfig((env) =>
  mergeConfig(viteConfig(env), {
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude],
      setupFiles: ['./src/test/setup.ts'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
