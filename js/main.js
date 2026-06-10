/* ============================================================
   VIKINGPAL — Norse Guidance App
   Main JavaScript · OakDev & AI AB © 2026
   ============================================================ */
'use strict';

let currentLang  = 'en';
let translations = {};
const LANG_META  = {
  en: { flag: '🇬🇧', code: 'EN' },
};

const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

function get(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
}

/* ─── Ember / Fire Particles ─────────────────────────────── */
(function initEmbers() {
  const canvas = document.getElementById('emberCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, embers = [], animId, lastFrame = 0;
  const FPS = 30, INTERVAL = 1000 / FPS;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkEmber() {
    const gold = Math.random() > 0.45;
    const hue  = gold
      ? (Math.random() * 25 + 32)
      : (Math.random() * 18 + 12);
    const sat  = gold ? 85 : 75;
    return {
      x:     Math.random() * W,
      y:     H * 0.5 + Math.random() * H * 0.6,
      r:     Math.random() * 1.8 + 0.35,
      alpha: Math.random() * 0.60 + 0.12,
      vx:    (Math.random() - 0.5) * 0.45,
      vy:    -(Math.random() * 0.9 + 0.25),
      phase: Math.random() * Math.PI * 2,
      freq:  Math.random() * 0.012 + 0.005,
      wob:   Math.random() * 0.4 + 0.1,
      color: `hsla(${hue},${sat}%,72%,`,
    };
  }

  function populate() {
    const count = Math.min(130, Math.floor((W * H) / 9500));
    embers = Array.from({ length: count }, mkEmber);
  }

  function draw(ts) {
    animId = requestAnimationFrame(draw);
    if (ts - lastFrame < INTERVAL) return;
    lastFrame = ts;
    ctx.clearRect(0, 0, W, H);
    const t = ts * 0.001;
    for (const e of embers) {
      e.x += e.vx + Math.sin(t * e.freq * 35 + e.phase) * e.wob;
      e.y += e.vy;
      const a = e.alpha * (0.55 + 0.45 * Math.sin(t * e.freq * 70 + e.phase));
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = e.color + a + ')';
      ctx.fill();
      if (e.y < -30 || e.x < -30 || e.x > W + 30) {
        e.x     = Math.random() * W;
        e.y     = H * 0.5 + Math.random() * H * 0.5;
        e.alpha = Math.random() * 0.60 + 0.12;
      }
    }
  }

  resize();
  populate();
  animId = requestAnimationFrame(draw);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(animId); animId = null; }
    else { lastFrame = 0; animId = requestAnimationFrame(draw); }
  });

  new ResizeObserver(() => { resize(); populate(); }).observe(document.body);
})();

/* ─── Navigation ─────────────────────────────────────────── */
(function initNav() {
  const nav       = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!nav) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 50);
      ticking = false;
    });
  }, { passive: true });

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
      navLinks.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    navLinks?.addEventListener('click', e => {
      if (e.target.classList.contains('nav__link')) {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
})();

/* ─── Scroll Progress Bar ────────────────────────────────── */
(function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
      ticking = false;
    });
  }, { passive: true });
})();

/* ─── Reveal on Scroll ───────────────────────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = +(e.target.dataset.delay || 0);
        setTimeout(() => e.target.classList.add('visible'), delay);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -60px 0px' });

  $$('.reveal').forEach(el => obs.observe(el));
})();

/* ─── Count-Up Animation ─────────────────────────────────── */
(function initCountUp() {
  const els = $$('[data-count]');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      const el  = e.target;
      const end = parseFloat(el.dataset.count);
      const dur = 1400;
      const isFloat = el.dataset.count.includes('.');
      let start = null;
      function step(ts) {
        if (!start) start = ts;
        const prog = Math.min((ts - start) / dur, 1);
        const ease = 1 - Math.pow(1 - prog, 3);
        const val  = end * ease;
        el.textContent = isFloat ? val.toFixed(1) : Math.round(val).toString();
        if (prog < 1) requestAnimationFrame(step);
        else el.textContent = el.dataset.count;
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });

  els.forEach(el => obs.observe(el));
})();

/* ─── FAQ Accordion ──────────────────────────────────────── */
(function initFaq() {
  $$('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        $$('.faq-item').forEach(other => {
          if (other !== item && other.open) other.open = false;
        });
      }
    });
  });
})();

/* ─── Language Switcher ─────────────────────────────────── */
(function initLang() {
  const btn      = document.getElementById('langBtn');
  const dropdown = document.getElementById('langDropdown');
  const flagEl   = document.getElementById('langFlag');
  const codeEl   = document.getElementById('langCode');
  if (!btn) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', false);
  });

  dropdown.addEventListener('click', e => {
    e.stopPropagation();
    const opt = e.target.closest('[data-lang]');
    if (!opt) return;
    setLanguage(opt.dataset.lang);
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', false);
  });

  const saved       = localStorage.getItem('vikingpal_lang');
  const browserLang = (navigator.language || 'en').slice(0, 2).toLowerCase();
  const preferred   = saved || (LANG_META[browserLang] ? browserLang : 'en');
  setLanguage(preferred);

  async function setLanguage(lang) {
    if (!LANG_META[lang]) lang = 'en';
    currentLang = lang;
    localStorage.setItem('vikingpal_lang', lang);

    const meta = LANG_META[lang];
    if (flagEl) flagEl.textContent = meta.flag;
    if (codeEl) codeEl.textContent = meta.code;

    $$('[data-lang]', dropdown).forEach(o => {
      o.classList.toggle('active', o.dataset.lang === lang);
      o.setAttribute('aria-selected', o.dataset.lang === lang);
    });

    document.documentElement.setAttribute('lang', lang);
    await loadTranslations(lang);
    applyTranslations();
  }

  async function loadTranslations(lang) {
    try {
      const res = await fetch(`/locales/${lang}.json`);
      if (!res.ok) throw new Error();
      translations = await res.json();
    } catch {
      if (lang !== 'en') {
        try {
          const res = await fetch('/locales/en.json');
          translations = await res.json();
        } catch { translations = {}; }
      } else { translations = {}; }
    }
  }

  function applyTranslations() {
    $$('[data-i18n]').forEach(el => {
      const val = get(translations, el.dataset.i18n);
      if (val !== null) el.textContent = val;
    });
    $$('[data-i18n-html]').forEach(el => {
      const val = get(translations, el.dataset.i18nHtml);
      if (val !== null) el.innerHTML = val;
    });
    $$('[data-i18n-placeholder]').forEach(el => {
      const val = get(translations, el.dataset.i18nPlaceholder);
      if (val !== null) el.placeholder = val;
    });
  }
})();

/* ─── Cookie Consent ─────────────────────────────────────── */
(function initCookieBanner() {
  const KEY    = 'vikingpal_cookie';
  if (localStorage.getItem(KEY)) return;
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;

  setTimeout(() => banner.classList.add('visible'), 900);

  banner.querySelector('.cookie-btn--accept')?.addEventListener('click', () => {
    localStorage.setItem(KEY, 'accepted');
    banner.classList.remove('visible');
  });
  banner.querySelector('.cookie-btn--decline')?.addEventListener('click', () => {
    localStorage.setItem(KEY, 'declined');
    banner.classList.remove('visible');
  });
})();

/* ─── Parallax Hero Orbs (light) ────────────────────────── */
(function initParallax() {
  const orbs = $$('.hero-orb');
  if (!orbs.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      orbs.forEach((orb, i) => {
        const speed = 0.08 + i * 0.04;
        orb.style.transform = `translateY(${sy * speed}px)`;
      });
      ticking = false;
    });
  }, { passive: true });
})();
