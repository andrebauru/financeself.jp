/*!
 * FinanceSelf.jp — main.js
 * Language switching (i18n), contact modal, reveal-on-scroll, mobile menu.
 */
(function () {
  'use strict';

  var EMAIL = 'andretsc@financeself.jp';
  var GMAIL_URL = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + EMAIL;
  var MAILTO_URL = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Project inquiry — FinanceSelf.jp');
  var STORAGE_KEY = 'fs-lang';

  /* ---------------- i18n ---------------- */

  var I18N = window.FSI18N || null;

  function applyLanguage(lang) {
    if (!I18N || I18N.langs.indexOf(lang) === -1) return;
    var pack = I18N.dict[lang];
    if (!pack) return;

    // Text nodes
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-i18n');
      if (key in pack) nodes[i].textContent = pack[key];
    }

    // Nodes allowed to contain markup (gradient spans, <br>, …)
    var htmlNodes = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlNodes.length; j++) {
      var htmlKey = htmlNodes[j].getAttribute('data-i18n-html');
      if (htmlKey in pack) htmlNodes[j].innerHTML = pack[htmlKey];
    }

    // Attribute bindings: data-i18n-attr="content:key" or "text:key,aria-label:key"
    var attrNodes = document.querySelectorAll('[data-i18n-attr]');
    for (var k = 0; k < attrNodes.length; k++) {
      var bindings = attrNodes[k].getAttribute('data-i18n-attr').split(',');
      for (var b = 0; b < bindings.length; b++) {
        var parts = bindings[b].split(':');
        if (parts.length === 2 && parts[1] in pack) {
          var attr = parts[0].trim();
          if (attr === 'text') attrNodes[k].textContent = pack[parts[1]];
          else attrNodes[k].setAttribute(attr, pack[parts[1]]);
        }
      }
    }

    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    // Switcher state (navbar, mobile menu, footer)
    var buttons = document.querySelectorAll('[data-lang]');
    for (var m = 0; m < buttons.length; m++) {
      buttons[m].setAttribute('aria-pressed', String(buttons[m].getAttribute('data-lang') === lang));
    }
  }

  function detectLanguage() {
    var urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang && I18N && I18N.langs.indexOf(urlLang) !== -1) return urlLang;

    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* private mode */ }
    if (stored && I18N && I18N.langs.indexOf(stored) !== -1) return stored;

    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    if (I18N && I18N.langs.indexOf(nav) !== -1) return nav;
    return 'en';
  }

  var langButtons = document.querySelectorAll('[data-lang]');
  for (var q = 0; q < langButtons.length; q++) {
    langButtons[q].addEventListener('click', function () {
      applyLanguage(this.getAttribute('data-lang'));
    });
  }

  applyLanguage(detectLanguage());

  /* ---------------- Contact modal ---------------- */

  var modal = document.getElementById('contact-modal');
  var lastFocused = null;

  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { modal.classList.add('is-open'); });
    });
    var first = modal.querySelector('#modal-mail');
    if (first) first.focus();
  }

  function closeModal() {
    if (!modal || modal.classList.contains('hidden')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    window.setTimeout(function () { modal.classList.add('hidden'); }, 260);
    if (lastFocused) lastFocused.focus();
  }

  var openers = document.querySelectorAll('[data-open-contact]');
  for (var o = 0; o < openers.length; o++) {
    openers[o].addEventListener('click', openModal);
  }

  var closers = modal ? modal.querySelectorAll('[data-close-modal]') : [];
  for (var c = 0; c < closers.length; c++) {
    closers[c].addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', function (e) {
    if (!modal || modal.classList.contains('hidden')) return;

    if (e.key === 'Escape') { closeModal(); return; }

    // Minimal focus trap
    if (e.key === 'Tab') {
      var focusables = modal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------------- Modal actions ---------------- */

  var mailBtn = document.getElementById('modal-mail');
  if (mailBtn) {
    mailBtn.addEventListener('click', function () {
      window.location.href = MAILTO_URL;
    });
  }

  var gmailBtn = document.getElementById('modal-gmail');
  if (gmailBtn) {
    gmailBtn.addEventListener('click', function () {
      window.open(GMAIL_URL + '&su=' + encodeURIComponent('Project inquiry — FinanceSelf.jp'), '_blank', 'noopener');
    });
  }

  var copyBtn = document.getElementById('modal-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var done = function () {
        var labelCopy = copyBtn.querySelector('.label-copy');
        var labelCopied = copyBtn.querySelector('.label-copied');
        if (!labelCopy || !labelCopied) return;
        labelCopy.classList.add('hidden');
        labelCopied.classList.remove('hidden');
        labelCopied.classList.add('flex');
        window.setTimeout(function () {
          labelCopy.classList.remove('hidden');
          labelCopied.classList.add('hidden');
          labelCopied.classList.remove('flex');
        }, 2000);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EMAIL).then(done).catch(function () { legacyCopy(done); });
      } else {
        legacyCopy(done);
      }
    });
  }

  function legacyCopy(done) {
    var ta = document.createElement('textarea');
    ta.value = EMAIL;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
    done();
  }

  /* ---------------- Reveal on scroll ---------------- */

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('reveal-visible'); });
  }

  /* ---------------- Mobile menu ---------------- */

  var menuBtn = document.getElementById('menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      menuBtn.setAttribute('aria-expanded', String(!isOpen));
    });
    // Close menu when a link inside is clicked
    var menuLinks = mobileMenu.querySelectorAll('a');
    for (var l = 0; l < menuLinks.length; l++) {
      menuLinks[l].addEventListener('click', function () {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    }
  }
})();
