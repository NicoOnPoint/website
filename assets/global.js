(function () {
  // Force language switch behavior/layout so it cannot stay fixed via stale cached CSS.
  document.querySelectorAll('.lang-switch').forEach(function (sw) {
    var header = document.querySelector('header');
    if (header && sw.parentElement !== header) {
      header.insertBefore(sw, header.firstChild);
    }
    sw.style.position = 'absolute';
    sw.style.top = '16px';
    sw.style.right = '16px';
    sw.style.left = 'auto';
    sw.style.width = 'auto';
    sw.style.margin = '0';
    sw.style.padding = '0';
    sw.style.justifyContent = 'flex-end';
    sw.style.zIndex = '20';
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
