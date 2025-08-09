/* Site-wide ambient background: smooth gradient mesh + subtle stars */
(function() {
  'use strict';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const body = document.body;
    if (!body || body.dataset.siteAmbient !== 'on') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationsEnabled = !reduceMotion.matches;
    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', e => (animationsEnabled = !e.matches));
    } else if (reduceMotion.addListener) {
      reduceMotion.addListener(e => (animationsEnabled = !e.matches));
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'site-ambient-canvas';
    Object.assign(canvas.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '0',
      pointerEvents: 'none'
    });
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0, dpr = 1;
    let rafId = 0, t = 0;
    let scrollY = window.scrollY || 0, lastScrollY = scrollY;

    const stars = [];
    function spawnStars() {
      stars.length = 0;
      const starCount = Math.round(Math.max(80, Math.min(220, (width * height) / 20000)));
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.2 + 0.4,
          a: Math.random() * Math.PI * 2,
          s: 0.6 + Math.random() * 0.8
        });
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth = window.innerWidth;
      height = canvas.clientHeight = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawnStars();
    }

    function drawGradientBackground(time) {
      // Smooth mesh-like gradient with 3 moving radial spots
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, '#0b0f14');
      g.addColorStop(1, '#0e141c');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      const spots = [
        { x: 0.2, y: 0.25, c1: 'rgba(90,200,255,0.14)', c2: 'transparent', r: 420 },
        { x: 0.8, y: 0.20, c1: 'rgba(140,90,255,0.12)', c2: 'transparent', r: 360 },
        { x: 0.5, y: 0.8,  c1: 'rgba(255,107,53,0.06)', c2: 'transparent', r: 380 }
      ];

      const driftX = Math.sin(time * 0.00012) * 60 + (scrollY * 0.02);
      const driftY = Math.cos(time * 0.0001) * 40 + (scrollY * -0.015);

      for (let i = 0; i < spots.length; i++) {
        const s = spots[i];
        const cx = s.x * width + driftX * (i === 0 ? 1 : i === 1 ? -0.6 : 0.4);
        const cy = s.y * height + driftY * (i === 2 ? 1 : -0.5);
        const r = s.r + Math.sin(time * 0.0002 + i) * 20;
        const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        rg.addColorStop(0, s.c1);
        rg.addColorStop(1, s.c2);
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawStars(time) {
      ctx.save();
      for (const star of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(time * 0.002 * star.s + star.a);
        ctx.globalAlpha = 0.25 + twinkle * 0.35;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y + (scrollY * -0.02), star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function loop(now) {
      if (!animationsEnabled) {
        // Static frame
        drawGradientBackground(0);
        drawStars(0);
        return;
      }
      t = now;
      ctx.clearRect(0, 0, width, height);
      drawGradientBackground(t);
      drawStars(t);
      rafId = requestAnimationFrame(loop);
    }

    function onScroll() {
      scrollY = window.scrollY || window.pageYOffset || 0;
      if (!animationsEnabled) {
        // Redraw once for static mode
        ctx.clearRect(0, 0, width, height);
        drawGradientBackground(t);
        drawStars(t);
      }
      lastScrollY = scrollY;
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    resize();
    rafId = requestAnimationFrame(loop);

    // Cleanup if needed
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(loop);
      }
    });
  }
})();
