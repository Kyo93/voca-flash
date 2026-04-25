import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')
          if (normalizedId.includes('node_modules')) {
            if (/node_modules\/(react|react-dom)\//.test(normalizedId)) return 'react-core';
            if (normalizedId.includes('node_modules/react-router-dom')) return 'router';
            if (
              normalizedId.includes('node_modules/@tiptap/react') ||
              normalizedId.includes('node_modules/@tiptap/core')
            ) {
              return 'editor-core';
            }
            if (
              normalizedId.includes('node_modules/@tiptap/starter-kit') ||
              normalizedId.includes('node_modules/@tiptap/extension')
            ) {
              return 'editor-extensions';
            }
            if (
              normalizedId.includes('node_modules/@tiptap/pm') ||
              normalizedId.includes('node_modules/prosemirror-')
            ) {
              return 'editor-pm';
            }
            if (normalizedId.includes('node_modules/tiptap-markdown')) {
              return 'editor-markdown-adapter';
            }
            if (
              normalizedId.includes('node_modules/react-markdown') ||
              normalizedId.includes('node_modules/remark-gfm') ||
              normalizedId.includes('node_modules/rehype-raw')
            ) {
              return 'markdown';
            }
            if (normalizedId.includes('node_modules/recharts')) return 'charts';
            if (
              normalizedId.includes('node_modules/framer-motion') || 
              normalizedId.includes('node_modules/@dnd-kit') || 
              normalizedId.includes('node_modules/ts-fsrs') || 
              normalizedId.includes('node_modules/papaparse')
            ) {
              return 'ui-heavy';
            }
          }
        }
      }
    }
  }
})
