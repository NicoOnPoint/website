(function () {
  // Force language switch behavior/layout so it stays consistent across pages.
  document.querySelectorAll('.lang-switch').forEach(function (sw) {
    sw.style.setProperty('position', 'fixed', 'important');
    sw.style.setProperty('top', '16px', 'important');
    sw.style.setProperty('right', '16px', 'important');
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
})();
