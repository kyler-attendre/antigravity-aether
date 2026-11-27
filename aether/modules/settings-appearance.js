'use strict';

/**
 * Aether Native Settings → Appearance UI Builder (renderer module source generator).
 * Mounts Aether Theme, Typography, Boot Screen, and Host Update controls cleanly at the top
 * of Antigravity's native Appearance settings panel.
 */
function buildSettingsAppearanceSource() {
  return `
  const STYLE_ROW_ID = 'aether-style-row';
  const DREAM_ROW_ID = 'aether-dream-row';
  const FONT_ROW_ID = 'aether-font-row';
  const SPLASH_ROW_ID = 'aether-boot-row';
  const UPGRADE_ROW_ID = 'aether-upgrade-row';

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

  function placeTopSection(panel, id, buildFn, afterId) {
    if (!panel || panel.querySelector('#' + id)) return;
    if (afterId) {
      const after = panel.querySelector('#' + afterId);
      if (after) {
        after.after(buildFn());
        return;
      }
    }
    const sections = [...panel.querySelectorAll('div.space-y-2')].filter((s) => !s.id.startsWith('aether-') && !s.id.startsWith('ag-'));
    const first = sections[0];
    if (first && first.parentElement) first.parentElement.insertBefore(buildFn(), first);
  }

  function ensureAppearanceSettings() {
    const appearance = panelByTitle(['Appearance', '外观']);
    if (!appearance) return;
    placeTopSection(appearance, STYLE_ROW_ID, () =>
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
    placeTopSection(appearance, DREAM_ROW_ID, () => {
      const sec = buildLookSection(
        DREAM_ROW_ID,
        'Aether Dream Skin',
        'Full-window continuous wallpaper & adaptive frosted glass (inspired by Codex Dream Skin).',
        [
          {
            title: 'Wallpaper',
            prefKey: 'dreamMode',
            storageKey: LS_DREAM_MODE,
            options: [
              ['off', 'Off'],
              ['aurora', 'Aurora'],
              ['void', 'Void'],
              ['custom', 'Custom'],
            ],
          },
          {
            title: 'Glass Scrim',
            prefKey: 'dreamScrim',
            storageKey: LS_DREAM_SCRIM,
            options: [
              ['light', 'Light'],
              ['balanced', 'Balanced'],
              ['deep', 'Deep'],
            ],
          },
        ]
      );
      const firstGroup = sec.querySelector('[role=group]');
      if (firstGroup) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', () => {
          const f = fileInput.files && fileInput.files[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              const maxW = 1920;
              const scale = img.width > maxW ? (maxW / img.width) : 1;
              const cw = Math.round(img.width * scale);
              const ch = Math.round(img.height * scale);
              const c = document.createElement('canvas');
              c.width = cw;
              c.height = ch;
              c.getContext('2d').drawImage(img, 0, 0, cw, ch);
              const dataUrl = c.toDataURL('image/jpeg', 0.86);
              prefs.dreamImage = dataUrl;
              prefs.dreamMode = 'custom';
              savePref(LS_DREAM_IMG, dataUrl);
              savePref(LS_DREAM_MODE, 'custom');
              for (const x of firstGroup.children) {
                if (x.dataset.isAction) continue;
                const isCust = x.textContent === 'Custom';
                x.setAttribute('aria-pressed', String(isCust));
                x.toggleAttribute('data-pressed', isCust);
              }
              applyTheme();
            };
            img.src = String(reader.result || '');
          };
          reader.readAsDataURL(f);
        });
        sec.appendChild(fileInput);

        const pickBtn = document.createElement('button');
        pickBtn.type = 'button';
        pickBtn.dataset.isAction = '1';
        pickBtn.className = BTN;
        pickBtn.textContent = 'Choose Image…';
        pickBtn.addEventListener('click', () => fileInput.click());
        firstGroup.appendChild(pickBtn);
      }
      return sec;
    }, STYLE_ROW_ID);
    placeTopSection(appearance, FONT_ROW_ID, () =>
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
      ),
      DREAM_ROW_ID
    );
    placeTopSection(appearance, SPLASH_ROW_ID, () => {
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
    }, FONT_ROW_ID);
    placeTopSection(appearance, UPGRADE_ROW_ID, () => {
      const sec = document.createElement('div');
      sec.id = UPGRADE_ROW_ID;
      sec.className = 'space-y-2';
      sec.innerHTML =
        '<div class="flex flex-col gap-1"><div class="flex items-center justify-between"><div class="flex items-center gap-1.5"><h3 class="m-0 text-sm font-medium">Aether Host Update</h3></div></div>' +
        '<div class="text-xs text-muted-foreground leading-relaxed">One-click official Antigravity update + automatic Aether re-install (macOS).</div></div>' +
        '<div><div class="bg-transparent rounded-xl border border-border overflow-hidden divide-y divide-border">' +
        rowHtml(GROUP_HTML) +
        '</div></div>';
      const titleEl = sec.querySelector('[data-k=title]');
      const descEl = sec.querySelector('[data-k=desc]');
      const group = sec.querySelector('[role=group]');
      if (titleEl) titleEl.textContent = 'Antigravity Official Update';
      if (descEl) {
        descEl.hidden = false;
        descEl.textContent = 'Click Check to query Google official release manifest.';
      }
      const invokeIpc = (ch) => {
        try {
          if (typeof electron_1 !== 'undefined' && electron_1?.ipcRenderer?.invoke) {
            return electron_1.ipcRenderer.invoke(ch);
          }
          const e = typeof require === 'function' ? require('electron') : null;
          if (e?.ipcRenderer?.invoke) return e.ipcRenderer.invoke(ch);
        } catch {}
        return Promise.resolve({ ok: false, error: 'IPC unavailable' });
      };
      if (group) {
        const chkBtn = document.createElement('button');
        chkBtn.type = 'button';
        chkBtn.className = BTN;
        chkBtn.textContent = 'Check';
        chkBtn.addEventListener('click', async () => {
          chkBtn.disabled = true;
          if (descEl) descEl.textContent = 'Checking Google official manifest…';
          const r = await invokeIpc('aether:check-host-update');
          chkBtn.disabled = false;
          if (!r || !r.ok) {
            if (descEl) descEl.textContent = 'Check failed: ' + (r?.error || 'unknown');
          } else if (r.hasUpdate) {
            if (descEl) descEl.textContent = 'Update available: v' + r.localVersion + ' → v' + r.latestVersion;
          } else {
            if (descEl) descEl.textContent = 'Up to date (v' + r.localVersion + ')';
          }
        });
        const upgBtn = document.createElement('button');
        upgBtn.type = 'button';
        upgBtn.className = BTN;
        upgBtn.setAttribute('data-pressed', '');
        upgBtn.textContent = 'Upgrade & Re-apply';
        upgBtn.addEventListener('click', async () => {
          upgBtn.disabled = true;
          const r = await invokeIpc('aether:run-host-upgrade');
          upgBtn.disabled = false;
          if (r && !r.ok && !r.cancelled && descEl) {
            descEl.textContent = 'Upgrade error: ' + (r.error || 'failed');
          }
        });
        group.appendChild(chkBtn);
        group.appendChild(upgBtn);
      }
      return sec;
    }, SPLASH_ROW_ID);
  }
`.trim();
}

module.exports = { buildSettingsAppearanceSource };
