(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // ----- Mobile navigation -----
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 821px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // ----- Missing images fall back to placeholders -----
  document.querySelectorAll('.shot, [data-optional-image]').forEach((box) => {
    const img = box.querySelector('img');
    const markMissing = () => box.classList.add('is-missing');
    if (img.complete && img.naturalWidth === 0) markMissing();
    img.addEventListener('error', markMissing);
  });

  // ----- Project links without a live URL yet -----
  document.querySelectorAll('.project-link').forEach((link) => {
    if (link.getAttribute('href') === '#') {
      link.setAttribute('aria-disabled', 'true');
      link.textContent = 'Live link coming soon';
      link.addEventListener('click', (e) => e.preventDefault());
    }
  });

  // ----- Active nav link -----
  const navLinks = [...nav.querySelectorAll('a')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          const on = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => spy.observe(s));

    // ----- Reveal project cards once -----
    const targets = document.querySelectorAll('.project');
    targets.forEach((t) => t.classList.add('reveal'));
    const reveal = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    targets.forEach((t) => reveal.observe(t));
  }

  // ----- Contact form (frontend only) -----
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const rules = {
    name: (v) => (v.trim() ? '' : 'Enter your name.'),
    email: (v) => (!v.trim() ? 'Enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address, like name@example.com.'),
    need: (v) => (v ? '' : 'Choose what you need.'),
    message: (v) => (v.trim() ? '' : 'Write a short message about your project.')
  };

  function validateField(name) {
    const field = form.elements[name];
    const error = document.getElementById(name + '-error');
    const msg = rules[name](field.value);
    error.textContent = msg;
    error.hidden = !msg;
    if (msg) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
    return !msg;
  }

  Object.keys(rules).forEach((name) => {
    form.elements[name].addEventListener('blur', () => validateField(name));
    form.elements[name].addEventListener('input', () => {
      if (form.elements[name].hasAttribute('aria-invalid')) validateField(name);
    });
  });

  form.addEventListener('submit', async (e) => {
  e.preventDefault();

  status.hidden = true;

  const results = Object.keys(rules).map(validateField);

  if (results.includes(false)) {
    form.querySelector('[aria-invalid="true"]').focus();
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');

  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';

  try {
    const response = await fetch('https://formspree.io/f/mbgdoyjb', {
      method: 'POST',
      body: new FormData(form),
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Form submission failed.');
    }

    form.reset();

    status.textContent = '✓ Message sent successfully! I’ll get back to you soon.';
    status.hidden = false;
    status.focus();

  } catch (error) {
    status.textContent =
      '✕ Something went wrong. Please try again later.';
    status.hidden = false;
    status.focus();

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Send Message';
  }
});

  // ----- Footer year -----
  document.getElementById('year').textContent = new Date().getFullYear();
})();
