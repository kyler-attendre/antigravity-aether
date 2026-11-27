#!/usr/bin/env bash
set -euo pipefail

# Truly one-click macOS Antigravity official updater + automatic Aether re-installer.
# Usage:
#   ./aether/upgrade-mac.sh           # Auto-check, download official Antigravity, verify SHA-512, upgrade & re-apply Aether
#   ./aether/upgrade-mac.sh --check   # Check local vs latest official version only (no changes)
#   ./aether/upgrade-mac.sh --force   # Re-download & reinstall even if already on latest version

AETHER_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_PATH="${ANTIGRAVITY_APP_PATH:-/Applications/Antigravity.app}"
CHECK_ONLY=0
FORCE=0

for arg in "$@"; do
  case "$arg" in
    --check) CHECK_ONLY=1 ;;
    --force) FORCE=1 ;;
  esac
done

ARCH="$(uname -m)"
if [ "$ARCH" = "arm64" ]; then
  MANIFEST_URL="https://antigravity-hub-auto-updater-974169037036.us-central1.run.app/manifest/latest-arm64-mac.yml?noCache=$(date +%s)"
else
  MANIFEST_URL="https://antigravity-hub-auto-updater-974169037036.us-central1.run.app/manifest/latest-x64-mac.yml?noCache=$(date +%s)"
fi

LOCAL_VER="none"
if [ -f "$APP_PATH/Contents/Info.plist" ]; then
  LOCAL_VER="$(defaults read "$APP_PATH/Contents/Info.plist" CFBundleShortVersionString 2>/dev/null || echo 'unknown')"
fi

echo "🔍 正在检查 Google Antigravity 官方最新版本 ($ARCH)..."
MANIFEST="$(curl -fsSL "$MANIFEST_URL")"

PARSED="$(node -e '
const yml = process.argv[1] || "";
const ver = (yml.match(/^version:\s*([^\s]+)/m) || [])[1] || "";
const url = (yml.match(/url:\s*(https:\/\/[^\s]+)/m) || [])[1] || "";
const sha512 = (yml.match(/sha512:\s*([^\s]+)/m) || [])[1] || "";
if (!ver || !url || !sha512) process.exit(1);
console.log([ver, url, sha512].join("\n"));
' "$MANIFEST")"

LATEST_VER="$(echo "$PARSED" | sed -n '1p')"
ZIP_URL="$(echo "$PARSED" | sed -n '2p')"
EXPECTED_SHA512="$(echo "$PARSED" | sed -n '3p')"

echo "   本地版本: v$LOCAL_VER"
echo "   官方最新: v$LATEST_VER"

if [ "$CHECK_ONLY" -eq 1 ]; then
  if [ "$LOCAL_VER" = "$LATEST_VER" ]; then
    echo "✅ 已是官方最新版本。"
  else
    echo "⬆️  发现新版本 v${LATEST_VER}，退出 Antigravity 后运行以下一键命令即可自动更新并重装 Aether："
    echo "   $AETHER_DIR/upgrade-mac.sh"
  fi
  exit 0
fi

if [ "$LOCAL_VER" = "$LATEST_VER" ] && [ "$FORCE" -eq 0 ]; then
  echo "✅ 已是官方最新版本 v$LATEST_VER，直接重新应用最新 Aether..."
  exec "$AETHER_DIR/install-mac.sh"
fi

if pgrep -f "$APP_PATH/Contents/MacOS/Antigravity" >/dev/null 2>&1; then
  echo "⚠️  检测到主 Antigravity 正在运行。请先按 Cmd+Q 完全退出 Antigravity，然后再运行本命令。"
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT
ZIP_FILE="$TMP_DIR/Antigravity.zip"
EXTRACT_DIR="$TMP_DIR/extracted"

echo "⬇️  1/4 正在从 Google 官方服务器下载 Antigravity v$LATEST_VER ..."
curl -fL --progress-bar "$ZIP_URL" -o "$ZIP_FILE"

echo "🔐 2/4 正在校验官方 SHA-512 完整性..."
node -e '
const fs = require("fs");
const crypto = require("crypto");
const actual = crypto.createHash("sha512").update(fs.readFileSync(process.argv[1])).digest("base64");
if (actual !== process.argv[2]) {
  console.error("❌ SHA-512 校验失败！已中止更新。");
  process.exit(1);
}
console.log("✅ SHA-512 校验通过。");
' "$ZIP_FILE" "$EXPECTED_SHA512"

echo "📦 3/4 正在解压并覆盖安装到 $APP_PATH ..."
mkdir -p "$EXTRACT_DIR"
ditto -xk "$ZIP_FILE" "$EXTRACT_DIR"
if [ ! -d "$EXTRACT_DIR/Antigravity.app" ]; then
  echo "❌ 解压结果中未找到 Antigravity.app"
  exit 1
fi

BACKUP_APP="$TMP_DIR/Antigravity.old.app"
if [ -d "$APP_PATH" ]; then
  mv "$APP_PATH" "$BACKUP_APP"
fi
if ! mv "$EXTRACT_DIR/Antigravity.app" "$APP_PATH"; then
  [ -d "$BACKUP_APP" ] && mv "$BACKUP_APP" "$APP_PATH"
  echo "❌ 替换 $APP_PATH 失败，已回滚原版本。"
  exit 1
fi

echo "✨ 4/4 官方 v$LATEST_VER 安装完成，正在自动重新内置全套 Aether ..."
"$AETHER_DIR/install-mac.sh"
