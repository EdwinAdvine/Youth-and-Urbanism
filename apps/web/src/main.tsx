import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n' // Initialize i18n
import { initializeTheme } from './store'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Initialize theme before first render to prevent flash
initializeTheme()

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)

// Register PWA service worker ONLY in the browser (not inside Tauri).
// Tauri webview uses the tauri://localhost protocol which blocks SW registration.
const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

if (!isTauri && 'serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      onNeedRefresh() {
        if (confirm('A new version of Urban Home School is available. Reload to update?')) {
          window.location.reload()
        }
      },
      onOfflineReady() {
        console.log('App ready for offline use.')
      },
    })
  })
}
