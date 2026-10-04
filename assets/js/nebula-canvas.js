/**
 * Antigravity Nebula Canvas - Interactive Particle Constellation Engine
 */
(function() {
  const canvas = document.getElementById('nebula-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mode = document.documentElement.getAttribute('data-theme') === 'ember' ? 'ember' : 'starfield';
  let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, radius: 160 };

  const PARTICLE_COUNT = 75;
  /* Ash has no connecting lines. A higher count keeps the field present. */
  const EMBER_COUNT = 210;
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

  const EMBER_COLORS = ['#b85a2a', '#d4783a', '#8d4e32', '#e8b07a', '#ff8f3c', '#6e4634'];

  class EmberParticle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.baseRadius = 1.35 + Math.random() * 5.4;
      this.baseAlpha = Math.random() * 0.22 + 0.42;
      this.alpha = this.baseAlpha;
      this.phase = Math.random() * Math.PI * 2;
      this.phase2 = Math.random() * Math.PI * 2;
      this.swayAmp = 0.35 + Math.random() * 1.45;
      this.swaySpeed = 0.007 + Math.random() * 0.055;
      this.swaySpeed2 = 0.004 + Math.random() * 0.033;
      this.color = EMBER_COLORS[(Math.random() * EMBER_COLORS.length) | 0];
      // Persistent lean to one side, so the path is not a symmetric wave.
      this.drift = (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.4);
      const sizeT = Math.max(0, Math.min(1, (this.baseRadius - 1.35) / 5.4));
      // Large embers crawl; small sparks rise several times faster. Jitter stays inside that gap.
      this.rise = (2.05 - sizeT * 1.82) * (0.78 + Math.random() * 0.44);
    }

    radiusAt(y) {
      const depth = Math.max(0, Math.min(1, y / Math.max(height, 1)));
      return this.baseRadius * (0.24 + 0.76 * depth);
    }

    update() {
      const depth = Math.max(0, Math.min(1, this.y / Math.max(height, 1)));
      const climb = 1 - depth;
      // A little faster at the bottom than before. Still eases to about 31% of that speed at the top.
      this.y -= this.rise * (0.42 + 0.94 * depth);
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

      if (dist < mouse.radius && dist > 0.5) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 1.5;
        this.y -= (dy / dist) * force * 1.5;
        this.alpha = Math.min(1, this.baseAlpha + force * 0.5);
      } else {
        this.alpha = this.baseAlpha * (0.86 + 0.14 * Math.sin(this.phase));
      }

      if (this.y < -24) {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 30;
        this.alpha = this.baseAlpha;
      }
      if (this.x < -30) this.x = width + 8;
      if (this.x > width + 30) this.x = -8;
    }

    draw() {
      const radius = this.radiusAt(this.y);
      const depth = Math.max(0, Math.min(1, this.y / Math.max(height, 1)));
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha * (0.5 + 0.5 * depth);
      ctx.shadowBlur = Math.min(4, radius);
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function spawn() {
    particles = [];
    const Ctor = mode === 'ember' ? EmberParticle : Particle;
    const count = mode === 'ember' ? EMBER_COUNT : PARTICLE_COUNT;
    for (let i = 0; i < count; i++) {
      particles.push(new Ctor());
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

    if (mode === 'ember') {
      mouse.vx *= 0.82;
      mouse.vy *= 0.82;
    }

    for (let p of particles) {
      p.update();
      p.draw();
    }

    if (mode !== 'ember') drawLines();
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
      const resolved = next === 'ember' ? 'ember' : 'starfield';
      if (resolved === mode) return;
      mode = resolved;
      mouse.radius = 160;
      spawn();
      ctx.clearRect(0, 0, width, height);
    }
  };

  spawn();
  animate();
})();

