'use strict';

/**
 * Aether × Attendre Particle-Morphing Boot Screen (renderer module source generator).
 * Completely redesigned with a real 60fps spring-physics particle engine:
 * - Samples the exact Antigravity emblem silhouette on an offscreen canvas into ~650 glowing target particles
 * - Adds ~260 3D depth-sorted ambient starfield & orbital stream particles with motion trails
 * - Triggers a radial shockwave ignition ring upon logo lock-in + live cursor magnetic repulsion
 * - Features personalized "ATTENDRE" identity lockup & Codex-style telemetry HUD
 * - On exit, particles disperse weightlessly as the overlay dissolves into the workspace
 */
function buildBootScreenSource() {
  return `
  function showBootSplash(modeOverride, isPreview) {
    const mode = modeOverride || prefs.bootMode;
    if (mode === 'off' && !isPreview) return;
    const effectiveMode = mode === 'off' ? 'orbital' : mode;
    if (!document || !document.body) return;
    const prev = document.getElementById('aether-boot-overlay');
    if (prev) prev.remove();

    const isClassic = prefs.themeStyle === 'classic';
    // Cinematic deep obsidian stage so glowing particles & trails pop with maximum contrast
    const bgTop = isClassic ? '#080B14' : '#0D0C0B';
    const bgBot = isClassic ? '#0D1322' : '#161412';
    const fg = '#F6F4EE';
    const muted = 'rgba(226, 222, 212, 0.56)';
    const subtle = 'rgba(226, 222, 212, 0.30)';
    const pPrimary = isClassic ? [96, 165, 250] : [217, 119, 87];   // Terracotta / Electric Blue
    const pBright  = isClassic ? [191, 219, 254] : [251, 206, 177]; // Peach Gold / Ice Blue
    const pIvory   = [246, 244, 238];
    const accentHex = isClassic ? '#60A5FA' : '#D97757';
    const accentRgb = pPrimary.join(',');

    if (!document.getElementById('aether-boot-kf')) {
      const kf = document.createElement('style');
      kf.id = 'aether-boot-kf';
      kf.textContent = \`
        @keyframes aetherHeroFade {
          0% { opacity: 0; transform: translateY(14px); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes aetherSubFade {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes aetherPulseDot {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px currentColor; }
          50% { opacity: 0.4; box-shadow: 0 0 2px currentColor; }
        }
      \`;
      document.head.appendChild(kf);
    }

    const overlay = document.createElement('div');
    overlay.id = 'aether-boot-overlay';
    overlay.style.cssText = \`
      position: fixed; inset: 0; z-index: 2147483646;
      display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
      padding-bottom: 11vh;
      background: radial-gradient(ellipse 80% 70% at 50% 42%, \${bgBot} 0%, \${bgTop} 100%);
      color: \${fg};
      overflow: hidden; user-select: none; cursor: default;
      opacity: 1;
      transition: opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
      font-family: 'Anthropic Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', sans-serif;
    \`;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    overlay.appendChild(canvas);

    // Corner Codex-style HUD
    const hudCss = \`position:absolute;z-index:3;font-family:'JetBrains Mono','SF Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:\${subtle};pointer-events:none;display:flex;align-items:center;gap:7px;\`;
    const tl = document.createElement('div');
    tl.style.cssText = hudCss + 'top:22px;left:26px;';
    tl.innerHTML = \`<span style="width:6px;height:6px;border-radius:99px;background:\${accentHex};color:\${accentHex};display:inline-block;animation:aetherPulseDot 1.6s ease-in-out infinite;"></span><span>AETHER // ANTIGRAVITY</span>\`;
    const tr = document.createElement('div');
    tr.style.cssText = hudCss + 'top:22px;right:26px;';
    tr.textContent = 'PARTICLE ENGINE · v1.0';
    const bl = document.createElement('div');
    bl.style.cssText = hudCss + 'bottom:22px;left:26px;';
    bl.innerHTML = \`<span>PILOT</span><span style="color:\${fg};font-weight:600;letter-spacing:0.2em;">ATTENDRE</span>\`;
    const br = document.createElement('div');
    br.style.cssText = hudCss + 'bottom:22px;right:26px;';
    br.textContent = 'ESC / CLICK TO SKIP';
    overlay.appendChild(tl);
    overlay.appendChild(tr);
    overlay.appendChild(bl);
    overlay.appendChild(br);

    // Editorial bottom lockup (leaves upper-center completely open for the glowing particle-assembled emblem)
    const lockup = document.createElement('div');
    lockup.style.cssText = 'position:relative;z-index:3;display:flex;flex-direction:column;align-items:center;gap:12px;pointer-events:none;';
    lockup.innerHTML = \`
      <div style="font-family:'Anthropic Serif','Tiempos Text',Georgia,Charter,serif;font-size:32px;font-weight:400;letter-spacing:0.16em;padding-left:0.16em;color:\${fg};text-shadow:0 0 28px rgba(\${accentRgb},0.35);animation:aetherHeroFade 780ms 180ms cubic-bezier(0.22,1,0.36,1) both;">
        Antigravity
      </div>
      <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 14px;border-radius:999px;background:rgba(255,255,255,0.05);border:1px solid rgba(\${accentRgb},0.32);backdrop-filter:blur(10px);animation:aetherSubFade 720ms 320ms cubic-bezier(0.22,1,0.36,1) both;">
        <span style="width:5px;height:5px;border-radius:99px;background:\${accentHex};box-shadow:0 0 8px \${accentHex};display:inline-block;"></span>
        <span style="font-family:'JetBrains Mono','SF Mono',ui-monospace,monospace;font-size:10.5px;letter-spacing:0.2em;text-transform:uppercase;color:\${muted};">
          WELCOME BACK · <strong style="color:\${fg};font-weight:600;">ATTENDRE</strong>
        </span>
      </div>
      <div style="width:248px;display:flex;flex-direction:column;gap:7px;margin-top:6px;animation:aetherSubFade 720ms 420ms cubic-bezier(0.22,1,0.36,1) both;">
        <div style="width:100%;height:2px;border-radius:999px;background:rgba(255,255,255,0.10);overflow:hidden;">
          <div id="aether-boot-bar" style="width:0%;height:100%;border-radius:999px;background:linear-gradient(90deg, rgba(\${accentRgb},0.35), \${accentHex}, #FFF5EB);box-shadow:0 0 12px rgba(\${accentRgb},0.85);transition:width 80ms linear;"></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;font-family:'JetBrains Mono','SF Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:0.1em;color:\${muted};font-variant-numeric:tabular-nums;">
          <span id="aether-boot-stage">01 · IGNITING PARTICLE FIELD</span>
          <span id="aether-boot-pct" style="color:\${fg};font-weight:600;">00%</span>
        </div>
      </div>
    \`;
    overlay.appendChild(lockup);
    document.body.appendChild(overlay);

    let rafId = 0;
    let dismissed = false;
    let dispersing = false;
    const pointer = { x: -9999, y: -9999, active: false };
    function onMove(e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true; }

    // === 60fps Particle Morphing Engine ===
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = window.innerWidth;
    let H = window.innerHeight;
    let CX = W / 2;
    let CY = H * 0.40;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      CX = W / 2;
      CY = H * 0.40;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });

    // Sample the Antigravity A-mark silhouette into dense particle target coordinates
    function sampleEmblemTargets() {
      const S = 260;
      const off = document.createElement('canvas');
      off.width = S;
      off.height = S;
      const octx = off.getContext('2d');
      octx.save();
      octx.scale(S / 180, S / 180);
      const path = new Path2D('M144.248 149.062C151.748 154.688 162.998 150.938 152.685 140.625C121.748 110.625 128.31 28.125 89.8727 28.125C51.4352 28.125 57.9977 110.625 27.0602 140.625C15.8102 151.875 27.9977 154.688 35.4977 149.062C64.5602 129.375 62.6852 94.6875 89.8727 94.6875C117.06 94.6875 115.185 129.375 144.248 149.062Z');
      octx.fillStyle = '#fff';
      octx.fill(path);
      octx.restore();

      const img = octx.getImageData(0, 0, S, S).data;
      const pts = [];
      const step = effectiveMode === 'minimal' ? 7 : 5;
      for (let y = 0; y < S; y += step) {
        for (let x = 0; x < S; x += step) {
          if (img[(y * S + x) * 4 + 3] > 128) {
            pts.push({
              ox: (x - S / 2) * 1.05,
              oy: (y - S / 2) * 1.05,
            });
          }
        }
      }
      return pts;
    }

    const targets = sampleEmblemTargets();
    const logoParticles = targets.map((t, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.max(W, H) * (0.35 + Math.random() * 0.45);
      const pick = Math.random();
      const rgb = pick < 0.52 ? pPrimary : (pick < 0.84 ? pBright : pIvory);
      return {
        x: CX + Math.cos(angle) * dist,
        y: CY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        ox: t.ox,
        oy: t.oy,
        rgb,
        size: 1.3 + Math.random() * 1.9,
        alpha: 0.55 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        spring: 0.055 + Math.random() * 0.045,
        drag: 0.80 + Math.random() * 0.06,
      };
    });

    // Ambient orbital & starfield particles
    const AMBIENT_COUNT = effectiveMode === 'minimal' ? 90 : 240;
    const baseOrbR = Math.min(W, H) * 0.30;
    const ambient = Array.from({ length: AMBIENT_COUNT }, (_, i) => {
      const isOrbit = i < AMBIENT_COUNT * 0.65;
      const theta = Math.random() * Math.PI * 2;
      const band = isOrbit ? baseOrbR * (0.68 + Math.random() * 0.72) : Math.max(W, H) * (0.18 + Math.random() * 0.48);
      const plane = i % 2 === 0 ? 1 : -1;
      return {
        isOrbit,
        theta,
        band,
        tilt: plane > 0 ? 0.32 : -0.40,
        speed: (isOrbit ? (0.004 + Math.random() * 0.006) : (0.0005 + Math.random() * 0.0012)) * plane,
        size: isOrbit ? (1.0 + Math.random() * 1.6) : (0.7 + Math.random() * 1.2),
        rgb: Math.random() < 0.5 ? pPrimary : (Math.random() < 0.5 ? pBright : pIvory),
        alpha: isOrbit ? (0.28 + Math.random() * 0.52) : (0.14 + Math.random() * 0.34),
        phase: Math.random() * Math.PI * 2,
      };
    });

    const t0 = performance.now();
    let shockwaveStart = 0;

    function tick(now) {
      if (dismissed) return;
      const elapsed = (now - t0) / 1000;

      // Translucent trail clear for silky luminous motion blur
      ctx.fillStyle = isClassic ? 'rgba(8, 11, 20, 0.34)' : 'rgba(13, 12, 11, 0.34)';
      ctx.fillRect(0, 0, W, H);

      // Core warm nebula glow behind emblem
      const glowPulse = 1 + Math.sin(elapsed * 2.8) * 0.08;
      const coreGlow = ctx.createRadialGradient(CX, CY, 8, CX, CY, 220 * glowPulse);
      coreGlow.addColorStop(0, \`rgba(\${accentRgb}, 0.24)\`);
      coreGlow.addColorStop(0.45, \`rgba(\${accentRgb}, 0.08)\`);
      coreGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGlow;
      ctx.fillRect(0, 0, W, H);

      // Trigger shockwave ignition ring once particles converge (~0.92s)
      if (!shockwaveStart && elapsed > 0.92) shockwaveStart = elapsed;
      if (shockwaveStart) {
        const swAge = elapsed - shockwaveStart;
        if (swAge < 1.25) {
          const prog = swAge / 1.25;
          const easeOut = 1 - Math.pow(1 - prog, 3);
          const swR = 46 + easeOut * Math.min(W, H) * 0.44;
          const swAlpha = (1 - prog) * 0.42;
          ctx.save();
          ctx.strokeStyle = \`rgba(\${pBright.join(',')}, \${swAlpha.toFixed(3)})\`;
          ctx.lineWidth = 1.6 * (1 - prog * 0.6);
          ctx.beginPath();
          ctx.arc(CX, CY, swR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Draw ambient orbital & starfield particles
      const brightNodes = [];
      for (let i = 0; i < AMBIENT_COUNT; i++) {
        const a = ambient[i];
        a.theta += a.speed;
        const r = a.band + Math.sin(elapsed * 2.1 + a.phase) * (a.isOrbit ? 9 : 4);
        const ox = Math.cos(a.theta) * r;
        const oy = Math.sin(a.theta) * r * (a.isOrbit ? 0.52 : 0.85);
        const cosT = Math.cos(a.tilt);
        const sinT = Math.sin(a.tilt);
        const px = CX + (ox * cosT - oy * sinT);
        const py = CY + (ox * sinT + oy * cosT);
        const depth = a.isOrbit ? (0.55 + 0.45 * Math.sin(a.theta)) : 1;
        const twinkle = 0.72 + 0.28 * Math.sin(elapsed * 3.4 + a.phase);

        if (a.isOrbit && depth > 0.82 && brightNodes.length < 32) {
          brightNodes.push({ x: px, y: py });
        }

        ctx.fillStyle = \`rgba(\${a.rgb.join(',')}, \${(a.alpha * depth * twinkle).toFixed(3)})\`;
        ctx.beginPath();
        ctx.arc(px, py, a.size * (0.75 + 0.35 * depth), 0, Math.PI * 2);
        ctx.fill();
      }

      // Subtle constellation filaments among foreground orbital nodes
      ctx.lineWidth = 0.65;
      for (let i = 0; i < brightNodes.length; i++) {
        for (let j = i + 1; j < brightNodes.length; j++) {
          const dx = brightNodes[i].x - brightNodes[j].x;
          const dy = brightNodes[i].y - brightNodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 92) {
            ctx.strokeStyle = \`rgba(\${accentRgb}, \${((1 - d / 92) * 0.22).toFixed(3)})\`;
            ctx.beginPath();
            ctx.moveTo(brightNodes[i].x, brightNodes[i].y);
            ctx.lineTo(brightNodes[j].x, brightNodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw spring-physics Antigravity emblem particles
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < logoParticles.length; i++) {
        const p = logoParticles[i];
        if (dispersing) {
          const ang = Math.atan2(p.y - CY, p.x - CX);
          p.vx += Math.cos(ang) * 1.4;
          p.vy += Math.sin(ang) * 1.4;
          p.x += p.vx;
          p.y += p.vy;
        } else {
          const floatX = Math.sin(elapsed * 2.4 + p.phase) * 1.6;
          const floatY = Math.cos(elapsed * 2.0 + p.phase) * 1.8;
          const tx = CX + p.ox + floatX;
          const ty = CY + p.oy + floatY;
          p.vx += (tx - p.x) * p.spring;
          p.vy += (ty - p.y) * p.spring;

          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > 1 && d2 < 14400) {
              const d = Math.sqrt(d2);
              const f = (1 - d / 120) * 3.2;
              p.vx += (dx / d) * f;
              p.vy += (dy / d) * f;
            }
          }

          p.vx *= p.drag;
          p.vy *= p.drag;
          p.x += p.vx;
          p.y += p.vy;
        }

        const speed = Math.hypot(p.vx, p.vy);
        const shimmer = 0.78 + 0.22 * Math.sin(elapsed * 4.2 + p.phase);
        ctx.fillStyle = \`rgba(\${p.rgb.join(',')}, \${Math.min(1, p.alpha * shimmer).toFixed(3)})\`;
        if (speed > 2.2) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.atan2(p.vy, p.vx));
          const len = Math.min(10, p.size + speed * 0.55);
          ctx.beginPath();
          ctx.roundRect(-len, -p.size * 0.5, len * 2, p.size, p.size * 0.5);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    overlay._cleanupCanvas = () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };

    const bar = overlay.querySelector('#aether-boot-bar');
    const stageEl = overlay.querySelector('#aether-boot-stage');
    const pctEl = overlay.querySelector('#aether-boot-pct');
    const stages = [
      [0,  '01 · IGNITING PARTICLE FIELD'],
      [30, '02 · ASSEMBLING ANTIGRAVITY CORE'],
      [62, '03 · SYNCING AETHER TELEMETRY'],
      [86, '04 · READY FOR ATTENDRE'],
    ];
    const TOTAL_MS = effectiveMode === 'minimal' ? 1300 : (isPreview ? 2900 : 2250);
    const startTs = performance.now();

    function dismiss() {
      if (dismissed) return;
      dispersing = true;
      overlay.style.opacity = '0';
      overlay.style.transform = 'scale(1.02)';
      setTimeout(() => {
        dismissed = true;
        cancelAnimationFrame(rafId);
        if (overlay._cleanupCanvas) overlay._cleanupCanvas();
        window.removeEventListener('keydown', onKey, true);
        overlay.remove();
      }, 520);
    }

    function onKey(e) { if (e.key === 'Escape') dismiss(); }
    overlay.addEventListener('click', dismiss);
    window.addEventListener('keydown', onKey, true);

    const timer = setInterval(() => {
      if (dismissed || dispersing) { clearInterval(timer); return; }
      const pct = Math.min(100, Math.round(((performance.now() - startTs) / TOTAL_MS) * 100));
      if (bar) bar.style.width = pct + '%';
      if (pctEl) pctEl.textContent = String(pct).padStart(2, '0') + '%';
      if (stageEl) {
        let label = stages[0][1];
        for (const [threshold, text] of stages) {
          if (pct >= threshold) label = text;
        }
        if (stageEl.textContent !== label) stageEl.textContent = label;
      }
      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(dismiss, 220);
      }
    }, 32);
  }
`.trim();
}

module.exports = { buildBootScreenSource };
