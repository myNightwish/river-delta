# 三角洲组队岛 · 前端 (uni-app Vue3)

一套代码多端：H5（先行验证）→ 微信小程序（支付/传播）→ App。

## 开发

```bash
npm install
npm run dev:h5        # H5 热更新，默认 http://localhost:5173
npm run dev:mp-weixin # 微信小程序（需 HBuilderX 或微信开发者工具导入 dist）
npm run build:h5      # H5 打包
```

后端地址在 `src/config.js`（`API_BASE` / `WS_BASE`），联调时改为实际地址。
后端先启动：`uvicorn app.main:app --reload`（见 delta-force-match-server）。

## 页面

| 页面 | 说明 |
|---|---|
| 登录 | 手机号+验证码（开发模式直接显示验证码） |
| 我的档案 | 查看/更新档案；上传战绩截图走 OCR 识别后确认 |
| 组队岛（首页） | 技术岛/陪玩岛切换；免费浏览岛民（KD 隐藏）与房间；发布房间（招1/2人） |
| 队伍 | LIVE 队员槽位；支付 ¥1；入队见 KD；确定组队（二次确认）；锁定前退出退 80% |
| 聊天 | WebSocket 实时聊天；锁定后可发游戏房间码/ID（一键复制） |
| 我的 | 档案入口、我的队伍、我的订单、退出登录 |

## 备注

- UI 为手写轻量样式；正式版建议接入 uView Plus 组件库。
- 小程序发布需：微信公众平台注册 + 300元/年认证 + 类目审核；`manifest.json` 里填真实 appid。
