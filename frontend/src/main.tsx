import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n' // Initialize i18n
import { registerSW } from 'virtual:pwa-register'
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

// Register PWA service worker (prompt user to update when new version available)
if ('serviceWorker' in navigator) {
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
}