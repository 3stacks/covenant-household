import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  // The shared code is in packages/core, outside this folder.
  server: { port: 5181, host: true, fs: { allow: ['../..'] } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Daily Prayer',
        short_name: 'Daily Prayer',
        description: 'A Reformed daily prayer book.',
        theme_color: '#5a3e1b',
        background_color: '#faf8f4',
        display: 'standalone',
        start_url: '.',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        // Precache the app and the calendar index. Each day is cached when it
        // is first opened.
        globPatterns: ['**/*.{js,css,html,svg}', 'calendar/index.json'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/calendar/') && !url.pathname.endsWith('index.json'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'days', expiration: { maxEntries: 400 } },
          },
        ],
      },
    }),
  ],
})
