/// <reference types="node" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./learn/exercises/setup.ts'],
    include: ['learn/exercises/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': '.',
    },
  },
})
