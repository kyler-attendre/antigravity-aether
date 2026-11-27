'use strict';

/**
 * Aether Theme, Typography & Dream Skin Engine (renderer module source generator).
 * Manages:
 * - Clay / Classic / Original editorial palettes
 * - 3x3 Editorial Typography presets
 * - Aether Dream Skin (inspired by Fei-Away/Codex-Dream-Skin): full-window continuous
 *   wallpaper + adaptive readability scrim + translucent frosted-glass sidebar & composer
 */
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

/* Aether Dream Skin — Continuous Wallpaper + Adaptive Frosted Glass */
#aether-dream-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  transition: opacity 320ms ease, background-image 320ms ease;
}
#aether-dream-scrim {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  transition: opacity 320ms ease, background 320ms ease;
}
html[data-ag-dream="on"] body,
html[data-ag-dream="on"] #root,
html[data-ag-dream="on"] #root > div {
  background-color: transparent !important;
  background-image: none !important;
}
html[data-ag-dream="on"] #root {
  position: relative;
  z-index: 1;
}
html[data-ag-dream="on"] body.theme-light aside,
html[data-ag-dream="on"] body.theme-light [data-sidebar],
html[data-ag-dream="on"] body.theme-light nav {
  background-color: rgba(250, 249, 245, var(--aether-dream-glass, 0.56)) !important;
  backdrop-filter: blur(22px) saturate(145%) !important;
  -webkit-backdrop-filter: blur(22px) saturate(145%) !important;
}
html[data-ag-dream="on"] body:not(.theme-light) aside,
html[data-ag-dream="on"] body:not(.theme-light) [data-sidebar],
html[data-ag-dream="on"] body:not(.theme-light) nav {
  background-color: rgba(22, 22, 20, var(--aether-dream-glass, 0.56)) !important;
  backdrop-filter: blur(22px) saturate(145%) !important;
  -webkit-backdrop-filter: blur(22px) saturate(145%) !important;
}
html[data-ag-dream="on"] body.theme-light main,
html[data-ag-dream="on"] body.theme-light [role="main"] {
  background-color: rgba(250, 249, 245, calc(var(--aether-dream-glass, 0.56) * 0.42)) !important;
}
html[data-ag-dream="on"] body:not(.theme-light) main,
html[data-ag-dream="on"] body:not(.theme-light) [role="main"] {
  background-color: rgba(18, 18, 16, calc(var(--aether-dream-glass, 0.56) * 0.48)) !important;
}
html[data-ag-dream="on"] body.theme-light [contenteditable="true"],
html[data-ag-dream="on"] body.theme-light textarea {
  background-color: transparent !important;
}
html[data-ag-dream="on"] body.theme-light [class*="composer"],
html[data-ag-dream="on"] body.theme-light form {
  backdrop-filter: blur(18px) saturate(135%);
  -webkit-backdrop-filter: blur(18px) saturate(135%);
}
`.trim();

function buildThemeEngineSource(baseThemeCss) {
  const fullCss = baseThemeCss + '\n\n' + AETHER_FONT_OVERRIDES_CSS;
  return `
  const STYLE_ID = 'aether-theme-style';
  const THEME_CSS = ${JSON.stringify(fullCss)};

  const LS_STYLE         = 'aether_theme_style';   // 'clay' | 'classic' | 'original'
  const LS_LATIN         = 'aether_latin_font';    // 'claude' | 'modern' | 'system'
  const LS_CJK           = 'aether_cjk_font';      // 'wenkai' | 'system' | 'songti'
  const LS_SPLASH        = 'aether_boot_mode';     // 'orbital' | 'minimal' | 'off'
  const LS_DREAM_MODE    = 'aether_dream_mode';    // 'off' | 'aurora' | 'void' | 'custom'
  const LS_DREAM_IMG     = 'aether_dream_image';   // data:image/jpeg;base64,...
  const LS_DREAM_SCRIM   = 'aether_dream_scrim';   // 'light' | 'balanced' | 'deep'

  function readPref(key, valid, fallback) {
    try {
      const v = localStorage.getItem(key);
      if (v && (!valid || valid.includes(v))) return v;
    } catch {}
    return fallback;
  }

  function savePref(key, val) {
    try {
      if (val === null || val === undefined) localStorage.removeItem(key);
      else localStorage.setItem(key, val);
    } catch {}
  }

  const prefs = {
    themeStyle: readPref(LS_STYLE, ['clay', 'classic', 'original'], 'clay'),
    latinFont: readPref(LS_LATIN, ['claude', 'modern', 'system'], 'claude'),
    cjkFont: readPref(LS_CJK, ['wenkai', 'system', 'songti'], 'wenkai'),
    bootMode: readPref(LS_SPLASH, ['orbital', 'minimal', 'off'], 'orbital'),
    dreamMode: readPref(LS_DREAM_MODE, ['off', 'aurora', 'void', 'custom'], 'off'),
    dreamImage: readPref(LS_DREAM_IMG, null, ''),
    dreamScrim: readPref(LS_DREAM_SCRIM, ['light', 'balanced', 'deep'], 'balanced'),
  };

  function applyDreamSkin() {
    if (!document || !document.documentElement || !document.body) return;
    const root = document.documentElement;
    let bgEl = document.getElementById('aether-dream-bg');
    let scrimEl = document.getElementById('aether-dream-scrim');

    const active = prefs.dreamMode !== 'off' && (prefs.dreamMode !== 'custom' || Boolean(prefs.dreamImage));
    if (!active) {
      root.removeAttribute('data-ag-dream');
      if (bgEl) bgEl.remove();
      if (scrimEl) scrimEl.remove();
      return;
    }

    root.setAttribute('data-ag-dream', 'on');
    const glassAlpha = prefs.dreamScrim === 'light' ? 0.38 : (prefs.dreamScrim === 'deep' ? 0.78 : 0.58);
    root.style.setProperty('--aether-dream-glass', String(glassAlpha));

    if (!bgEl) {
      bgEl = document.createElement('div');
      bgEl.id = 'aether-dream-bg';
      document.body.prepend(bgEl);
    }
    if (!scrimEl) {
      scrimEl = document.createElement('div');
      scrimEl.id = 'aether-dream-scrim';
      bgEl.after(scrimEl);
    }

    const isLight = document.body.classList.contains('theme-light');
    if (prefs.dreamMode === 'custom' && prefs.dreamImage) {
      bgEl.style.backgroundImage = 'url("' + prefs.dreamImage.replace(/"/g, '') + '")';
    } else if (prefs.dreamMode === 'void') {
      bgEl.style.backgroundImage =
        'radial-gradient(ellipse 90% 80% at 72% 28%, rgba(198,97,63,0.42) 0%, rgba(74,45,92,0.34) 40%, rgba(14,15,22,0.96) 100%),' +
        'radial-gradient(circle at 22% 76%, rgba(56,112,158,0.32) 0%, transparent 56%),' +
        'linear-gradient(135deg, #0D0E14 0%, #17151D 52%, #1E1715 100%)';
    } else {
      // Aurora Mist — warm editorial light/dark atmospheric silk
      bgEl.style.backgroundImage = isLight
        ? 'radial-gradient(ellipse 85% 75% at 78% 22%, rgba(217,119,87,0.34) 0%, transparent 58%),' +
          'radial-gradient(ellipse 80% 70% at 18% 82%, rgba(132,165,157,0.30) 0%, transparent 60%),' +
          'radial-gradient(circle at 52% 48%, rgba(246,210,184,0.36) 0%, transparent 62%),' +
          'linear-gradient(135deg, #FAF6F0 0%, #F4ECE4 50%, #EFE8E0 100%)'
        : 'radial-gradient(ellipse 85% 75% at 78% 22%, rgba(217,119,87,0.32) 0%, transparent 58%),' +
          'radial-gradient(ellipse 80% 70% at 18% 82%, rgba(88,129,145,0.28) 0%, transparent 60%),' +
          'linear-gradient(135deg, #121211 0%, #1B1816 55%, #16181B 100%)';
    }

    const baseRgb = isLight ? '250, 249, 245' : '18, 18, 16';
    const aL = (glassAlpha * 0.92).toFixed(2);
    const aM = (glassAlpha * 0.58).toFixed(2);
    const aR = (glassAlpha * 0.24).toFixed(2);
    scrimEl.style.background = \`linear-gradient(90deg, rgba(\${baseRgb}, \${aL}) 0%, rgba(\${baseRgb}, \${aM}) 48%, rgba(\${baseRgb}, \${aR}) 100%)\`;
  }

  function applyTheme() {
    if (!document || !document.documentElement) return;
    const root = document.documentElement;
    let el = document.getElementById(STYLE_ID);

    if (prefs.themeStyle === 'original') {
      if (el) el.remove();
      root.removeAttribute('data-ag-style');
      root.removeAttribute('data-ag-latin');
      root.removeAttribute('data-ag-cjk');
      applyDreamSkin();
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
    applyDreamSkin();
  }
`.trim();
}

module.exports = { buildThemeEngineSource, AETHER_FONT_OVERRIDES_CSS };
