/* ================================================================
   Dr. Ahmad Nasikun – main.js
   ================================================================ */

'use strict';

// ── Navbar scroll effect ─────────────────────────────────────────
const navbar = document.getElementById('navbar');
const backTop = document.getElementById('back-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
    backTop?.classList.add('visible');
  } else {
    navbar.classList.remove('scrolled');
    backTop?.classList.remove('visible');
  }

  // Active nav link highlight
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
});

// ── Back to top ──────────────────────────────────────────────────
backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Mobile hamburger ─────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  // animate burger to X
  const spans = hamburger.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// Close nav on link click
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger?.querySelectorAll('span').forEach(s => {
      s.style.transform = ''; s.style.opacity = '';
    });
  });
});

// ── Scroll animation (IntersectionObserver) ──────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      // stagger children if needed
      const delay = e.target.dataset.delay || 0;
      e.target.style.transitionDelay = `${delay}ms`;
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

// ── Publication filter ───────────────────────────────────────────
const filterBtns = document.querySelectorAll('.pub-filter');
const pubItems   = document.querySelectorAll('.pub-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    pubItems.forEach(item => {
      const show = filter === 'all' || item.dataset.type === filter;
      item.style.display = show ? 'grid' : 'none';
      if (show) {
        item.style.animation = 'none';
        requestAnimationFrame(() => {
          item.style.animation = '';
          item.classList.remove('visible');
          setTimeout(() => item.classList.add('visible'), 10);
        });
      }
    });
  });
});

// ── Smooth scroll for all internal links ─────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── Year auto-update in footer ───────────────────────────────────
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
