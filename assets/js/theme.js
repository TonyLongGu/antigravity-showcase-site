/**
 * Visual style switcher on the hero pills.
 * Antigravity → 星空 (starfield, the default). Cursor → 熱情橘 (ember).
 * VS Code → 編輯器 (vscode).
 * The choice is stored in the browser and restored on reload.
 */
(function () {
  const STORAGE_KEY = 'antigravity_visual_theme';
  const DEFAULT_THEME = 'starfield';

  /* 主題註冊表。鍵＝按鈕上的 data-theme-value，同時也是 data-theme 的屬性值。
     attr 為 null 表示沿用預設星空（不掛 data-theme，既有 CSS 依賴這一點）。
     新增主題：這裡補一筆 → 建 theme-<鍵>.css → nebula-canvas.js 的 MODE_SPECS 補一筆，
     並同步 index.html <head> 的 bootstrap 白名單，否則載入時會先閃一下星空。 */
  const THEMES = {
    starfield: { attr: null },
    ember: { attr: 'ember' },
    vscode: { attr: 'vscode' }
  };

  function resolveTheme(value) {
    return THEMES[value] ? value : DEFAULT_THEME;
  }

  function readTheme() {
    let stored = DEFAULT_THEME;
    if (typeof SafeStorage !== 'undefined') {
      stored = SafeStorage.get(STORAGE_KEY, DEFAULT_THEME);
    } else {
      try {
        stored = window.localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
      } catch (err) {
        stored = DEFAULT_THEME;
      }
    }
    return resolveTheme(stored);
  }

  function applyTheme(theme, persist) {
    const next = resolveTheme(theme);
    const attr = THEMES[next].attr;
    if (attr) {
      document.documentElement.setAttribute('data-theme', attr);
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

    document.querySelectorAll('.hero-ide-pills [data-theme-value]').forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-theme-value') === next ? 'true' : 'false');
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
    if (!sections.length) return;

    let locked = false;
    let lockTimer = null;

    function setCurrent(link) {
      links.forEach((item) => {
        item.classList.toggle('nav-current', item === link);
      });
    }

    // 畫面捲到最底時，最後一個區塊必定視為目前區塊。
    // 否則高度不足的區塊（例如 #author）頂端永遠越不過判定線，會誤標成上一個區塊。
    function isAtBottom() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      return scrollable > 100 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    }

    function update() {
      const line = Math.min(200, window.innerHeight * 0.32);
      let current = null;
      sections.forEach((item) => {
        if (item.el.getBoundingClientRect().top <= line) current = item.link;
      });
      if (isAtBottom()) current = sections[sections.length - 1].link;
      setCurrent(current);
    }

    function unlock() {
      locked = false;
      clearTimeout(lockTimer);
      update();
    }

    // 點擊導覽後先鎖定 scrollspy：平滑捲動期間不重新判定，
    // 避免中途經過的區塊一個一個被標成目前項目而閃亮。
    function lock() {
      locked = true;
      clearTimeout(lockTimer);
      // 保險解鎖：目標若已在定位、不會產生捲動事件時，仍能於稍後同步一次。
      lockTimer = setTimeout(unlock, 500);
    }

    function onScroll() {
      if (locked) {
        // 捲動事件仍在發生，代表平滑捲動尚未結束；持續延後解鎖。
        clearTimeout(lockTimer);
        lockTimer = setTimeout(unlock, 130);
        return;
      }
      update();
    }

    links.forEach((link) => {
      link.addEventListener('click', () => {
        setCurrent(link); // 點下去立刻切換成該項目，不等捲動
        lock();
      });
    });

    // 使用者主動捲動時立即交還控制權，避免鎖定卡住 scrollspy
    ['wheel', 'touchstart', 'keydown'].forEach((evt) => {
      window.addEventListener(evt, () => {
        if (locked) unlock();
      }, { passive: true });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      if (!locked) update();
    });
    update();
  }

  function initThemeSwitcher() {
    applyTheme(readTheme(), false);

    document.querySelectorAll('.hero-ide-pills [data-theme-value]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = btn.getAttribute('data-theme-value');
        if (!THEMES[value]) return;
        applyTheme(value, true);
      });
    });

    initNavCurrent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeSwitcher);
  } else {
    initThemeSwitcher();
  }
})();
