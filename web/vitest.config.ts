import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    // Run each test file in a real forked subprocess (not VM worker threads)
    // Required for WASM packages like @techstark/opencv-js and native addons like sharp
    pool: 'forks',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
