import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'react-core';
            if (id.includes('react-router-dom')) return 'router';
            if (
              id.includes('framer-motion') || 
              id.includes('@dnd-kit') || 
              id.includes('ts-fsrs') || 
              id.includes('papaparse')
            ) {
              return 'ui-heavy';
            }
          }
        }
      }
    }
  }
})
