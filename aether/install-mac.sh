#!/usr/bin/env bash
set -euo pipefail

AETHER_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$AETHER_DIR/.." && pwd)"
APP_PATH="${ANTIGRAVITY_APP_PATH:-/Applications/Antigravity.app}"
DEV_APP="${AETHER_DEV_APP:-$(dirname "$ROOT_DIR")/Antigravity-Dev.app}"

if [[ "${1:-}" == "--clean-dev" ]] || [[ "${CLEAN_DEV:-0}" == "1" ]]; then
  echo "0/5 清理调试版 Antigravity-Dev.app..."
  pkill -f "Antigravity-Dev.app/Contents/MacOS/Antigravity" 2>/dev/null || true
  rm -rf "$DEV_APP"
fi

echo "1/5 清理旧的外置 watch 守护进程与自启项..."
cd "$ROOT_DIR"
node cli.js stop-watch >/dev/null 2>&1 || true
node cli.js autostart:disable >/dev/null 2>&1 || true

echo "2/5 版本安全校验并准备纯净原版 app.asar（官方升级后会自动刷新备份）..."
ANTIGRAVITY_APP_PATH="$APP_PATH" node "$AETHER_DIR/patch-aether.js" --prepare-clean

echo "3/5 持久化内置 Aether Telemetry Cockpit（上下文与用量监控）..."
cd "$ROOT_DIR"
node cli.js install --force-mac-asar --disk-only --path "$APP_PATH/Contents/Resources/app.asar"

echo "4/5 叠加内置 Aether Studio（Claude 配色 + 字体体系 + Orbital 启动页 + 原生设置面板）..."
ANTIGRAVITY_APP_PATH="$APP_PATH" node "$AETHER_DIR/patch-aether.js" --on-current

echo "5/5 执行 macOS 本地自签名并启动 Antigravity..."
xattr -cr "$APP_PATH"
codesign --force --deep --sign - "$APP_PATH"
open -a "$APP_PATH"

echo "✅ Aether 安装完成！以后每次直接打开 Antigravity 都会自动生效。"
