import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Netlify sets COMMIT_REF automatically for every build — surfacing it as
// VITE_RELEASE lets Sentry tag every error with the exact commit that shipped
// it, so "which deploy is this from" isn't a manual git-log hunt. Falls back
// to undefined locally/outside Netlify, which Sentry just treats as no release.
const RELEASE = process.env.COMMIT_REF || process.env.VERCEL_GIT_COMMIT_SHA;

export default defineConfig({
  define: {
    'import.meta.env.VITE_RELEASE': JSON.stringify(RELEASE),
  },
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
