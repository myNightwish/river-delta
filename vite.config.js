import { defineConfig } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'

// 兼容该 alpha 版本的双层 CJS 互操作导出
const uni = uniModule.default?.default ?? uniModule.default ?? uniModule

export default defineConfig({
  plugins: [uni()],
})
