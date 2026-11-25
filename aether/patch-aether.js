#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { builtinAsar, collectUnpackedPaths } = require(path.join(__dirname, '..', 'asar-engine.js'));

const APP_PATH = process.env.ANTIGRAVITY_APP_PATH || '/Applications/Antigravity.app';
const RESOURCES_DIR = path.join(APP_PATH, 'Contents', 'Resources');
const ASAR_PATH = path.join(RESOURCES_DIR, 'app.asar');
const BAK_PATH = path.join(RESOURCES_DIR, 'app.asar.bak');
const THEME_CSS_PATH = path.join(__dirname, 'claude-theme.css');

const MARKER_START = '// === AETHER_STUDIO_START ===';
const MARKER_END = '// === AETHER_STUDIO_END ===';

// Extra typography presets on top of claude-theme.css
const AETHER_FONT_OVERRIDES_CSS = `
/* Aether Extended Typography Presets */
html[data-ag-latin="modern"]:has(> body) {
  --ag-latin-ui: 'Anthropic Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue';
  --ag-latin-read: 'Anthropic Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue';
  --ag-latin-mono: 'JetBrains Mono', 'SF Mono', Menlo, Consolas;
  --ag-latin-input: 'Anthropic Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text';
}
html[data-ag-cjk="songti"]:has(> body) {
  --ag-cjk: 'Songti SC', 'Noto Serif SC', 'Source Han Serif SC', 'STSong', 'PingFang SC';
  --ag-cjk-mono: 'PingFang SC', 'Hiragino Sans GB';
}
`.trim();

function buildRendererPayload(themeCss) {
  const fullCss = themeCss + '\n\n' + AETHER_FONT_OVERRIDES_CSS;
  return `
${MARKER_START}
(function() {
  if (window.__AETHER_STUDIO_LOADED__) return;
  window.__AETHER_STUDIO_LOADED__ = true;

  const STYLE_ID = 'aether-theme-style';
  const STYLE_ROW_ID = 'aether-style-row';
  const FONT_ROW_ID = 'aether-font-row';
  const SPLASH_ROW_ID = 'aether-boot-row';
  const THEME_CSS = ${JSON.stringify(fullCss)};

  const LS_STYLE  = 'aether_theme_style';   // 'clay' | 'classic' | 'original'
  const LS_LATIN  = 'aether_latin_font';    // 'claude' | 'modern' | 'system'
  const LS_CJK    = 'aether_cjk_font';      // 'wenkai' | 'system' | 'songti'
  const LS_SPLASH = 'aether_boot_mode';     // 'orbital' | 'minimal' | 'off'

  function readPref(key, valid, fallback) {
    try {
      const v = localStorage.getItem(key);
      if (v && valid.includes(v)) return v;
    } catch {}
    return fallback;
  }

  function savePref(key, val) {
    try { localStorage.setItem(key, val); } catch {}
  }

  let prefs = {
    themeStyle: readPref(LS_STYLE, ['clay', 'classic', 'original'], 'clay'),
    latinFont: readPref(LS_LATIN, ['claude', 'modern', 'system'], 'claude'),
    cjkFont: readPref(LS_CJK, ['wenkai', 'system', 'songti'], 'wenkai'),
    bootMode: readPref(LS_SPLASH, ['orbital', 'minimal', 'off'], 'orbital'),
  };

  function applyTheme() {
    if (!document || !document.documentElement) return;
    const root = document.documentElement;
    let el = document.getElementById(STYLE_ID);

    if (prefs.themeStyle === 'original') {
      if (el) el.remove();
      root.removeAttribute('data-ag-style');
      root.removeAttribute('data-ag-latin');
      root.removeAttribute('data-ag-cjk');
      return;
    }

    root.setAttribute('data-ag-style', prefs.themeStyle);
    root.setAttribute('data-ag-latin', prefs.latinFont);
    root.setAttribute('data-ag-cjk', prefs.cjkFont);

    if (!document.head) return;
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    if (el.textContent !== THEME_CSS) {
      el.textContent = THEME_CSS;
    }
  }

  /**
   * Aether Boot Screen:
   * - 'orbital': Inspired by antigravity.google's weightless Medusae / Orbital Swarm
   *              micro-particle field with cursor-responsive spring physics & editorial typography.
   * - 'minimal': Quiet editorial wordmark reveal (<0.9s), zero visual noise.
   */
  function showBootSplash(modeOverride, isPreview) {
    const mode = modeOverride || prefs.bootMode;
    if (mode === 'off' && !isPreview) return;
    const effectiveMode = mode === 'off' ? 'orbital' : mode;
    if (!document || !document.body) return;
    const prev = document.getElementById('aether-boot-overlay');
    if (prev) prev.remove();

    const isLight = document.body.classList.contains('theme-light');
    const isClassic = prefs.themeStyle === 'classic';
    const bg = isLight
      ? (isClassic ? '#FFFFFF' : '#FAF9F5')
      : (isClassic ? '#111113' : '#141413');
    const fg = isLight ? '#141413' : '#F4F3EE';
    const muted = isLight ? 'rgba(61,61,58,0.55)' : 'rgba(218,215,205,0.50)';
    const accentRgb = isClassic
      ? (isLight ? '37,99,235' : '96,165,250')
      : (isLight ? '198,97,63' : '217,119,87');
    const neutralRgb = isLight ? '20,20,19' : '244,243,238';
    const trackBg = isLight ? 'rgba(20,20,19,0.08)' : 'rgba(244,243,238,0.09)';

    if (!document.getElementById('aether-boot-kf')) {
      const kf = document.createElement('style');
      kf.id = 'aether-boot-kf';
      kf.textContent = \`
        @keyframes aetherWordReveal {
          0% { opacity: 0; transform: translateY(10px); letter-spacing: 0.22em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: 0.14em; }
        }
        @keyframes aetherSubReveal {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      \`;
      document.head.appendChild(kf);
    }

    const overlay = document.createElement('div');
    overlay.id = 'aether-boot-overlay';
    overlay.style.cssText = \`
      position: fixed; inset: 0; z-index: 2147483646;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: \${bg}; color: \${fg};
      overflow: hidden; user-select: none; cursor: default;
      opacity: 1;
      transition: opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
      font-family: 'Anthropic Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', sans-serif;
    \`;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    if (effectiveMode === 'orbital') overlay.appendChild(canvas);

    const center = document.createElement('div');
    center.style.cssText = 'position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:14px;pointer-events:none;';
    center.innerHTML = \`
      <div style="font-family:'Anthropic Serif','Tiempos Text',Georgia,Charter,serif;font-size:32px;font-weight:400;letter-spacing:0.14em;padding-left:0.14em;animation:aetherWordReveal 620ms cubic-bezier(0.22,1,0.36,1) forwards;">
        Antigravity
      </div>
      <div style="font-size:10px;font-weight:500;letter-spacing:0.34em;padding-left:0.34em;text-transform:uppercase;color:\${muted};animation:aetherSubReveal 720ms cubic-bezier(0.22,1,0.36,1) forwards;">
        AETHER STUDIO
      </div>
      <div style="width:148px;height:1.5px;border-radius:999px;background:\${trackBg};overflow:hidden;margin-top:6px;">
        <div id="aether-boot-bar" style="width:0%;height:100%;background:rgb(\${accentRgb});transition:width 110ms linear;"></div>
      </div>
    \`;
    overlay.appendChild(center);
    document.body.appendChild(overlay);

    let rafId = 0;
    let dismissed = false;
    const pointer = { x: -9999, y: -9999, active: false };

    function onMove(e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    }

    if (effectiveMode === 'orbital') {
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let W = 0, H = 0, CX = 0, CY = 0;
      function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        CX = W / 2;
        CY = H / 2;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resize();
      window.addEventListener('resize', resize);
      window.addEventListener('pointermove', onMove, { passive: true });

      // Weightless 3D orbital micro-particle swarm (antigravity.google Medusae halo aesthetic)
      const COUNT = 136;
      const baseRadius = Math.min(W, H) * 0.23;
      const particles = Array.from({ length: COUNT }, (_, i) => {
        const theta = (i / COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
        const ringBand = baseRadius * (0.72 + Math.random() * 0.68);
        const startSpread = 1.65 + Math.random() * 0.85;
        const x = CX + Math.cos(theta) * ringBand * startSpread;
        const y = CY + Math.sin(theta) * ringBand * startSpread;
        return {
          x, y, vx: 0, vy: 0,
          theta,
          band: ringBand,
          speed: (0.0022 + Math.random() * 0.0038) * (Math.random() > 0.15 ? 1 : -1),
          phase: Math.random() * Math.PI * 2,
          size: 1.15 + Math.random() * 1.9,
          isAccent: Math.random() < 0.34,
          alpha: 0.22 + Math.random() * 0.62,
        };
      });

      const t0 = performance.now();
      function tick(now) {
        if (dismissed) return;
        const elapsed = (now - t0) / 1000;
        ctx.clearRect(0, 0, W, H);

        // Subtle atmospheric halo behind center wordmark
        const halo = ctx.createRadialGradient(CX, CY, 10, CX, CY, baseRadius * 1.55);
        halo.addColorStop(0, \`rgba(\${accentRgb}, \${isLight ? 0.06 : 0.08})\`);
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, W, H);

        const breathe = 1 + Math.sin(elapsed * 2.1) * 0.035;
        for (let i = 0; i < COUNT; i++) {
          const p = particles[i];
          p.theta += p.speed;
          const r = p.band * breathe + Math.sin(elapsed * 1.8 + p.phase) * 9;
          const tx = CX + Math.cos(p.theta) * r;
          const ty = CY + Math.sin(p.theta) * r * 0.86; // gentle 3D tilt

          // Spring pull toward orbital halo
          p.vx += (tx - p.x) * 0.055;
          p.vy += (ty - p.y) * 0.055;

          // Organic cursor ripple
          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > 1 && d2 < 14400) {
              const d = Math.sqrt(d2);
              const f = (1 - d / 120) * 1.65;
              p.vx += (dx / d) * f;
              p.vy += (dy / d) * f;
            }
          }

          p.vx *= 0.84;
          p.vy *= 0.84;
          p.x += p.vx;
          p.y += p.vy;

          // Render micro-capsule oriented along velocity/tangent
          const ang = Math.atan2(p.vy, p.vx);
          const stretch = Math.min(4.8, 1.4 + Math.hypot(p.vx, p.vy) * 0.45);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(ang);
          ctx.fillStyle = \`rgba(\${p.isAccent ? accentRgb : neutralRgb}, \${p.alpha})\`;
          ctx.beginPath();
          ctx.roundRect(-stretch, -p.size * 0.5, stretch * 2, p.size, p.size * 0.5);
          ctx.fill();
          ctx.restore();
        }
        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);

      overlay._cleanupCanvas = () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('pointermove', onMove);
      };
    }

    const bar = overlay.querySelector('#aether-boot-bar');
    const TOTAL_MS = effectiveMode === 'minimal' ? 880 : 1480;
    const startTs = performance.now();

    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      cancelAnimationFrame(rafId);
      if (overlay._cleanupCanvas) overlay._cleanupCanvas();
      window.removeEventListener('keydown', onKey, true);
      overlay.style.opacity = '0';
      overlay.style.transform = 'scale(1.015)';
      setTimeout(() => overlay.remove(), 440);
    }

    function onKey(e) { if (e.key === 'Escape') dismiss(); }
    overlay.addEventListener('click', dismiss);
    window.addEventListener('keydown', onKey, true);

    const timer = setInterval(() => {
      if (dismissed) { clearInterval(timer); return; }
      const pct = Math.min(100, Math.round(((performance.now() - startTs) / TOTAL_MS) * 100));
      if (bar) bar.style.width = pct + '%';
      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(dismiss, 120);
      }
    }, 35);
  }

  const BTN = 'inline-flex items-center justify-center transition-colors text-secondary-foreground outline-none cursor-pointer border-none shrink-0 select-none h-full hover:text-foreground data-[pressed]:bg-secondary data-[pressed]:text-foreground disabled:opacity-50 disabled:pointer-events-none text-sm px-2 rounded-md gap-1.5';
  const GROUP_HTML = '<div role="group" aria-orientation="horizontal" class="inline-flex items-center rounded-lg border border-border bg-secondary/20 p-0.5 gap-0.5 select-none h-8"></div>';

  function rowHtml(right) {
    return (
      '<div class="w-full"><div class="py-2 px-3 w-full bg-transparent flex justify-between gap-4 items-center">' +
      '<div class="flex-1 flex flex-col gap-0.5"><div class="flex items-center gap-1.5"><span class="text-sm" data-k="title"></span></div>' +
      '<span class="text-xs text-muted-foreground whitespace-pre-wrap" data-k="desc"></span></div>' +
      '<div class="shrink-0">' + right + '</div></div></div>'
    );
  }

  function buildLookSection(id, heading, hint, rows) {
    const sec = document.createElement('div');
    sec.id = id;
    sec.className = 'space-y-2';
    sec.innerHTML =
      '<div class="flex flex-col gap-1"><div class="flex items-center justify-between"><div class="flex items-center gap-1.5"><h3 class="m-0 text-sm font-medium"></h3></div></div>' +
      (hint ? '<div class="text-xs text-muted-foreground leading-relaxed" data-k="intro"></div>' : '') + '</div>' +
      '<div><div class="bg-transparent rounded-xl border border-border overflow-hidden divide-y divide-border">' +
      rows.map(() => rowHtml(GROUP_HTML)).join('') +
      '</div></div>';
    sec.querySelector('h3').textContent = heading;
    if (hint) sec.querySelector('[data-k=intro]').textContent = hint;

    sec.querySelectorAll('.divide-y > .w-full').forEach((row, i) => {
      const r = rows[i];
      row.querySelector('[data-k=title]').textContent = r.title;
      const desc = row.querySelector('[data-k=desc]');
      desc.hidden = true;
      const group = row.querySelector('[role=group]');
      for (const [value, label] of r.options) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = BTN;
        b.textContent = label;
        b.setAttribute('aria-pressed', String(value === prefs[r.prefKey]));
        if (value === prefs[r.prefKey]) b.setAttribute('data-pressed', '');
        b.addEventListener('click', () => {
          if (value === prefs[r.prefKey]) return;
          prefs[r.prefKey] = value;
          savePref(r.storageKey, value);
          for (const x of group.children) {
            if (x.dataset.isAction) continue;
            x.setAttribute('aria-pressed', String(x === b));
            x.toggleAttribute('data-pressed', x === b);
          }
          applyTheme();
        });
        group.appendChild(b);
      }
    });
    return sec;
  }

  function panelByTitle(titles) {
    for (const h2 of document.querySelectorAll('[role="dialog"] h2')) {
      if (titles.includes(h2.textContent.trim())) return h2.closest('div.p-6') || null;
    }
    return null;
  }

  function appendSection(panel, id, buildFn) {
    if (!panel || panel.querySelector('#' + id)) return;
    const sections = [...panel.querySelectorAll('div.space-y-2')].filter((s) => !s.id.startsWith('aether-') && !s.id.startsWith('ag-'));
    const last = sections[sections.length - 1];
    if (last && last.parentElement) last.parentElement.appendChild(buildFn());
  }

  function ensureAppearanceSettings() {
    const appearance = panelByTitle(['Appearance', '外观']);
    if (!appearance) return;
    appendSection(appearance, STYLE_ROW_ID, () =>
      buildLookSection(
        STYLE_ROW_ID,
        'Aether Theme',
        'Editorial light & dark theme harmonized across workspace and telemetry cockpit.',
        [
          {
            title: 'Palette',
            prefKey: 'themeStyle',
            storageKey: LS_STYLE,
            options: [
              ['clay', 'Clay'],
              ['classic', 'Classic'],
              ['original', 'Original'],
            ],
          },
        ]
      )
    );
    appendSection(appearance, FONT_ROW_ID, () =>
      buildLookSection(
        FONT_ROW_ID,
        'Aether Typography',
        'Curated reading & UI typefaces (active when Clay or Classic is selected).',
        [
          {
            title: 'Latin',
            prefKey: 'latinFont',
            storageKey: LS_LATIN,
            options: [
              ['claude', 'Editorial'],
              ['modern', 'Modern'],
              ['system', 'System'],
            ],
          },
          {
            title: 'Chinese',
            prefKey: 'cjkFont',
            storageKey: LS_CJK,
            options: [
              ['wenkai', 'WenKai'],
              ['system', 'PingFang'],
              ['songti', 'Songti'],
            ],
          },
        ]
      )
    );
    appendSection(appearance, SPLASH_ROW_ID, () => {
      const sec = buildLookSection(
        SPLASH_ROW_ID,
        'Aether Boot Screen',
        'Weightless orbital micro-particle field inspired by Antigravity.',
        [
          {
            title: 'Style',
            prefKey: 'bootMode',
            storageKey: LS_SPLASH,
            options: [
              ['orbital', 'Orbital'],
              ['minimal', 'Minimal'],
              ['off', 'Off'],
            ],
          },
        ]
      );
      const group = sec.querySelector('[role=group]');
      if (group) {
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.dataset.isAction = '1';
        prevBtn.className = BTN;
        prevBtn.textContent = 'Preview';
        prevBtn.addEventListener('click', () => showBootSplash(prefs.bootMode === 'off' ? 'orbital' : prefs.bootMode, true));
        group.appendChild(prevBtn);
      }
      return sec;
    });
  }

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

async function main() {
  const args = process.argv.slice(2);

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
    // Clean up either previous Aether or legacy Claude theme markers
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
    console.log('✨ 已写入 Aether Studio（主题配色 + 字体体系 + Orbital 启动页 + 原生设置集成）。');

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
    console.log('✅ 已成功写入 /Applications/Antigravity.app/Contents/Resources/app.asar');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error('❌ 失败:', err.message);
  process.exit(1);
});
