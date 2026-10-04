/**
 * Antigravity Nebula Canvas - Interactive Particle Constellation Engine
 */
(function() {
  const canvas = document.getElementById('nebula-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  // 粒子模式＝主題鍵。實際值於下方 MODE_SPECS 定義後，依 data-theme 校正。
  let mode = 'starfield';
  let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, radius: 160 };

  const PARTICLE_COUNT = 75;
  /* Ash has no connecting lines. A higher count keeps the field present. */
  const EMBER_COUNT = 210;
  /* Code glyphs have no connecting lines either; the count carries the texture. */
  const CODE_COUNT = 92;
  const CONNECT_DISTANCE = 130;
  const MOUSE_CONNECT_DISTANCE = 160;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    if (mouse.x > -500) {
      mouse.vx = e.clientX - mouse.x;
      mouse.vy = e.clientY - mouse.y;
    }
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
    mouse.vx = 0;
    mouse.vy = 0;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 1.8 + 0.8;
      this.baseAlpha = Math.random() * 0.5 + 0.25;
      this.alpha = this.baseAlpha;
      this.color = Math.random() > 0.4 ? '#00f2fe' : '#7f00ff';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Mouse attraction / interaction
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 1.5;
        this.y -= (dy / dist) * force * 1.5;
        this.alpha = Math.min(1, this.baseAlpha + force * 0.5);
      } else {
        this.alpha = this.baseAlpha;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  const EMBER_BRIGHT_CAP = 0.82;
  const EMBER_BRIGHT_FLOOR = 0.42;

  function emberColor() {
    const roll = Math.random();
    let hue;
    let sat;
    let light;
    if (roll < 0.4) {
      hue = 4 + Math.random() * 14;
      sat = 52 + Math.random() * 26;
      light = 40 + Math.random() * 16;
    } else if (roll < 0.8) {
      hue = 20 + Math.random() * 24;
      sat = 46 + Math.random() * 28;
      light = 40 + Math.random() * 18;
    } else {
      // A slight cool lean. Hue stays off cyan, and saturation stays low.
      hue = 208 + Math.random() * 18;
      sat = 6 + Math.random() * 8;
      light = 44 + Math.random() * 10;
    }
    return 'hsl(' + hue.toFixed(1) + ', ' + sat.toFixed(1) + '%, ' + light.toFixed(1) + '%)';
  }

  class EmberParticle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.baseRadius = 1.7 + Math.random() * 6.5;
      this.phase = Math.random() * Math.PI * 2;
      this.phase2 = Math.random() * Math.PI * 2;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() < 0.5 ? -1 : 1) * (0.0035 + Math.random() * 0.009);
      this.swayAmp = 0.35 + Math.random() * 1.45;
      this.swaySpeed = 0.007 + Math.random() * 0.055;
      this.swaySpeed2 = 0.004 + Math.random() * 0.033;
      this.color = emberColor();
      // Persistent lean to one side, so the path is not a symmetric wave.
      this.drift = (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.4);
      // Center and amplitude stay inside the floor and cap, so the sine never needs a clamp.
      const span = EMBER_BRIGHT_CAP - EMBER_BRIGHT_FLOOR;
      this.glow = EMBER_BRIGHT_FLOOR + span * (0.3 + Math.random() * 0.4);
      const room = Math.min(this.glow - EMBER_BRIGHT_FLOOR, EMBER_BRIGHT_CAP - this.glow);
      this.glowAmp = room * (0.55 + Math.random() * 0.45);
      this.glowPhase = Math.random() * Math.PI * 2;
      this.glowSpeed = 0.006 + Math.random() * 0.016;
      this.sizePhase = Math.random() * Math.PI * 2;
      this.sizeSpeed = 0.005 + Math.random() * 0.014;
      this.riseJitter = 0.88 + Math.random() * 0.24;
      this.brightness = this.glow + Math.sin(this.glowPhase) * this.glowAmp;
      this.drawAlpha = this.brightness;
    }

    radiusAt(y) {
      const depth = Math.max(0, Math.min(1, y / Math.max(height, 1)));
      return this.baseRadius * (0.24 + 0.76 * depth);
    }

    update() {
      this.glowPhase += this.glowSpeed;
      this.sizePhase += this.sizeSpeed;
      this.angle += this.spin;
      this.brightness = this.glow + Math.sin(this.glowPhase) * this.glowAmp;

      const depth = Math.max(0, Math.min(1, this.y / Math.max(height, 1)));
      const climb = 1 - depth;
      // Dimmer rises faster, brighter rises slower. Floor and cap map onto the same speed range as before.
      const brightT = (this.brightness - EMBER_BRIGHT_FLOOR) / (EMBER_BRIGHT_CAP - EMBER_BRIGHT_FLOOR);
      const byBright = 2.05 - brightT * 1.77;
      this.y -= byBright * this.riseJitter * (0.42 + 0.94 * depth);
      // Wider sideways travel higher up, but the wobble slows and the sharp harmonic fades so it is not twitchy.
      const pace = 0.62 - 0.34 * climb;
      const swayScale = 0.32 + 1.9 * climb;
      const flutter = 0.16 * (1 - climb);
      this.phase += this.swaySpeed * pace * (0.85 + Math.sin(this.phase2) * flutter);
      this.phase2 += this.swaySpeed2 * pace;
      const wave =
        Math.sin(this.phase) * (0.7 + 0.3 * Math.abs(Math.sin(this.phase2))) +
        Math.sin(this.phase * 2.37 + this.phase2) * (0.36 * (1 - climb));
      this.x += wave * this.swayAmp * swayScale * 0.42 + this.drift * swayScale;

      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let brightTarget = this.brightness;
      if (dist < mouse.radius && dist > 0.5) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 1.5;
        this.y -= (dy / dist) * force * 1.5;
        brightTarget = Math.min(EMBER_BRIGHT_CAP, this.brightness + force * 0.22);
      }
      this.drawAlpha += (brightTarget - this.drawAlpha) * 0.08;

      if (this.y < -24) {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 30;
      }
      if (this.x < -30) this.x = width + 8;
      if (this.x > width + 30) this.x = -8;
    }

    draw() {
      const depth = Math.max(0, Math.min(1, this.y / Math.max(height, 1)));
      const sizePulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(this.sizePhase));
      const radius = this.radiusAt(this.y) * sizePulse;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.beginPath();
      ctx.moveTo(0, -radius);
      ctx.lineTo(radius * 0.9, radius * 0.62);
      ctx.lineTo(-radius * 0.9, radius * 0.62);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.drawAlpha * (0.8 + 0.2 * depth);
      ctx.shadowBlur = Math.min(1.5, radius * 0.2);
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  /* ---------------------------------------------------------------------
     VS Code — 程式碼字符模式
     以極低透明度的等寬字元漂浮，取代星空的連線與餘燼的上升感；
     游標掠過時把附近的字微微照亮，像編輯器照亮游標所在的程式碼。
     --------------------------------------------------------------------- */
  const CODE_GLYPHS = [
    'const', 'let', 'fn', 'async', 'await', 'import', 'export', 'type', 'class',
    '=>', '===', '!==', '&&', '||', '?.', '??', '::', '++', '--', '**',
    '{ }', '( )', '[ ]', '</>', '#', '@', '~', ';', '...', '0x1f', '//'
  ];

  /* Dark+ 語法色，但刻意不放灰色：灰字符會讓整個畫面顯得灰平。
     藍為主體，綠與橘只當點綴。 */
  function codeColor() {
    const roll = Math.random();
    if (roll < 0.4) return '#6aaee6';  // 關鍵字藍
    if (roll < 0.7) return '#84c3ff';  // 亮藍
    if (roll < 0.84) return '#a5e0ff'; // 淺藍
    if (roll < 0.94) return '#7fae6a'; // 字串綠
    return '#dda088';                  // 字串橘
  }

  class CodeParticle {
    constructor() {
      const size = 11 + Math.random() * 7;
      this.size = size;
      // 先把字型字串組好，避免每幀重新拼接。
      this.font = '600 ' + size.toFixed(1) + 'px "JetBrains Mono", Consolas, Monaco, monospace';
      this.glyph = CODE_GLYPHS[Math.floor(Math.random() * CODE_GLYPHS.length)];
      this.color = codeColor();
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      // 緩慢朝左上飄移，像程式碼往上捲動。
      this.vx = -(0.06 + Math.random() * 0.22);
      this.vy = -(0.1 + Math.random() * 0.34);
      this.baseAlpha = 0.12 + Math.random() * 0.22;
      this.alpha = this.baseAlpha;
      this.bobPhase = Math.random() * Math.PI * 2;
      this.bobSpeed = 0.004 + Math.random() * 0.01;
    }

    // 從底部重新進場並換一個字元，讓畫面不重複。
    recycle() {
      this.glyph = CODE_GLYPHS[Math.floor(Math.random() * CODE_GLYPHS.length)];
      this.color = codeColor();
      this.x = Math.random() * width;
      this.y = height + this.size * 2;
    }

    update() {
      this.bobPhase += this.bobSpeed;
      this.x += this.vx;
      this.y += this.vy + Math.sin(this.bobPhase) * 0.12;

      if (this.y < -this.size * 2) this.recycle();
      if (this.x < -this.size * 3) this.x = width + this.size;

      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let target = this.baseAlpha;
      if (dist < mouse.radius && dist > 0.5) {
        const force = (mouse.radius - dist) / mouse.radius;
        target = Math.min(0.74, this.baseAlpha + force * 0.5);
        this.x -= (dx / dist) * force * 0.5;
        this.y -= (dy / dist) * force * 0.5;
      }
      this.alpha += (target - this.alpha) * 0.09;
    }

    draw() {
      ctx.font = this.font;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fillText(this.glyph, this.x, this.y);
    }
  }

  /* 主題 → 粒子模式註冊表。
     新增主題只要在這裡補一筆（粒子類別 / 數量 / 是否畫連線 / 是否阻尼滑鼠慣性）。
     注意：必須放在類別定義之後，否則會踩到 class 的 TDZ。 */
  const MODE_SPECS = {
    starfield: { Ctor: Particle, count: PARTICLE_COUNT, lines: true, dampMouse: false },
    ember: { Ctor: EmberParticle, count: EMBER_COUNT, lines: false, dampMouse: true },
    vscode: { Ctor: CodeParticle, count: CODE_COUNT, lines: false, dampMouse: false }
  };

  function specFor(name) {
    return MODE_SPECS[name] || MODE_SPECS.starfield;
  }

  function spawn() {
    particles = [];
    const spec = specFor(mode);
    for (let i = 0; i < spec.count; i++) {
      particles.push(new spec.Ctor());
    }
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECT_DISTANCE) {
          const alpha = (1 - dist / CONNECT_DISTANCE) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#4facfe';
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Connect to mouse
      const mdx = mouse.x - particles[i].x;
      const mdy = mouse.y - particles[i].y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

      if (mDist < MOUSE_CONNECT_DISTANCE) {
        const alpha = (1 - mDist / MOUSE_CONNECT_DISTANCE) * 0.45;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = '#00f2fe';
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
  }

  let isPaused = false;
  let animationFrameId = null;

  function animate() {
    if (isPaused) return;

    ctx.clearRect(0, 0, width, height);

    const spec = specFor(mode);
    if (spec.dampMouse) {
      mouse.vx *= 0.82;
      mouse.vy *= 0.82;
    }

    for (let p of particles) {
      p.update();
      p.draw();
    }

    if (spec.lines) drawLines();
    ctx.globalAlpha = 1;

    animationFrameId = requestAnimationFrame(animate);
  }

  function pause() {
    if (isPaused) return;
    isPaused = true;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function resume() {
    if (!isPaused) return;
    isPaused = false;
    if (!document.hidden) {
      animate();
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    } else {
      if (!isPaused) animate();
    }
  });

  window.NebulaEngine = {
    pause,
    resume,
    setMode(next) {
      const resolved = MODE_SPECS[next] ? next : 'starfield';
      if (resolved === mode) return;
      mode = resolved;
      mouse.radius = 160;
      spawn();
      ctx.clearRect(0, 0, width, height);
    }
  };

  /* 依載入時的 data-theme 決定起始模式。
     head 的 bootstrap 已先把屬性套上，這裡只要對照註冊表，避免一開始就畫錯模式。 */
  const initialTheme = document.documentElement.getAttribute('data-theme');
  if (MODE_SPECS[initialTheme]) mode = initialTheme;

  spawn();
  animate();
})();

