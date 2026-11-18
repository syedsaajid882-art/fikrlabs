// FikarLabs site script
(function () {

  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');

  // Sticky nav shadow on scroll
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  function setMenu(open) {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // Scroll reveal
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 80 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('visible'); });
  }

  // Contact form -> FormSubmit (sends to our inbox, no mail app needed)
  var CONTACT_EMAIL = 'ahmadshamir77@gmail.com';
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + CONTACT_EMAIL;
  var form = document.getElementById('contact-form');
  var status = form.querySelector('.form__status');
  var btn = form.querySelector('button[type="submit"]');
  var label = btn.querySelector('.btn__label');
  function setStatus(msg, type) {
    status.innerHTML = msg;
    status.className = 'form__status' + (type ? ' ' + type : '');
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['name', 'email', 'message'].forEach(function (id) {
      var f = form.elements[id];
      var valid = f.value.trim() !== '' && (id !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
      f.classList.toggle('invalid', !valid);
      f.setAttribute('aria-invalid', String(!valid));
      if (!valid) ok = false;
    });
    if (!ok) { setStatus('Please fill in your name, a valid email and project details.', 'error'); return; }
    var d = form.elements;
    var payload = {
      name: d.name.value.trim(),
      email: d.email.value.trim(),
      phone: d.phone.value.trim(),
      service: d.service.value,
      message: d.message.value.trim(),
      _subject: 'New enquiry from fikarlabs.in',
      _template: 'table',
      _captcha: 'false',
      _replyto: d.email.value.trim(),
      _honey: d._honey.value
    };
    btn.disabled = true; btn.classList.add('is-loading'); label.textContent = 'Sending…';
    setStatus('', '');
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (!r.ok || String(data.success) !== 'true') throw new Error(data.message || 'Request failed');
      });
    }).then(function () {
      form.reset();
      setStatus('Thank you! Your message has been sent. We’ll get back to you soon.', 'success');
    }).catch(function () {
      setStatus('Sorry, your message could not be sent. Please try again, or email us at <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a>.', 'error');
    }).then(function () {
      btn.disabled = false; btn.classList.remove('is-loading'); label.textContent = 'Send message';
    });
  });
})();

// Products: lightbox gallery + video sound toggle
(function () {
  var lb = document.getElementById('lightbox');
  if (!lb || typeof lb.showModal !== 'function') return;
  var img = lb.querySelector('img'), cap = lb.querySelector('figcaption');
  var items = [], idx = 0;
  function show(i) {
    idx = (i + items.length) % items.length;
    var b = items[idx];
    img.src = b.dataset.src; img.alt = b.dataset.caption || ''; cap.textContent = b.dataset.caption || '';
  }
  document.querySelectorAll('.gallery').forEach(function (g) {
    var list = Array.prototype.slice.call(g.querySelectorAll('.gallery__item'));
    list.forEach(function (b, i) {
      b.addEventListener('click', function () { items = list; show(i); lb.showModal(); });
    });
  });
  lb.querySelector('.lightbox__close').addEventListener('click', function () { lb.close(); });
  lb.querySelector('.lightbox__nav--prev').addEventListener('click', function () { show(idx - 1); });
  lb.querySelector('.lightbox__nav--next').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
})();
document.querySelectorAll('.sound-toggle').forEach(function (btn) {
  var v = btn.parentElement.querySelector('video');
  btn.addEventListener('click', function () {
    v.muted = !v.muted; if (!v.muted) v.play();
    btn.textContent = v.muted ? 'Unmute' : 'Mute';
    btn.setAttribute('aria-pressed', String(!v.muted));
  });
});
