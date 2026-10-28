import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
            return 'react'
          }
          if (/node_modules\/(qr-code-styling|qrcode-generator|jsqr)\//.test(id)) {
            return 'qr'
          }
          if (/node_modules\/(react-hook-form|@hookform|zod)\//.test(id)) {
            return 'forms'
          }
          return undefined
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/lib/**/*.ts', 'src/store/**/*.ts', 'src/i18n/index.ts'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        // Canvas, QR rendering and file export run in the browser; they are
        // exercised end-to-end by Playwright instead of jsdom.
        'src/lib/export/**',
        'src/lib/qr/**',
        'src/lib/logo/**',
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 75,
        statements: 75,
      },
    },
  },
})
