/* ════════════════════════════════════════════════════════════════
   GSR — Game Seru Rudolf | script.js
   Shared script for all pages
════════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────
   1. STARFIELD CANVAS
────────────────────────────────────────── */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], shooters = [];

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function buildStars() {
    stars = [];
    const count = Math.min(Math.floor((W * H) / 6000), 320);
    for (let i = 0; i < count; i++) {
      stars.push({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     rnd(0.25, 1.6),
        speed: rnd(0.008, 0.05),
        phase: Math.random() * Math.PI * 2,
        hue:   Math.random() > 0.8 ? 260 : (Math.random() > 0.6 ? 210 : 220),
      });
    }
  }

  function spawnShooter() {
    if (shooters.length < 2 && Math.random() < 0.003) {
      shooters.push({
        x: rnd(W * 0.1, W * 0.9),
        y: rnd(0, H * 0.35),
        vx: rnd(3.5, 6.5),
        vy: rnd(1.8, 3.5),
        len: rnd(80, 160),
        life: 1,
        decay: rnd(0.014, 0.028),
      });
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    const t = performance.now() * 0.001;

    // draw stars
    stars.forEach(s => {
      const tw = 0.38 + 0.62 * Math.abs(Math.sin(t * s.speed * 28 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * tw, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 75%, 82%, ${(tw * 0.88).toFixed(2)})`;
      ctx.fill();
    });

    // draw shooting stars
    spawnShooter();
    for (let i = shooters.length - 1; i >= 0; i--) {
      const ss = shooters[i];
      const tailX = ss.x - ss.vx * 22;
      const tailY = ss.y - ss.vy * 22;
      const g = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      g.addColorStop(0, 'rgba(96,165,250,0)');
      g.addColorStop(1, `rgba(96,165,250,${(ss.life * 0.85).toFixed(2)})`);
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(ss.x, ss.y);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.6 * ss.life;
      ctx.stroke();
      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.life -= ss.decay;
      if (ss.life <= 0) shooters.splice(i, 1);
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => { resize(); buildStars(); });
  resize();
  buildStars();
  tick();
})();


/* ──────────────────────────────────────────
   2. NAVBAR — scroll class + mobile toggle
────────────────────────────────────────── */
(function initNavbar() {
  const nav    = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navLinks');
  if (!nav) return;

  // Scroll: add .scrolled when not at top
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile hamburger toggle
  if (toggle && menu) {
    const spans = toggle.querySelectorAll('span');
    let open = false;

    toggle.addEventListener('click', () => {
      open = !open;
      menu.classList.toggle('open', open);
      // animate to × shape
      if (open) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      }
    });

    // Close menu when a link is clicked
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        open = false;
        menu.classList.remove('open');
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      });
    });
  }
})();


/* ──────────────────────────────────────────
   3. SMOOTH SCROLL for anchor links
────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
        const top = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();


/* ──────────────────────────────────────────
   4. SCROLL REVEAL (IntersectionObserver)
────────────────────────────────────────── */
(function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  items.forEach(el => io.observe(el));
})();


/* ──────────────────────────────────────────
   5. ACTIVE NAV LINK on index page
   (highlights link based on scroll position)
────────────────────────────────────────── */
(function initActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !links.length) return;

  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;

  function update() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - navH - 40) {
        current = sec.id;
      }
    });
    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ──────────────────────────────────────────
   6. PARALLAX — gentle on nebula blobs
────────────────────────────────────────── */
(function initParallax() {
  const layer = document.querySelector('.nebula-layer');
  if (!layer) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    layer.style.transform = `translateY(${y * 0.04}px)`;
  }, { passive: true });
})();


/* ──────────────────────────────────────────
   7. PAGE LOAD animation trigger
────────────────────────────────────────── */
(function initPageLoad() {
  const wrapper = document.querySelector('.wrapper');
  if (wrapper) wrapper.classList.add('page-load');
})();
