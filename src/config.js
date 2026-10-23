// Public API endpoint. Render builds use HTTPS; local dev uses the Vite proxy.
export const API_BASE = (
  (import.meta.env.DEV ? (import.meta.env.VITE_DEV_API_BASE_URL || '/api') :
   (import.meta.env.VITE_API_BASE_URL || 'https://river-delta-api.onrender.com/api'))
).replace(/\/+$/, '')
export const WS_BASE = (import.meta.env.DEV ? import.meta.env.VITE_DEV_WS_BASE_URL : import.meta.env.VITE_WS_BASE_URL) || (
  API_BASE.startsWith('https://') ? API_BASE.replace('https://', 'wss://') :
  API_BASE.startsWith('http://') ? API_BASE.replace('http://', 'ws://') :
  'ws://127.0.0.1:8011/api'
)
