/**
 * Visual style switcher.
 * 星空 (starfield) is the default and leaves the original theme untouched.
 * 熱情橘 (ember) is stored in the browser and restored on reload.
 */
(function () {
  const STORAGE_KEY = 'antigravity_visual_theme';

  function readTheme() {
    let stored = 'starfield';
    if (typeof SafeStorage !== 'undefined') {
      stored = SafeStorage.get(STORAGE_KEY, 'starfield');
    } else {
      try {
        stored = window.localStorage.getItem(STORAGE_KEY) || 'starfield';
      } catch (err) {
        stored = 'starfield';
      }
    }
    return stored === 'ember' ? 'ember' : 'starfield';
  }

  function applyTheme(theme, persist) {
    const next = theme === 'ember' ? 'ember' : 'starfield';
    if (next === 'ember') {
      document.documentElement.setAttribute('data-theme', 'ember');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    if (persist) {
      if (typeof SafeStorage !== 'undefined') {
        SafeStorage.set(STORAGE_KEY, next);
      } else {
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch (err) {
          /* ignore private-mode storage failures */
        }
      }
    }

    const select = document.getElementById('theme-select');
    if (select && select.value !== next) select.value = next;

    if (window.NebulaEngine && typeof window.NebulaEngine.setMode === 'function') {
      window.NebulaEngine.setMode(next);
    }
  }

  function initNavCurrent() {
    const links = Array.from(document.querySelectorAll('.nav-links .nav-link'));
    if (!links.length) return;

    const sections = links.map((link) => {
      const id = (link.getAttribute('href') || '').replace('#', '');
      const el = id ? document.getElementById(id) : null;
      return el ? { link, el } : null;
    }).filter(Boolean);

    function update() {
      const line = Math.min(200, window.innerHeight * 0.32);
      let current = null;
      sections.forEach((item) => {
        if (item.el.getBoundingClientRect().top <= line) current = item.link;
      });
      links.forEach((link) => {
        link.classList.toggle('nav-current', link === current);
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  function initThemeSwitcher() {
    applyTheme(readTheme(), false);
    const select = document.getElementById('theme-select');
    if (select) {
      select.addEventListener('change', () => {
        applyTheme(select.value, true);
      });
    }
    initNavCurrent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeSwitcher);
  } else {
    initThemeSwitcher();
  }
})();
