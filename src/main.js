import { createSSRApp } from 'vue'
import App from './App.vue'
import {installI18n} from './i18n/index.js'

export function createApp() {
  const app = createSSRApp(App)
  installI18n(app)
  return { app }
}
