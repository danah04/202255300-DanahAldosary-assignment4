document.addEventListener('DOMContentLoaded', () => {
  function throttle(fn, limit) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= limit) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  function updateActiveNav() {
    const triggerY = window.scrollY + window.innerHeight * 0.33;
    let currentId = sections[0]?.id || '';
    sections.forEach(section => {
      if (section.offsetTop <= triggerY) currentId = section.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }

  window.addEventListener('scroll', throttle(updateActiveNav, 80));
  updateActiveNav();

  const navToggle = document.querySelector('.nav-toggle');
  const navLinksEl = document.querySelector('.nav-links');
  if (navToggle && navLinksEl) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinksEl.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.innerHTML = isOpen ? '&times;' : '&#9776;';
    });
    navLinks.forEach(link => link.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.innerHTML = '&#9776;';
    }));
  }

  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.body.classList.add('dark-mode');

  function updateThemeLabel() {
    if (!themeToggle) return;
    const dark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = dark ? 'Light' : 'Dark';
    themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  }
  updateThemeLabel();

  themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const dark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    updateThemeLabel();
  });

  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  function setError(errorId, input, message) {
    const error = document.getElementById(errorId);
    if (error) error.textContent = message;
    input.classList.add('error');
    input.addEventListener('input', () => {
      input.classList.remove('error');
      if (error) error.textContent = '';
    }, { once: true });
  }

  function clearErrors() {
    document.querySelectorAll('.form-error').forEach(element => { element.textContent = ''; });
    document.querySelectorAll('.form-input.error').forEach(element => element.classList.remove('error'));
    if (formFeedback) {
      formFeedback.textContent = '';
      formFeedback.className = 'form-feedback';
    }
  }

  contactForm?.addEventListener('submit', event => {
    event.preventDefault();
    clearErrors();
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    const submitButton = contactForm.querySelector('button[type="submit"]');
    let valid = true;

    if (!name.value.trim()) { setError('name-error', name, 'Please enter your name.'); valid = false; }
    if (!email.value.trim()) { setError('email-error', email, 'Please enter your email.'); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setError('email-error', email, 'Please enter a valid email address.'); valid = false; }
    if (!message.value.trim()) { setError('message-error', message, 'Please write a message.'); valid = false; }
    if (!valid) return;

    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';

    fetch('https://formspree.io/f/xlgaelwg', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(contactForm)
    })
      .then(response => {
        if (!response.ok) throw new Error('Submission failed');
        contactForm.reset();
        formFeedback.textContent = 'Message sent. I will get back to you soon.';
        formFeedback.className = 'form-feedback success';
      })
      .catch(() => {
        formFeedback.textContent = 'Something went wrong. Please email me directly.';
        formFeedback.className = 'form-feedback error';
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Send message';
      });
  });

  const year = document.getElementById('footer-year');
  if (year) year.textContent = new Date().getFullYear();
});
