#!/bin/bash
# 联调一键启动：后端 FastAPI + 前端 uni-app H5
set -e
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$APP_DIR/../delta-force-match-server"

# 选 Python：优先 3.12/3.11（依赖兼容性最稳），都没有才用 python3
pick_python() {
  for p in python3.12 python3.11 python3; do
    if command -v "$p" >/dev/null 2>&1; then echo "$p"; return; fi
  done
  echo "python3"
}
PY=$(pick_python)
echo "使用 Python: $("$PY" --version 2>&1)"

if [ ! -d "$BACKEND/.venv" ]; then
  echo "创建后端虚拟环境…"
  "$PY" -m venv "$BACKEND/.venv"
fi
echo "安装后端依赖…"
if ! "$BACKEND/.venv/bin/pip" install -r "$BACKEND/requirements.txt"; then
  echo ""
  echo "依赖安装失败：请把上面以 ERROR 开头的几行发给我，我来修。"
  exit 1
fi

echo "启动后端 :8000 …"
(cd "$BACKEND" && PYTHONPATH="$BACKEND" nohup "$BACKEND/.venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000 --reload > /tmp/delta-api.log 2>&1 &)
sleep 3
curl -s http://127.0.0.1:8000/health && echo "  <- 后端 OK"

echo "启动前端 H5 …"
if [ ! -d "$APP_DIR/node_modules" ]; then
  echo "安装前端依赖（第一次较慢）…"
  (cd "$APP_DIR" && npm install --no-audit --no-fund)
fi
(cd "$APP_DIR" && nohup ./node_modules/.bin/uni -p h5 > /tmp/delta-h5.log 2>&1 &)
echo "等 20 秒后打开 http://localhost:5173 开始联调"
echo "日志：/tmp/delta-api.log /tmp/delta-h5.log"
