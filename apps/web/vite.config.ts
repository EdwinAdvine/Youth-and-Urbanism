import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// TAURI_ENV_PLATFORM is injected by the Tauri CLI during `tauri dev` / `tauri build`
const isTauriBuild = !!process.env.TAURI_ENV_PLATFORM

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Service workers cannot register under the tauri://localhost protocol.
    // Only include VitePWA when building for the browser.
    ...(!isTauriBuild
      ? [
          VitePWA({
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.ts',
            registerType: 'prompt',
            injectRegister: false,
            manifest: {
              name: 'Urban Home School',
              short_name: 'UHS',
              description: 'AI-powered homeschooling platform for Kenyan children',
              theme_color: '#FF0000',
              background_color: '#0F1112',
              display: 'standalone',
              start_url: '/',
              icons: [
                { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
                { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
              ],
            },
            devOptions: {
              enabled: false,
            },
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: parseInt(process.env.VITE_PORT || '3000'),
    host: true,
    // Don't auto-open browser when running inside Tauri (Tauri opens its own window)
    open: !isTauriBuild,
    // Proxy API + WebSocket traffic so httpOnly cookies work in Tauri
    // (Tauri webview uses tauri://localhost, cookies are same-site only when proxied)
    ...(isTauriBuild
      ? {
          proxy: {
            '/api': {
              target: process.env.VITE_API_URL || 'http://localhost:8000',
              changeOrigin: true,
            },
            '/ws': {
              target: process.env.VITE_API_URL || 'http://localhost:8000',
              ws: true,
              changeOrigin: true,
            },
          },
        }
      : {}),
  },
})
