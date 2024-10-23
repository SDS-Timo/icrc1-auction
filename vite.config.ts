/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import { defineConfig } from 'vite'
import environment from 'vite-plugin-environment'
import tsconfigPaths from 'vite-tsconfig-paths'

dotenv.config()

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString()
          }
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    environment('all', { prefix: 'CANISTER_' }),
    environment('all', { prefix: 'HTTP_' }),
    environment('all', { prefix: 'DFX_' }),
    environment('all', { prefix: 'ENV_' }),
  ],
})
