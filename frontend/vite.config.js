import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // simple-peer is CJS; point Vite at the pre-bundled minified version
      'simple-peer': 'simple-peer/simplepeer.min.js',
    },
  },
  define: {
    // simple-peer needs global to be defined in browser context
    global: 'globalThis',
  },
})
