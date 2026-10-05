/**
 * 三種視覺風格的切換器（Hero 上的風格按鈕）。
 * 風格鍵＝對外稱呼，四個地方同名（THEMES 鍵／按鈕 data-theme-value／data-theme 屬性值／檔名）：
 *   'antigravity' ＝ Antigravity 風格模式（attr: null → 不掛 data-theme，沿用預設青藍星空）
 *   'vscode'      ＝ VS Code 風格模式（theme-vscode.css）
 *   'cursor'      ＝ Cursor 風格模式（theme-cursor.css）
 * 首次造訪（本機尚無紀錄）＝ VS Code 風格模式；之後一律依使用者的選擇還原。
 * 舊鍵名（starfield／ember）由 LEGACY_KEYS 自動遷移，舊訪客不必重選。
 */
(function () {
  const STORAGE_KEY = 'antigravity_visual_theme';
  const DEFAULT_THEME = 'vscode';

  /* 主題註冊表。鍵＝風格名，同時是 data-theme-value 與 data-theme 的屬性值。
     attr 為 null 表示沿用預設樣式（不掛 data-theme，Antigravity 風格的既有 CSS 依賴這一點）。
     新增風格：這裡補一筆 → 建 theme-<鍵>.css → nebula-canvas.js 的 MODE_SPECS 補一筆，
     並同步 index.html <head> 的 bootstrap 白名單（健檢 C5 會檢查），否則載入時會先閃一下預設風格。 */
  const THEMES = {
    antigravity: { attr: null },
    vscode: { attr: 'vscode' },
    cursor: { attr: 'cursor' }
  };

  /* 2026-10 風格鍵改名：starfield → antigravity、ember → cursor。
     舊訪客的 localStorage 還存著舊值，這裡做一次性轉換（不轉會被當成未知值而回預設風格）。 */
  const LEGACY_KEYS = { starfield: 'antigravity', ember: 'cursor' };

  function normalizeTheme(value) {
    return LEGACY_KEYS[value] || value;
  }

  function resolveTheme(value) {
    return THEMES[value] ? value : DEFAULT_THEME;
  }

  function readStored() {
    if (typeof SafeStorage !== 'undefined') return SafeStorage.get(STORAGE_KEY, '');
    try {
      return window.localStorage.getItem(STORAGE_KEY) || '';
    } catch (err) {
      /* 無痕模式等取用失敗：一律視為沒有紀錄 */
      return '';
    }
  }

  function applyTheme(theme, persist) {
    const next = resolveTheme(normalizeTheme(theme));
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
    const stored = readStored();
    /* 目前風格：舊鍵名（starfield／ember）會在這裡被換成新鍵名。 */
    const current = resolveTheme(normalizeTheme(stored));
    /* 紀錄值與正規鍵名不同時（首次造訪的空值、舊鍵名、垃圾值）寫回正規鍵名，
       之後只會用到新鍵名，head 白名單的比對也永遠命中。 */
    applyTheme(current, stored !== current);

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
