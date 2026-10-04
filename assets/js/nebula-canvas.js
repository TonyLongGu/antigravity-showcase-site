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
  let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, radius: mode === 'ember' ? 170 : 160 };

  const PARTICLE_COUNT = 75;
  /* Embers have no connecting lines, so a slightly higher count keeps a similar visual density. */
  const EMBER_COUNT = 100;
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

  const EMBER_COLORS = ['#ff5a00', '#ff7a1a', '#ff9328', '#ffb347', '#ffd7a8', '#e04e00'];

  class EmberParticle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      const hot = Math.random();
      this.hot = hot > 0.72;
      this.radius = this.hot ? Math.random() * 0.7 + 0.5 : Math.random() * 1.3 + 0.75;
      this.baseAlpha = this.hot ? Math.random() * 0.28 + 0.5 : Math.random() * 0.26 + 0.18;
      this.alpha = this.baseAlpha;
      this.phase = Math.random() * Math.PI * 2;
      this.flickerSpeed = 0.02 + Math.random() * 0.045;
      this.color = EMBER_COLORS[(Math.random() * EMBER_COLORS.length) | 0];
      this.rise = -(Math.random() * 0.42 + 0.2);
      this.vx = (Math.random() - 0.5) * 0.22;
      this.vy = this.rise;
    }

    update() {
      this.phase += this.flickerSpeed;
      this.x += this.vx;
      this.y += this.vy;

      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius && dist > 0.5) {
        const force = (mouse.radius - dist) / mouse.radius;
        const nx = dx / dist;
        const ny = dy / dist;
        this.vx += nx * force * 0.95 + mouse.vx * force * 0.05;
        this.vy += ny * force * 0.6 + mouse.vy * force * 0.05;
        this.vx += -ny * force * 0.38;
        this.vy -= force * 0.32;
        this.alpha = Math.min(0.95, this.baseAlpha + force * 0.5);
      } else {
        const flicker = 0.78 + 0.22 * Math.sin(this.phase);
        this.alpha = this.baseAlpha * flicker;
        this.vy += (this.rise - this.vy) * 0.02;
        this.vx += (Math.sin(this.phase) * 0.08 - this.vx) * 0.012;
      }

      this.vx *= 0.988;

      if (this.y < -18) {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 28;
        this.vx = (Math.random() - 0.5) * 0.22;
        this.vy = this.rise;
        this.alpha = this.baseAlpha;
      }
      if (this.x < -24) this.x = width + 12;
      if (this.x > width + 24) this.x = -12;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = this.hot ? 6 : 4;
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
      mouse.radius = mode === 'ember' ? 170 : 160;
      spawn();
      ctx.clearRect(0, 0, width, height);
    }
  };

  spawn();
  animate();
})();

