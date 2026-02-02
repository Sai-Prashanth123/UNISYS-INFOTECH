import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // For local development you can still point this to http://localhost:5001,
        // but by default we proxy to the deployed Azure backend so dev uses the same API.
        target: 'https://unisysinfotech-backend-gtgngeaueme4bhhs.centralus-01.azurewebsites.net',
        changeOrigin: true,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Keep react, react-dom, react-router in one chunk so there's a single React instance
            // Must check for exact package boundaries to avoid splitting React
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router') || id.includes('\\react\\') || id.includes('\\react-dom\\') || id.includes('\\react-router')) {
              return 'react-vendor'
            }
            if (id.includes('recharts')) return 'recharts'
            if (id.includes('@supabase')) return 'supabase'
            if (id.includes('lucide-react')) return 'lucide'
            if (id.includes('axios')) return 'axios'
            if (id.includes('zustand')) return 'zustand'
            return 'vendor'
          }
        }
      }
    }
  }
})
