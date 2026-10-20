import { defineConfig } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'

// 兼容该 alpha 版本的双层 CJS 互操作导出
const uni = uniModule.default?.default ?? uniModule.default ?? uniModule

export default defineConfig({
  plugins: [uni()],
  server: { host: "127.0.0.1", port: 5188, strictPort: true, proxy: { "/api": process.env.PILOT_API_TARGET || "http://127.0.0.1:8011" } },
})
