// Give each rates link a predictable landing position, including on repeat visits.
(() => {
  const root = document.documentElement;
  const destinations = new Set([
    'technician', 'vacation-home', 'home-check', 'computer',
    'webdesign', 'private-dining', 'travel', 'main'
  ]);

  const syncLanguageLinks = () => {
    document.querySelectorAll('.languages a[href]').forEach(link => {
      const url = new URL(link.href, location.href);
      url.hash = location.hash;
      link.href = url.href;
    });
  };

  const positionPage = () => {
    syncLanguageLinks();
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (id && !destinations.has(id)) return;
    const destination = id ? document.getElementById(id) : null;
    if (id && !destination) return;

    // Avoid competing smooth scrolls during loading and browser scroll restoration.
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    if (destination) {
      destination.querySelectorAll('.section-awaiting').forEach(element => {
        element.classList.remove('section-awaiting');
      });
      destination.scrollIntoView({behavior: 'instant', block: 'start'});
    } else {
      window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    }
    root.style.scrollBehavior = previous;
  };

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('pageshow', positionPage);
  window.addEventListener('hashchange', positionPage);
  window.addEventListener('popstate', positionPage);
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') ||
        (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname ||
        url.search !== location.search) return;
    let id;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
    if (id && !destinations.has(id)) return;
    event.preventDefault();
    if (url.href !== location.href) history.pushState(null, '', url.href);
    positionPage();
  });
  if (document.readyState === 'complete') positionPage();
})();
