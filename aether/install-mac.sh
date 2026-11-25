#!/usr/bin/env bash
set -euo pipefail

AETHER_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$AETHER_DIR/.." && pwd)"
APP_PATH="${ANTIGRAVITY_APP_PATH:-/Applications/Antigravity.app}"

echo "1/5 清理旧的外置 watch 守护进程与自启项..."
cd "$ROOT_DIR"
node cli.js stop-watch >/dev/null 2>&1 || true
node cli.js autostart:disable >/dev/null 2>&1 || true

echo "2/5 还原纯净原版 app.asar（若已有备份）..."
if [ -f "$APP_PATH/Contents/Resources/app.asar.bak" ]; then
  node "$AETHER_DIR/patch-aether.js" --restore
fi

echo "3/5 持久化内置 Aether Telemetry Cockpit（上下文与用量监控）..."
cd "$ROOT_DIR"
node cli.js install --force-mac-asar --disk-only

echo "4/5 叠加内置 Aether Studio（Claude 配色 + 字体体系 + Orbital 启动页 + 原生设置面板）..."
node "$AETHER_DIR/patch-aether.js" --on-current

echo "5/5 执行 macOS 本地自签名并启动 Antigravity..."
xattr -cr "$APP_PATH"
codesign --force --deep --sign - "$APP_PATH"
open -a "$APP_PATH"

echo "✅ Aether 安装完成！以后每次直接打开 Antigravity 都会自动生效，无需后台守护进程。"
