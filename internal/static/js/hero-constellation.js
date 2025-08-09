/* Constellation network canvas animation for hero */
(function() {
  'use strict';

  function createConstellation(canvas, options) {
    const ctx = canvas.getContext('2d');
    const cfg = Object.assign({
      density: 0.00012, // points per pixel
      maxDist: 140,     // link distance in px
      speed: 0.25,
      color: 'rgba(146, 161, 255, 0.8)',
      linkColor: 'rgba(146, 161, 255, 0.35)',
      highlightColor: 'rgba(255, 255, 255, 0.9)'
    }, options || {});

    let points = [];
    let width = 0, height = 0, rafId = null;
    const mouse = { x: null, y: null };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawnPoints();
    }

    function spawnPoints() {
      const targetCount = Math.max(30, Math.floor(width * height * cfg.density));
      points = new Array(targetCount).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * cfg.speed,
        vy: (Math.random() - 0.5) * cfg.speed,
        r: 1 + Math.random() * 1.6
      }));
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      // Update positions
      for (const p of points) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      // Draw links
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i], b = points[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist2 = dx*dx + dy*dy;
          const max2 = cfg.maxDist * cfg.maxDist;
          if (dist2 < max2) {
            const alpha = 1 - dist2 / max2;
            ctx.strokeStyle = cfg.linkColor.replace(/\d?\.\d+\)$/,'') + alpha + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw points
      for (const p of points) {
        const dx = mouse.x == null ? 9999 : (p.x - mouse.x);
        const dy = mouse.y == null ? 9999 : (p.y - mouse.y);
        const d = Math.hypot(dx, dy);
        const isHot = d < 120;
        ctx.fillStyle = isHot ? cfg.highlightColor : cfg.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(step);
    }

    function destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
    }

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    window.addEventListener('resize', resize, { passive: true });
    canvas.addEventListener('mousemove', onMouseMove, { passive: true });
    resize();
    step();

    return { destroy };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
    const mode = hero.dataset.heroAnimation;
    if (mode !== 'constellation') return;

    const canvas = hero.querySelector('.hero-constellation-canvas');
    if (!canvas) return;

    // Size canvas to hero
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';

    // Tune density based on viewport
    const isMobile = window.innerWidth < 768;
    createConstellation(canvas, {
      density: isMobile ? 0.00008 : 0.00012,
      maxDist: isMobile ? 110 : 140,
      speed: isMobile ? 0.18 : 0.25,
      color: 'rgba(146, 161, 255, 0.7)',
      linkColor: 'rgba(146, 161, 255, 0.25)',
      highlightColor: 'rgba(255, 255, 255, 0.9)'
    });
  });
})();
