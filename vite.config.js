import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Cache JS/CSS/font chunks — not API responses
        globPatterns: ['**/*.{js,css,woff2}'],
        runtimeCaching: [],
      },
      manifest: {
        name: 'Rat Bench',
        short_name: 'Rat Bench',
        description: 'Workshop software for people who actually turn spanners.',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        icons: [
          { src: '/favicon.ico', sizes: '64x64', type: 'image/x-icon' },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          pdf:      ['jspdf'],
          qr:       ['qrcode'],
        },
      },
    },
  },
})
