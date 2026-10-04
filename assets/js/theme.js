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

    const label = document.getElementById('theme-select-label');
    if (label) label.textContent = next === 'ember' ? '熱情橘' : '星空';
    document.querySelectorAll('#theme-menu [role="option"]').forEach((opt) => {
      opt.setAttribute('aria-selected', opt.getAttribute('data-value') === next ? 'true' : 'false');
    });

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
    const root = document.querySelector('.theme-switcher');
    const button = document.getElementById('theme-select');
    const menu = document.getElementById('theme-menu');
    const options = menu ? Array.from(menu.querySelectorAll('[role="option"]')) : [];

    function closeMenu() {
      if (!menu || !button) return;
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    }

    function openMenu() {
      if (!menu || !button) return;
      menu.hidden = false;
      button.setAttribute('aria-expanded', 'true');
    }

    applyTheme(readTheme(), false);

    if (button && menu) {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        if (menu.hidden) openMenu();
        else closeMenu();
      });

      options.forEach((opt) => {
        opt.addEventListener('click', (event) => {
          event.stopPropagation();
          applyTheme(opt.getAttribute('data-value'), true);
          closeMenu();
        });
      });

      document.addEventListener('click', (event) => {
        if (root && !root.contains(event.target)) closeMenu();
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
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
