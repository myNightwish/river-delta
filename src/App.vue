<script>
export default {
  onLaunch() {},
}
</script>

<style>
/* ===== 设计语言：森绿 × 行动橙 × 米纸（复刻自演示页 space-2）===== */
page {
  --bg: #f3f0e8;
  --panel: #fffdf7;
  --panel-2: #ebe7dc;
  --ink: #172018;
  --muted: #5d675f;
  --line: #c9c9be;
  --green: #1b4d3e;
  --green-2: #286952;
  --orange: #eb5d27;
  --orange-2: #ff7845;
  --cyan: #0d7180;
  --yellow: #f5c647;
  --danger: #b5332b;
  --hard: #2b231e;
  background-color: var(--bg);
  /* 32px 纸质网格纹理 */
  background-image: linear-gradient(rgba(30, 61, 48, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30, 61, 48, 0.06) 1px, transparent 1px);
  background-size: 64rpx 64rpx;
  color: var(--ink);
  font-size: 28rpx;
  font-family: 'Noto Sans SC', -apple-system, sans-serif;
}

.display {
  font-family: 'Barlow Condensed', 'Noto Sans SC', sans-serif;
  letter-spacing: 0.02em;
}

.eyebrow {
  font-size: 24rpx;
  font-weight: 800;
  letter-spacing: 6rpx;
  color: var(--orange);
}

/* 卡片：暖白 + 1px 描边 + 柔光阴影，零圆角 */
.card {
  background: var(--panel);
  border: 2rpx solid var(--line);
  border-radius: 0;
  box-shadow: 0 18rpx 45rpx rgba(26, 36, 29, 0.12);
  padding: 32rpx;
  margin: 20rpx;
}
.card-flat {
  background: var(--panel);
  border: 2rpx solid var(--line);
  border-radius: 0;
  padding: 24rpx;
  margin: 20rpx;
}

/* 按钮：主按钮 行动橙 + 硬阴影 */
button {
  border-radius: 0;
  font-size: 28rpx;
}
button::after {
  border: none;
  border-radius: 0;
}
.btn-primary {
  background: var(--orange);
  color: #1e120c;
  font-weight: 800;
  border-radius: 0;
  box-shadow: 8rpx 8rpx 0 var(--hard);
  transition: transform 0.08s, box-shadow 0.08s;
}
.btn-primary:active {
  transform: translate(4rpx, 4rpx);
  box-shadow: 4rpx 4rpx 0 var(--hard);
}
.btn-secondary {
  background: transparent;
  color: var(--ink);
  border: 2rpx solid var(--line);
  border-radius: 0;
}
.btn-ghost-orange {
  background: transparent;
  color: var(--orange);
  border: 2rpx solid var(--orange);
  border-radius: 0;
  font-weight: 700;
}
.btn-warn {
  background: var(--panel-2);
  color: var(--danger);
  border: 2rpx solid var(--line);
  border-radius: 0;
}

/* 标签 */
.tag {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 0;
  background: var(--panel-2);
  color: var(--muted);
  margin-right: 10rpx;
  border: 2rpx solid transparent;
}
.chip {
  font-size: 24rpx;
  padding: 10rpx 24rpx;
  border: 2rpx solid var(--line);
  border-radius: 0;
  background: var(--panel);
  color: var(--ink);
  margin-right: 12rpx;
}
.chip-on {
  background: var(--green-2);
  color: #fff;
  border-color: var(--green-2);
}
.demo-tag {
  font-size: 22rpx;
  font-weight: 800;
  background: var(--yellow);
  color: var(--ink);
  padding: 6rpx 14rpx;
  border-radius: 0;
  box-shadow: 6rpx 6rpx 0 #1d2c24;
}

/* 输入框：零圆角 1px 描边 */
.input {
  background: var(--panel);
  border: 2rpx solid var(--line);
  border-radius: 0;
  padding: 20rpx;
  margin: 12rpx 0;
  color: var(--ink);
}
.input:focus {
  border-color: var(--green-2);
}

/* LIVE 状态条：黑底 + 黄色标签 */
.live-strip {
  background: var(--ink);
  color: #f3f1e8;
  margin: 20rpx;
  padding: 20rpx 28rpx;
  display: flex;
  align-items: center;
  border-radius: 0;
}
.live-tag {
  background: var(--yellow);
  color: var(--ink);
  font-weight: 800;
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  margin-right: 16rpx;
  border-radius: 0;
}
.live-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: var(--yellow);
  margin-right: 12rpx;
  animation: pulse 1.6s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

/* KD：隐藏 vs 解锁 */
.kd-locked {
  color: var(--muted);
  font-size: 24rpx;
}
.kd-open {
  color: var(--green-2);
  font-weight: 800;
}

/* 双岛大卡片 */
.island-card {
  flex: 1;
  padding: 36rpx 28rpx;
  border-radius: 0;
  border: 2rpx solid var(--line);
  position: relative;
  overflow: hidden;
}
.island-card .island-index {
  position: absolute;
  right: 12rpx;
  top: 0;
  font-size: 96rpx;
  font-weight: 800;
  opacity: 0.18;
  color: #fff;
}
.island-card .island-name {
  font-size: 52rpx;
  font-weight: 800;
  color: #fff;
}
.island-card .island-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 8rpx;
}
.island-tech { background: var(--cyan); }
.island-fun { background: var(--orange); }
.island-card.island-active {
  box-shadow: 8rpx 8rpx 0 var(--hard);
}
.island-card:not(.island-active) {
  opacity: 0.55;
}

/* 二分段切换：选中黑底白字 */
.seg {
  display: flex;
  border: 2rpx solid var(--line);
  background: var(--panel);
  border-radius: 0;
  margin: 0 20rpx;
}
.seg-item {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  font-weight: 700;
  color: var(--muted);
}
.seg-on {
  background: var(--ink);
  color: #fff;
}

/* 票据：深绿底 + 超大价格 */
.ticket {
  background: var(--green);
  color: #f3f1e8;
  margin: 20rpx;
  padding: 36rpx 32rpx;
  border-radius: 0;
  position: relative;
  overflow: hidden;
}
.ticket-price {
  font-size: 120rpx;
  font-weight: 800;
  line-height: 1;
  color: #fff;
}
.ticket-watermark {
  position: absolute;
  right: 16rpx;
  bottom: 8rpx;
  font-size: 28rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
  opacity: 0.25;
  color: #fff;
}

/* 房间码卡片 */
.roomcode-card {
  border: 2rpx solid var(--orange);
  background: var(--panel);
  border-radius: 0;
  padding: 24rpx;
  margin: 12rpx 0;
}

/* 布局 */
.row { display: flex; align-items: center; }
.between { justify-content: space-between; }
.muted { color: var(--muted); font-size: 24rpx; }
.h2 { font-size: 36rpx; font-weight: 800; }
.section-title { margin: 28rpx 20rpx 8rpx; }

/* ===== 5 步进度条（复刻演示页 steps）===== */
.steps-bar {
  display: flex;
  align-items: flex-start;
  padding: 20rpx 24rpx 8rpx;
}
.step-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.step-item::before {
  content: '';
  position: absolute;
  top: 14rpx;
  left: -50%;
  width: 100%;
  height: 4rpx;
  background: var(--line);
  z-index: 0;
}
.step-item:first-child::before { display: none; }
.step-item.step-done::before { background: var(--green-2); }
.step-dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: var(--panel-2);
  border: 2rpx solid var(--line);
  z-index: 1;
}
.step-item.step-active .step-dot {
  background: var(--orange);
  border-color: var(--orange);
  box-shadow: 0 0 16rpx rgba(235, 93, 39, 0.8);
  animation: pulse 1.6s infinite;
}
.step-item.step-done .step-dot { background: var(--green-2); border-color: var(--green-2); }
.step-label { font-size: 20rpx; color: var(--muted); margin-top: 8rpx; }
.step-item.step-active .step-label { color: var(--ink); font-weight: 700; }

/* ===== 弹窗（演示页 modal：深色遮罩 + 顶部橙边）===== */
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(23, 32, 24, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
  padding: 40rpx;
}
.modal-card {
  background: var(--panel);
  border-radius: 0;
  border-top: 10rpx solid var(--orange);
  box-shadow: 0 18rpx 45rpx rgba(26, 36, 29, 0.25);
  padding: 40rpx 32rpx;
  width: 100%;
}

/* ===== 顶部 utility 条 ===== */
.utility-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 20rpx;
}
.utility-link {
  font-size: 24rpx;
  color: var(--muted);
  text-decoration: underline;
  margin-left: 20rpx;
}

/* ===== 双岛屿卡片 footer 箭头 ===== */
.circle-arrow {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 36rpx;
  font-weight: 800;
}

/* ===== 聊天 ===== */
.chat-shell { display: flex; margin: 20rpx; }
.chat-side {
  width: 260rpx;
  flex-shrink: 0;
  background: var(--panel);
  border: 2rpx solid var(--line);
  border-radius: 0;
  padding: 28rpx 20rpx;
  margin-right: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chat-main {
  flex: 1;
  background: var(--panel);
  border: 2rpx solid var(--line);
  border-radius: 0;
  display: flex;
  flex-direction: column;
  min-height: 70vh;
}
.chat-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  border-bottom: 2rpx solid var(--line);
}
.msg { max-width: 78%; padding: 16rpx 20rpx; border-radius: 0; margin-bottom: 6rpx; }
.msg-them { background: var(--panel-2); align-self: flex-start; }
.msg-me { background: var(--green-2); color: #fff; align-self: flex-end; }
.msg-time { font-size: 18rpx; color: var(--muted); margin-bottom: 16rpx; }
.msg-row { display: flex; flex-direction: column; }
.room-share {
  display: flex;
  align-items: center;
  border-top: 2rpx solid var(--line);
  padding: 16rpx 24rpx;
}

/* ===== 票据/成功横幅 ===== */
.success-hero {
  background: var(--green);
  color: #f3f1e8;
  margin: 20rpx;
  padding: 32rpx;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.avatar-group { display: flex; }
.avatar-circle {
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  background: var(--panel-2);
  border: 2rpx solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  font-weight: 800;
  color: var(--ink);
  margin-left: -16rpx;
}
.avatar-circle:first-child { margin-left: 0; }
.avatar-sm { width: 72rpx; height: 72rpx; font-size: 32rpx; }
.note-yellow {
  border-left: 8rpx solid var(--yellow);
  background: var(--panel);
  border-top: 2rpx solid var(--line);
  border-right: 2rpx solid var(--line);
  border-bottom: 2rpx solid var(--line);
  padding: 20rpx 24rpx;
  margin: 20rpx;
  border-radius: 0;
}

/* ===== OCR 结果区 ===== */
.stat-grid { display: flex; flex-wrap: wrap; margin: 0 -8rpx; }
.stat-cell {
  width: 50%;
  padding: 8rpx;
  box-sizing: border-box;
}
.stat-box {
  background: var(--panel-2);
  border: 2rpx solid var(--line);
  border-radius: 0;
  padding: 20rpx;
  text-align: center;
}
.stat-num { font-size: 44rpx; font-weight: 800; }
.kv-list { margin-top: 12rpx; }
.kv-row {
  display: flex;
  justify-content: space-between;
  padding: 14rpx 0;
  border-bottom: 2rpx solid var(--line);
  font-size: 26rpx;
}
.drop-zone {
  border: 3rpx dashed var(--line);
  border-radius: 0;
  padding: 60rpx 20rpx;
  text-align: center;
  background: var(--panel);
  margin: 16rpx 0;
}
.divider-or {
  display: flex;
  align-items: center;
  color: var(--muted);
  font-size: 24rpx;
  margin: 16rpx 0;
}
.divider-or::before, .divider-or::after {
  content: '';
  flex: 1;
  height: 2rpx;
  background: var(--line);
}
.divider-or::before { margin-right: 16rpx; }
.divider-or::after { margin-left: 16rpx; }

/* ===== 动效：对齐演示页精细化（卡片入场 / LIVE 扫光 / 按钮高光）===== */
@keyframes rise-in {
  from { opacity: 0; transform: translateY(28rpx); }
  to { opacity: 1; transform: translateY(0); }
}
.anim-rise {
  animation: rise-in 0.45s cubic-bezier(0.22, 0.9, 0.3, 1) both;
}
.anim-rise-1 { animation-delay: 0.06s; }
.anim-rise-2 { animation-delay: 0.12s; }
.anim-rise-3 { animation-delay: 0.18s; }

/* LIVE 标签扫光 */
.live-tag {
  position: relative;
  overflow: hidden;
}
.live-tag::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60rpx;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  animation: shimmer 2.8s ease-in-out infinite;
  border: none;
}
@keyframes shimmer {
  0% { left: -70rpx; }
  55%, 100% { left: 110%; }
}

/* 主按钮高光扫过 */
.btn-primary {
  position: relative;
  overflow: hidden;
}
.btn-primary::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 90rpx;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  animation: shimmer 4.2s ease-in-out infinite;
  border: none !important;
}

/* 尊重系统"减少动态效果" */
@media (prefers-reduced-motion: reduce) {
  .anim-rise,
  .live-tag::after,
  .btn-primary::after,
  .live-dot {
    animation: none !important;
  }
}
</style>
