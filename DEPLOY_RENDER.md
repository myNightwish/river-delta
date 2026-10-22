# Render: river-delta-web

Static Site：

- Root Directory: 留空（此仓库本身就是前端）
- Build Command: `npm ci && npm run build:h5`
- Publish Directory: `dist/build/h5`

生产构建默认请求 `https://river-delta-api.onrender.com/api`，也可用公开构建变量 `VITE_API_BASE_URL` 覆盖。变量修改后须重新构建前端。
本地开发仍请求 `/api` 并由 Vite 转发到127.0.0.1:8011。

部署前需要同时更新后端仓库，旧后端没有 `/api/pilot` 接口。
浏览器数据以域名为单位保存，本机已有匿名身份不会自动迁移到线上域名。

上线验证：使用普通/无痕窗口分别提交公开招募，确认互相可见，申请后进入同一个队伍并由双方确认。

队伍确认后显示文字/语音消息窗口。Render HTTPS 页面可请求浏览器麦克风权限，录音仅在用户点击后开始。需前后端一起更新；旧后端没有聊天与音频接口。

## 在线状态与身份恢复

前后端须一同更新，详情见 [在线状态与身份恢复](docs/presence-recovery.md)，不需要新增环境变量。旧数据库会自动补在线时间字段，旧招募在玩家回访前暂时隐藏。

## 最近组局与基础限流

前后端一起更新，历史聊天入口、消息编号保留与限流阈值见 [最近组局与基础限流](docs/recent-chat-and-limits.md)。无需新增环境变量，继续使用持久数据库。

## 口令保护的测试工具

后端 Environment 可设置 `PILOT_TEST_ACCESS_CODE`（至少 12 字符，留空关闭），不要放入前端变量或 Git。前后端一起更新，使用方式见 [测试工具](docs/testing-tools.md)。

## 一人模拟测试

沿用测试口令，前后端一起更新。模拟队友由 API 单进程内的后台循环运行，维持单实例与单 worker，使用方式与隔离规则见 [模拟队友](docs/simulated-peers.md)。


## 招募分享、预约与运营管理

配置后端 PILOT_METRICS_TOKEN（至少 32 字符随机值），用于页面底部运营管理；不要写入前端环境变量

生产安装当前 requirements.txt，旧演示接口和旧 JWT/OCR/支付依赖不在当前产品支持范围

新表自动建立，请先备份持久数据库，保持单实例运行

功能说明见 docs/growth-features.md，安全和三人改造评估见 docs/security-and-three-player-review.md
