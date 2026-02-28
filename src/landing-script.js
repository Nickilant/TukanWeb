export function initLanding() {
  const cleanups = [];
  const addWindowListener = (event, handler, options) => {
    window.addEventListener(event, handler, options);
    cleanups.push(() => window.removeEventListener(event, handler, options));
  };
  const addDocumentListener = (event, handler, options) => {
    document.addEventListener(event, handler, options);
    cleanups.push(() => document.removeEventListener(event, handler, options));
  };

  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursor-trail');
  let mx = 0, my = 0, tx = 0, ty = 0;
  let trailRafId = 0;
  let bgRafId = 0;
  let carouselRafId = 0;

  const onMouseMoveCursor = (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (cursor) cursor.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
  };
  addDocumentListener('mousemove', onMouseMoveCursor);

  function animateTrail() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    if (trail) trail.style.transform = `translate(calc(${tx}px - 50%), calc(${ty}px - 50%))`;
    trailRafId = requestAnimationFrame(animateTrail);
  }
  animateTrail();

  document.querySelectorAll('a, button, .service-card, .portfolio-item, .cta-input').forEach((el) => {
    const enter = () => {
      cursor?.classList.add('is-hovering');
      trail?.classList.add('is-hovering');
    };
    const leave = () => {
      cursor?.classList.remove('is-hovering');
      trail?.classList.remove('is-hovering');
    };
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    cleanups.push(() => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
    });
  });

  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas?.getContext('2d');
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let W; let H;

  function resize() {
    if (!canvas) return;
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  addWindowListener('resize', resize);

  const onMouseMoveBg = (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  };
  addDocumentListener('mousemove', onMouseMoveBg);

  const PARTICLE_COUNT = 90;
  const particles = [];

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.size = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() < 0.5
        ? `rgba(255, ${80 + Math.floor(Math.random() * 80)}, 26,`
        : `rgba(255, ${180 + Math.floor(Math.random() * 75)}, 0,`;
      this.life = 0;
      this.maxLife = 200 + Math.random() * 400;
      if (init) this.life = Math.random() * this.maxLife;
    }
    update() {
      this.life++;
      if (this.life > this.maxLife) { this.reset(); return; }
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (dist < 200) {
        const force = ((200 - dist) / 200) * 0.015;
        this.vx -= (dx / dist) * force;
        this.vy -= (dy / dist) * force;
      }
      this.vx += (Math.random() - 0.5) * 0.02;
      this.vy += (Math.random() - 0.5) * 0.02;
      this.vx *= 0.98;
      this.vy *= 0.98;
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      const progress = this.life / this.maxLife;
      const alpha = this.alpha * Math.sin(progress * Math.PI);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + alpha + ')';
      ctx.fill();
    }
  }

  if (canvas && ctx) {
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    function drawConnections() {
      const maxDist = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 107, 26, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function drawMouseGlow() {
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
      grad.addColorStop(0, 'rgba(255, 107, 26, 0.06)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
      ctx.fill();
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      drawMouseGlow();
      particles.forEach((p) => { p.update(); p.draw(); });
      drawConnections();
      bgRafId = requestAnimationFrame(animate);
    }
    animate();
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible'));
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

  const heroTimer = setTimeout(() => {
    document.querySelectorAll('#hero .fade-up').forEach((el) => el.classList.add('visible'));
  }, 100);

  const scrollHint = document.getElementById('scroll-hint');
  const toTopBtn = document.getElementById('to-top');
  const toggleScrollUi = () => {
    const isScrolled = window.scrollY > 12;
    scrollHint?.classList.toggle('is-hidden', isScrolled);
    toTopBtn?.classList.toggle('visible', isScrolled);
  };
  addWindowListener('scroll', toggleScrollUi, { passive: true });
  toggleScrollUi();

  const portfolioTrack = document.getElementById('portfolio-track');
  const portfolioTrackWrap = document.querySelector('.portfolio-track-wrap');
  const portfolioPrev = document.getElementById('portfolio-prev');
  const portfolioNext = document.getElementById('portfolio-next');

  if (portfolioTrack && portfolioTrackWrap && portfolioPrev && portfolioNext) {
    const originalCount = portfolioTrack.children.length;
    portfolioTrack.innerHTML += portfolioTrack.innerHTML;
    let currentOffset = 0;
    let targetOffset = 0;
    let baseWidth = 1;
    let step = 1;
    let lastFrame = performance.now();
    let pauseUntil = 0;
    let nextAutoStepAt = Date.now() + 4200;

    const wrapOffset = (value) => {
      const mod = value % baseWidth;
      return mod < 0 ? mod + baseWidth : mod;
    };
    const pauseAutoplay = () => {
      pauseUntil = Date.now() + 30000;
      nextAutoStepAt = pauseUntil + 4200;
    };
    const recalcCarousel = () => {
      const styles = getComputedStyle(portfolioTrack);
      const gap = parseFloat(styles.gap || styles.columnGap || 20);
      const wrapStyles = getComputedStyle(portfolioTrackWrap);
      const wrapInnerWidth = portfolioTrackWrap.clientWidth - parseFloat(wrapStyles.paddingLeft || 0) - parseFloat(wrapStyles.paddingRight || 0);
      const itemWidth = (wrapInnerWidth - gap * 2) / 3;
      portfolioTrack.querySelectorAll('.portfolio-item').forEach((item) => {
        item.style.flexBasis = `${itemWidth}px`;
      });
      step = itemWidth + gap;
      baseWidth = Math.max(step * originalCount, 1);
      currentOffset = wrapOffset(currentOffset);
      targetOffset = currentOffset;
      portfolioTrack.style.transform = `translate3d(${-currentOffset}px, 0, 0)`;
    };

    const prevClick = () => { targetOffset -= step; pauseAutoplay(); };
    const nextClick = () => { targetOffset += step; pauseAutoplay(); };
    portfolioPrev.addEventListener('click', prevClick);
    portfolioNext.addEventListener('click', nextClick);
    cleanups.push(() => {
      portfolioPrev.removeEventListener('click', prevClick);
      portfolioNext.removeEventListener('click', nextClick);
    });

    addWindowListener('resize', recalcCarousel);
    recalcCarousel();

    const animateCarousel = (now) => {
      const dt = (now - lastFrame) / 1000;
      lastFrame = now;
      const nowTs = Date.now();
      if (nowTs >= pauseUntil && nowTs >= nextAutoStepAt) {
        targetOffset += step;
        nextAutoStepAt = nowTs + 4200;
      }
      const diff = targetOffset - currentOffset;
      currentOffset += diff * Math.min(1, dt * 8.5);
      if (Math.abs(diff) < 0.04) currentOffset = targetOffset;
      portfolioTrack.style.transform = `translate3d(${-wrapOffset(currentOffset)}px, 0, 0)`;
      carouselRafId = requestAnimationFrame(animateCarousel);
    };

    carouselRafId = requestAnimationFrame(animateCarousel);
  }

  const TG_BOT_TOKEN = import.meta.env.VITE_TG_BOT_TOKEN;
  const TG_CHAT_ID = import.meta.env.VITE_TG_CHAT_ID;

  async function sendTelegramRequest(value) {
    if (!TG_BOT_TOKEN || !TG_CHAT_ID) return false;
    const text = `Новая заявка с сайта Tukan Web Studio!\n\nКонтакт: ${value}\nВремя: ${new Date().toLocaleString('ru-RU')}`;
    try {
      const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text }),
      });
      const data = await res.json();
      return data.ok;
    } catch {
      return false;
    }
  }

  function playFormAnimation() {
    return new Promise((resolve) => {
      const pill = document.getElementById('cta-pill');
      const loader = document.getElementById('cta-loader');
      const ring = document.getElementById('loader-ring');
      const success = document.getElementById('cta-success');
      pill?.classList.add('hidden');
      setTimeout(() => { loader?.classList.add('visible'); ring?.classList.add('spinning'); }, 280);
      setTimeout(() => { ring?.classList.remove('spinning'); loader?.classList.add('explode'); }, 1400);
      setTimeout(() => { loader?.classList.remove('visible', 'explode'); success?.classList.add('visible'); }, 1850);
      setTimeout(() => { success?.classList.remove('visible'); }, 3600);
      setTimeout(() => { pill?.classList.remove('hidden'); resolve(); }, 4000);
    });
  }

  window.sendToTelegram = async function sendToTelegram() {
    const input = document.getElementById('cta-contact');
    const value = input?.value.trim();
    if (!input || !value) {
      if (input) {
        input.style.animation = 'shake 0.4s ease';
        input.style.borderColor = '#ff4444';
        setTimeout(() => { input.style.animation = ''; input.style.borderColor = ''; }, 500);
      }
      return;
    }
    const [ok] = await Promise.all([sendTelegramRequest(value), playFormAnimation()]);
    if (ok) input.value = '';
  };

  return () => {
    delete window.sendToTelegram;
    observer.disconnect();
    clearTimeout(heroTimer);
    cancelAnimationFrame(trailRafId);
    cancelAnimationFrame(bgRafId);
    cancelAnimationFrame(carouselRafId);
    cleanups.forEach((fn) => fn());
  };
}
