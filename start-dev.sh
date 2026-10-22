#!/bin/bash
# Run from the canonical sibling Git repositories; keep both processes attached.
set -euo pipefail
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$APP_DIR/../delta-force-match-server"
if lsof -iTCP:8011 -sTCP:LISTEN >/dev/null 2>&1 || lsof -iTCP:5188 -sTCP:LISTEN >/dev/null 2>&1; then
  echo '8011 或 5188 已有服务运行，请检查并复用'
  exit 1
fi
if [ ! -x "$BACKEND/.venv/bin/python" ]; then
  PILOT_PYTHON=""
  for candidate in python3.12 python3.11 python3.13 python3.14 python3; do
    if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c 'import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)'; then
      PILOT_PYTHON="$candidate"
      break
    fi
  done
  if [ -z "$PILOT_PYTHON" ]; then
    echo '请安装 Python 3.10 或更新版本，建议使用 3.12'
    exit 1
  fi
  "$PILOT_PYTHON" -m venv "$BACKEND/.venv"
  "$BACKEND/.venv/bin/python" -m pip install -r "$BACKEND/requirements.txt"
fi
if [ ! -d "$APP_DIR/node_modules" ]; then
  (cd "$APP_DIR" && npm ci --no-audit --no-fund)
fi
(cd "$BACKEND" && exec .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8011) &
API_PID=$!
(cd "$APP_DIR" && exec npm run dev:h5) &
WEB_PID=$!
trap 'kill "$API_PID" "$WEB_PID" 2>/dev/null || true' EXIT INT TERM
printf '页面：http://127.0.0.1:5188/\n后端：http://127.0.0.1:8011/health\n'
wait
