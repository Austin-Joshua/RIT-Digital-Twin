import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'RIT Digital Twin',
        short_name: 'RIT Twin',
        description: 'Smart Campus Intelligence Platform for Rajalakshmi Institute of Technology',
        theme_color: '#0B2C6B',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/assets/images/RIT_LOGO.webp',
            sizes: '192x192',
            type: 'image/webp'
          },
          {
            src: '/assets/images/RIT_LOGO.webp',
            sizes: '512x512',
            type: 'image/webp'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg}'],
        maximumFileSizeToCacheInBytes: 30000000
      }
    })
  ],
  define: {
    global: 'window',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
