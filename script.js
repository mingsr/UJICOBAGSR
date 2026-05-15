/* ═══════════════════════════════════════════════════════
   GSR — Game Seru Rudolf | script.js
═══════════════════════════════════════════════════════ */

/* ─── STARFIELD CANVAS ─── */
(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], shootingStars = [], raf;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomRange(a, b) { return a + Math.random() * (b - a); }

  function initStars(count = 260) {
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: randomRange(0.3, 1.6),
        speed: randomRange(0.008, 0.04),
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.85 ? 220 : (Math.random() > 0.7 ? 280 : 210),
      });
    }
  }

  function spawnShooting() {
    if (shootingStars.length < 2 && Math.random() < 0.004) {
      const startX = randomRange(W * 0.1, W * 0.9);
      const startY = randomRange(0, H * 0.4);
      shootingStars.push({
        x: startX, y: startY,
        vx: randomRange(3, 6),
        vy: randomRange(1.5, 3),
        len: randomRange(80, 160),
        life: 1,
        decay: randomRange(0.012, 0.025),
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const now = performance.now() * 0.001;

    // static stars
    stars.forEach(s => {
      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(now * s.speed * 30 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * twinkle, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 80%, 82%, ${twinkle * 0.9})`;
      ctx.fill();
    });

    // shooting stars
    spawnShooting();
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      const grad = ctx.createLinearGradient(ss.x - ss.vx * ss.len / ss.vx, ss.y - ss.vy * ss.len / ss.vx, ss.x, ss.y);
      grad.addColorStop(0, `rgba(74,158,255,0)`);
      grad.addColorStop(1, `rgba(74,158,255,${ss.life * 0.8})`);
      ctx.beginPath();
      ctx.moveTo(ss.x - ss.vx * 20, ss.y - ss.vy * 20);
      ctx.lineTo(ss.x, ss.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5 * ss.life;
      ctx.stroke();
      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.life -= ss.decay;
      if (ss.life <= 0) shootingStars.splice(i, 1);
    }

    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); initStars(); });
  resize();
  initStars();
  draw();
})();

/* ─── NAVBAR SCROLL ─── */
(function () {
  const nav = document.getElementById('navbar');
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ─── MOBILE NAV TOGGLE ─── */
(function () {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');
  const spans  = toggle.querySelectorAll('span');

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    // animate hamburger → X
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  // close on link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    });
  });
})();

/* ─── SCROLL REVEAL ─── */
(function () {
  const targets = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );
  targets.forEach(t => observer.observe(t));
})();

/* ─── SMOOTH SCROLL for anchor links ─── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();

/* ─── PARALLAX NEBULAS ON SCROLL ─── */
(function () {
  const nebulas = document.querySelectorAll('.nebula');
  function onScroll() {
    const y = window.scrollY;
    nebulas.forEach((n, i) => {
      const factor = i % 2 === 0 ? 0.06 : -0.04;
      n.style.transform = `translateY(${y * factor}px)`;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ─── CARD SPOTLIGHT EFFECT ─── */
(function () {
  document.querySelectorAll('.nav-card, .info-card, .stat-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
})();
