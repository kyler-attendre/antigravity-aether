#!/usr/bin/env node
'use strict';

/**
 * Aether Studio ASAR Assembler & CLI.
 * Composes modular renderer engines (theme-engine, boot-screen, settings-appearance)
 * cleanly into Antigravity's dist/preload.js with version-safe backup management.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const { builtinAsar, collectUnpackedPaths, getStateDir } = require(path.join(__dirname, '..', 'asar-engine.js'));
const { buildThemeEngineSource } = require(path.join(__dirname, 'modules', 'theme-engine.js'));
const { buildBootScreenSource } = require(path.join(__dirname, 'modules', 'boot-screen.js'));
const { buildSettingsAppearanceSource } = require(path.join(__dirname, 'modules', 'settings-appearance.js'));

const APP_PATH = process.env.ANTIGRAVITY_APP_PATH || '/Applications/Antigravity.app';
const RESOURCES_DIR = path.join(APP_PATH, 'Contents', 'Resources');
const ASAR_PATH = path.join(RESOURCES_DIR, 'app.asar');
const BAK_PATH = path.join(RESOURCES_DIR, 'app.asar.bak');
const THEME_CSS_PATH = path.join(__dirname, 'claude-theme.css');

const MARKER_START = '// === AETHER_STUDIO_START ===';
const MARKER_END = '// === AETHER_STUDIO_END ===';

function buildRendererPayload(themeCss) {
  return `
${MARKER_START}
(function() {
  if (window.__AETHER_STUDIO_LOADED__) return;
  window.__AETHER_STUDIO_LOADED__ = true;

${buildThemeEngineSource(themeCss)}

${buildBootScreenSource()}

${buildSettingsAppearanceSource()}

  function boot() {
    applyTheme();
    if (prefs.bootMode !== 'off') {
      showBootSplash(prefs.bootMode, false);
    }
    ensureAppearanceSettings();
    let queued = false;
    const obs = new MutationObserver(() => {
      if (prefs.themeStyle !== 'original' && !document.getElementById(STYLE_ID)) {
        applyTheme();
      }
      if (queued || !document.querySelector('[role="dialog"]')) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        ensureAppearanceSettings();
      });
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
${MARKER_END}
`.trim();
}

function readAsarPkgVersion(asarFile) {
  try {
    const raw = builtinAsar.extractFile(asarFile, 'package.json').toString('utf8');
    return JSON.parse(raw).version || null;
  } catch {
    return null;
  }
}

function isPatchedAsar(asarFile) {
  try {
    const preload = builtinAsar.extractFile(asarFile, 'dist/preload.js').toString('utf8');
    return preload.includes(MARKER_START)
      || preload.includes('AG_BUILTIN_CLAUDE_THEME_START')
      || preload.includes('Antigravity 2.0 Chinese Localization Engine')
      || preload.includes('contextMeterAPI');
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--prepare-clean')) {
    const curVer = readAsarPkgVersion(ASAR_PATH);
    if (!isPatchedAsar(ASAR_PATH)) {
      fs.copyFileSync(ASAR_PATH, BAK_PATH);
      console.log(`📦 检测到纯净官方原版 (v${curVer || 'unknown'})，已更新备份 app.asar.bak。`);
      return;
    }
    if (fs.existsSync(BAK_PATH)) {
      const bakVer = readAsarPkgVersion(BAK_PATH);
      if (!curVer || !bakVer || curVer === bakVer) {
        fs.copyFileSync(BAK_PATH, ASAR_PATH);
        console.log(`✅ 已从同版本纯净备份 (v${bakVer || 'unknown'}) 还原原版 app.asar。`);
        return;
      }
      console.log(`⚠️ 备份版本 (v${bakVer}) 与当前客户端 (v${curVer}) 不一致，跳过旧备份还原。`);
    }
    return;
  }

  if (args.includes('--restore')) {
    if (!fs.existsSync(BAK_PATH)) {
      throw new Error('未找到原始备份 app.asar.bak，无法还原。');
    }
    fs.copyFileSync(BAK_PATH, ASAR_PATH);
    console.log('✅ 已从 app.asar.bak 还原纯净官方原版 app.asar。');
    return;
  }

  if (!fs.existsSync(THEME_CSS_PATH)) {
    throw new Error('找不到 claude-theme.css: ' + THEME_CSS_PATH);
  }
  const themeCss = fs.readFileSync(THEME_CSS_PATH, 'utf8');
  const payload = buildRendererPayload(themeCss);

  let sourceAsar = ASAR_PATH;
  if (!args.includes('--on-current') && fs.existsSync(BAK_PATH)) {
    const bakBuf = fs.readFileSync(BAK_PATH);
    if (!bakBuf.includes('Antigravity 2.0 Chinese Localization Engine')) {
      sourceAsar = BAK_PATH;
      console.log('📦 使用纯净官方原版备份 app.asar.bak 作为底包...');
    }
  } else if (args.includes('--on-current')) {
    console.log('📦 基于当前 app.asar 叠加注入 Aether Studio...');
  } else {
    const curBuf = fs.readFileSync(ASAR_PATH);
    if (!curBuf.includes('Antigravity 2.0 Chinese Localization Engine') && !curBuf.includes(MARKER_START)) {
      fs.copyFileSync(ASAR_PATH, BAK_PATH);
      console.log('📦 已备份纯净原版至 app.asar.bak。');
    }
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aether-studio-'));
  const extractDir = path.join(tmpDir, 'extracted');
  const stageAsar = path.join(tmpDir, 'app.asar.new');

  try {
    console.log('📂 正在解包 app.asar...');
    builtinAsar.extractAll(sourceAsar, extractDir);

    const preloadPath = path.join(extractDir, 'dist', 'preload.js');
    if (!fs.existsSync(preloadPath)) {
      throw new Error('找不到 dist/preload.js');
    }

    let preload = fs.readFileSync(preloadPath, 'utf8');
    for (const [mStart, mEnd] of [
      [MARKER_START, MARKER_END],
      ['// === AG_BUILTIN_CLAUDE_THEME_START ===', '// === AG_BUILTIN_CLAUDE_THEME_END ==='],
    ]) {
      const s = preload.indexOf(mStart);
      if (s !== -1) {
        const e = preload.indexOf(mEnd, s);
        if (e !== -1) preload = preload.slice(0, s) + preload.slice(e + mEnd.length);
      }
    }
    preload = preload.trimEnd() + '\n\n' + payload + '\n';
    fs.writeFileSync(preloadPath, preload, 'utf8');
    console.log('✨ 已组装写入模块化 Aether Studio（theme-engine + boot-screen + settings-appearance）。');

    const unpackedPaths = collectUnpackedPaths(builtinAsar, sourceAsar);
    console.log('📦 正在重新打包 app.asar...');
    if (unpackedPaths.size > 0) {
      await builtinAsar.createPackageWithOptions(extractDir, stageAsar, { unpackedPaths });
    } else {
      await builtinAsar.createPackageWithOptions(extractDir, stageAsar, {});
    }

    if (args.includes('--dry-run')) {
      const vm = require('vm');
      const packedPreload = builtinAsar.extractFile(stageAsar, 'dist/preload.js').toString('utf8');
      new vm.Script(packedPreload);
      console.log('✅ DRY RUN 成功！app.asar 打包有效，preload.js 语法校验通过，体积:', fs.statSync(stageAsar).size, 'bytes');
      return;
    }

    fs.copyFileSync(stageAsar, ASAR_PATH);
    try {
      const stateDir = getStateDir();
      fs.mkdirSync(stateDir, { recursive: true });
      fs.writeFileSync(
        path.join(stateDir, 'aether-paths.json'),
        JSON.stringify({
          upgradeScript: path.join(__dirname, 'upgrade-mac.sh'),
          installScript: path.join(__dirname, 'install-mac.sh'),
          updatedAt: new Date().toISOString()
        }, null, 2),
        'utf8'
      );
    } catch {}
    console.log('✅ 已成功写入 ' + ASAR_PATH);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error('❌ 失败:', err.message);
  process.exit(1);
});
