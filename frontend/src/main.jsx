import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

// Automatically recover from stale chunks caused by new deployments
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('[Vite] Preload error detected for chunk. Reloading page for new deployment...', event);
    const storageKey = 'rit_vite_preload_reload';
    const lastReload = sessionStorage.getItem(storageKey);
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem(storageKey, String(now));
      window.location.reload();
    }
  });
}

if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && 'serviceWorker' in navigator) {
  // Prevent stale PWA caches from serving a broken blank page during local dev.
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister())
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
