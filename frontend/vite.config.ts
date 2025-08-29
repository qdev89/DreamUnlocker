import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['@headlessui/react', '@heroicons/react'],
          router: ['react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 500,
    sourcemap: true
  },
  server: {
    port: 5174,
    host: true
  }
})
