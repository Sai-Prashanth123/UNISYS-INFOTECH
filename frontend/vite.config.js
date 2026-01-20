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
  }
})
