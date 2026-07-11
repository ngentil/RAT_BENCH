import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// Netlify sets COMMIT_REF automatically for every build — surfacing it as
// VITE_RELEASE lets Sentry tag every error with the exact commit that shipped
// it, so "which deploy is this from" isn't a manual git-log hunt. Falls back
// to undefined locally/outside Netlify, which Sentry just treats as no release.
const RELEASE = process.env.COMMIT_REF || process.env.VERCEL_GIT_COMMIT_SHA;

// Only generate source maps when we're actually going to upload+strip them —
// the Sentry plugin removes the sourceMappingURL comment from shipped files
// after a successful upload, but leaves the raw .map files untouched if it
// never runs (no token configured), which would otherwise start publishing
// full source maps to the public dist/ folder the moment sourcemap:true was
// turned on, before anyone had actually set up Sentry to consume them.
const UPLOADING_SOURCE_MAPS = !!process.env.SENTRY_AUTH_TOKEN;

export default defineConfig({
  define: {
    'import.meta.env.VITE_RELEASE': JSON.stringify(RELEASE),
  },
  plugins: [
    react(),
    // Uploads source maps so Sentry shows real stack traces instead of
    // minified code — no-ops (via authToken: undefined) until SENTRY_AUTH_TOKEN
    // is set as a build env var, so it's safe to leave in even before that's
    // configured.
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: { name: RELEASE },
      disable: !UPLOADING_SOURCE_MAPS,
    }),
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
    sourcemap: UPLOADING_SOURCE_MAPS,
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
