#!/usr/bin/env bash
set -euo pipefail

AETHER_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$AETHER_DIR/.." && pwd)"
DEV_APP="${AETHER_DEV_APP:-$(dirname "$ROOT_DIR")/Antigravity-Dev.app}"
DEV_DATA="${AETHER_DEV_DATA:-$(dirname "$ROOT_DIR")/ag-dev-userdata}"
DEV_PORT="${AETHER_DEV_PORT:-59321}"

# Kill ONLY the isolated Antigravity-Dev.app instance (never touches /Applications/Antigravity.app)
DEV_PIDS=$(pgrep -f "Antigravity-Dev\.app/Contents/MacOS/Antigravity" || true)
if [ -n "$DEV_PIDS" ]; then
  kill $DEV_PIDS 2>/dev/null || true
  for _ in 1 2 3 4 5; do
    pgrep -f "Antigravity-Dev\.app/Contents/MacOS/Antigravity" >/dev/null || break
    sleep 0.5
  done
  pkill -9 -f "Antigravity-Dev\.app/" 2>/dev/null || true
  sleep 0.5
fi

cd "$ROOT_DIR"
npm run build:renderer

if [ ! -d "$DEV_APP" ]; then
  cp -cR /Applications/Antigravity.app "$DEV_APP"
fi
if [ -f "$DEV_APP/Contents/Resources/app.asar.bak" ]; then
  cp "$DEV_APP/Contents/Resources/app.asar.bak" "$DEV_APP/Contents/Resources/app.asar"
fi

node cli.js install --force-mac-asar --disk-only --path "$DEV_APP/Contents/Resources/app.asar"
ANTIGRAVITY_APP_PATH="$DEV_APP" node "$AETHER_DIR/patch-aether.js" --on-current
xattr -cr "$DEV_APP"
codesign --force --deep --sign - "$DEV_APP"

mkdir -p "$DEV_DATA"
open -n "$DEV_APP" --args --user-data-dir="$DEV_DATA" --remote-debugging-port="$DEV_PORT"
echo "✅ Antigravity-Dev.app 已重启并监听 CDP 端口 ${DEV_PORT}（主 Antigravity 未受影响）。"
