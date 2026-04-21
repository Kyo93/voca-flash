import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-heavy': [
            'framer-motion', 
            '@dnd-kit/core', 
            '@dnd-kit/sortable', 
            '@dnd-kit/utilities', 
            'ts-fsrs', 
            'papaparse'
          ]
        }
      }
    }
  }
})
