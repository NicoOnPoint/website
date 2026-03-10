(function () {
  // Force language switch behavior/layout so it stays consistent across pages.
  document.querySelectorAll('.lang-switch').forEach(function (sw) {
    var isMobile = window.matchMedia('(max-width: 900px)').matches;
    sw.style.setProperty('position', 'fixed', 'important');
    sw.style.setProperty('top', isMobile ? '8px' : '16px', 'important');
    sw.style.setProperty('right', isMobile ? '8px' : '16px', 'important');
    sw.style.setProperty('bottom', 'auto', 'important');
    sw.style.setProperty('left', 'auto', 'important');
    sw.style.setProperty('width', 'auto', 'important');
    sw.style.setProperty('margin', '0', 'important');
    sw.style.setProperty('padding', '0', 'important');
    sw.style.setProperty('justify-content', 'flex-end', 'important');
    sw.style.setProperty('z-index', '1300', 'important');
  });

  var btn = document.createElement('a');
  btn.className = 'to-top';
  btn.href = '#';
  btn.setAttribute('aria-label', 'Naar boven');
  btn.innerHTML = '&#8593;';
  document.body.appendChild(btn);

  function toggleBtn() {
    if (window.scrollY > 260) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleBtn, { passive: true });
  toggleBtn();

  var labels = {
    nl: 'Menu openen',
    en: 'Open menu',
    sv: 'Oppna meny'
  };

  function closeMobileMenu(button, nav) {
    button.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }

  document.querySelectorAll('header nav.contact-icons').forEach(function (nav, index) {
    if (nav.dataset.mobileMenuReady === 'true') return;

    nav.dataset.mobileMenuReady = 'true';
    nav.classList.add('site-nav');

    var lang = (document.documentElement.lang || 'en').slice(0, 2);
    var button = document.createElement('button');
    var navId = nav.id || ('site-nav-' + index);
    nav.id = navId;
    button.type = 'button';
    button.className = 'menu-toggle';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', navId);
    button.setAttribute('aria-label', labels[lang] || labels.en);
    button.innerHTML = '<span class="menu-toggle__icon" aria-hidden="true"></span>';
    nav.parentNode.insertBefore(button, nav);

    button.addEventListener('click', function () {
      var isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileMenu(button, nav);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeMobileMenu(button, nav);
      }
    });

    window.addEventListener('resize', function () {
      if (!window.matchMedia('(max-width: 720px)').matches) {
        closeMobileMenu(button, nav);
      }
    });
  });

  document.querySelectorAll('img.brand').forEach(function (logo) {
    if (logo.closest('a')) return;

    var lang = (document.documentElement.lang || 'en').slice(0, 2);
    var href = 'index.html';
    if (lang === 'sv') href = 'index.html';
    if (lang === 'en') href = 'index.html';
    if (lang === 'nl') href = 'index.html';

    var link = document.createElement('a');
    link.href = href;
    link.setAttribute('aria-label', 'Home');
    link.className = 'brand-link';
    logo.parentNode.insertBefore(link, logo);
    link.appendChild(logo);
  });
})();
