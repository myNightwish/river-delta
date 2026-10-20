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
