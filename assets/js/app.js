/**
 * Antigravity Plugins Showcase - Main Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Brand & GitHub Links
  setupSiteConfig();

  // 2. Initialize i18n
  updateDOMTranslations();

  // 3. Initialize Filters & Cards
  initFilters();
  renderPlugins();

  // 4. Initialize Navigation & Scrollspy
  initNavigation();

  // 5.5 Initialize Video Showcase
  initVideoShowcase();
  initCustomVideoPlayer();

  // 5.8 Initialize Developer Notes Article
  renderDeveloperNotes();

  // 6. Set Dynamic Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});

function setupSiteConfig() {
  const githubLinks = document.querySelectorAll('.github-link');
  githubLinks.forEach(link => {
    link.href = SITE_CONFIG.githubUrl;
  });

  const authorEls = document.querySelectorAll('.site-author');
  authorEls.forEach(el => {
    el.textContent = SITE_CONFIG.author;
  });
}

function initNavigation() {
  const langToggleBtn = document.getElementById('btn-lang-toggle');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      toggleLanguage();
    });
  }

  // Smooth scroll with customized offset using event delegation (works for static & dynamic links)
  document.addEventListener('click', function(e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (targetId === '#' || targetId === '#hero') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      const navbar = document.querySelector('.navbar');
      const navHeight = navbar ? navbar.offsetHeight : 70;
      
      // 取得目標元素相對於全頁面的頂部位置
      const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
      
      // 額外向下偏移約 48px（微調回彈，保留適當頂部留白並充分呈現內容）
      const extraOffset = 48;
      const offsetPosition = Math.max(0, elementPosition - navHeight + extraOffset);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
}

/**
 * Universal Toast Notification & Clipboard Copy
 */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('global-toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

function copyToClipboard(text, successMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg || t('btn_copied'));
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg || t('btn_copied'));
  } catch (err) {
    showToast(t('copy_failed') || '複製失敗，請手動選取');
  }
  document.body.removeChild(textArea);
}

function copyInstallCmd(cmd) {
  const prefix = t('copied_cmd_prefix') || '已複製指令';
  copyToClipboard(cmd, `${prefix}: ${cmd}`);
}

function copyAiInstallPrompt() {
  const isEn = (typeof currentLang !== 'undefined' && currentLang === 'en');
  const promptText = isEn 
    ? `Please help me install Antigravity Plugins from GitHub (https://github.com/TonyLongGu/antigravity-plugins.git).

Please guide me through the following interactive workflow:
1. Confirm which IDE I am using (Antigravity / Cursor / VS Code).
2. Ask which plugins to install (all, or a selection). Skip plugins that do not support this IDE and explain why (currently only Quota Status does not support VS Code; MCP Manager is in view mode on Cursor / VS Code).
3. Ask where to clone the repo (recommended default: D:\\antigravity-plugins), then mount into that IDE's extensions folder.
4. After install, remind me to reload the window (Developer: Reload Window); for VS Code, fully quit and reopen.`
    : `請幫我從 GitHub (https://github.com/TonyLongGu/antigravity-plugins.git) 安裝 Antigravity Plugins。

請依序執行以下引導流程：
1. 先確認我目前使用的 IDE（Antigravity / Cursor / VS Code）。
2. 詢問我要安裝哪些套件（全部，或自選）。不相容目前 IDE 的套件請略過並說明原因（目前僅 Quota Status 不支援 VS Code；MCP Manager 在 Cursor / VS Code 為檢視模式）。
3. 詢問本機放置目錄（預設建議 D:\\antigravity-plugins），然後 Git Clone 並掛載到該 IDE 的 extensions 目錄。
4. 完成後提醒重載視窗 (Developer: Reload Window)；若是 VS Code，建議完整關閉再開。`;

  copyToClipboard(promptText, t('install_ai_prompt_copied'));
}

/**
 * Antigravity High-Performance Video Player Engine
 * 支援 HTML5 原生影片 (.mov/.mp4，0 秒無延遲、0 暫停黑幕、0.3s 極速微提示)
 */
let html5VideoEl = null;
let isPlaying = false;
let controlsHideTimer = null;
let isDraggingProgress = false;

// DOM 元素快取物件，大幅降低每秒高頻 timeupdate 的 DOM 查詢與 GC 開銷
let domCache = null;
function getPlayerDOM() {
  if (!domCache) {
    domCache = {
      container: document.getElementById('main-video-player'),
      html5Video: document.getElementById('tutorial-html5-video'),
      controls: document.getElementById('custom-player-controls'),
      clickSurface: document.getElementById('player-click-surface'),
      progContainer: document.getElementById('player-progress-container'),
      filledBar: document.getElementById('player-progress-filled'),
      thumbEl: document.getElementById('player-progress-thumb'),
      bufBar: document.getElementById('player-progress-buffered'),
      timeCurrent: document.getElementById('time-current'),
      timeDuration: document.getElementById('time-duration'),
      playIcon: document.getElementById('ctrl-icon-play'),
      pauseIcon: document.getElementById('ctrl-icon-pause'),
      volHigh: document.getElementById('ctrl-icon-vol-high'),
      volMute: document.getElementById('ctrl-icon-vol-mute'),
      volSlider: document.getElementById('ctrl-volume-slider'),
      badge: document.getElementById('player-feedback-badge'),
      badgePlay: document.getElementById('badge-icon-play'),
      badgePause: document.getElementById('badge-icon-pause'),
      fsEnter: document.getElementById('ctrl-icon-fullscreen-enter'),
      fsExit: document.getElementById('ctrl-icon-fullscreen-exit'),
      videoTitle: document.getElementById('tutorial-video-title'),
      videoDesc: document.getElementById('tutorial-video-desc'),
      subtitleOverlay: document.getElementById('player-subtitle-overlay'),
      subtitleBubble: document.getElementById('subtitle-bubble'),
      subtitleText: document.getElementById('subtitle-text'),
      ccBtn: document.getElementById('ctrl-cc-btn'),
      bufferingIndicator: document.getElementById('player-buffering-indicator')
    };
  }
  return domCache;
}

function showBufferingIndicator(show) {
  const dom = getPlayerDOM();
  if (dom && dom.bufferingIndicator) {
    dom.bufferingIndicator.style.display = show ? 'flex' : 'none';
  }
}

function getCurrentPlaybackTime() {
  const v = html5VideoEl || (domCache && domCache.html5Video);
  return v ? (v.currentTime || 0) : 0;
}

/** 取得目前語系（集中處理跨檔載入順序，避免各處重複 typeof 判斷） */
function getCurrentLang() {
  return typeof currentLang !== 'undefined' && currentLang ? currentLang : 'zh-TW';
}

/** 取得目前選取的教學影片 ID */
function getActiveVideoId() {
  return typeof currentActiveVideoId !== 'undefined' && currentActiveVideoId
    ? currentActiveVideoId
    : 'antigravity-design-philosophy';
}

/**
 * Antigravity Subtitle Engine（資料驅動 · 零網路請求）
 *
 * 字幕來源為 tools/build-subtitles.js 由 assets/subtitles/*.vtt 預先編譯的
 * SUBTITLE_TRACKS，因此：
 *   - 本機 file:// 直接開啟 index.html 也能正常顯示字幕（原本 fetch 會被 CORS 阻擋）
 *   - 零額外網路請求、無 404 靜默失敗、「CC 燈亮著卻沒字幕」的假狀態不復存在
 *   - 缺漏的字幕會在產生階段就被列出，而非上線後才發現
 */

/** 語系鍵值正規化：字幕資料只區分 en 與 zh-TW */
function getSubtitleLang(lang) {
  return lang === 'en' ? 'en' : 'zh-TW';
}

/**
 * 影片 ID → 字幕主題鍵值
 * 資料層若明確宣告 subtitleKey 則優先採用，否則回退至既有命名慣例（antigravity- 前綴）。
 * 該慣例僅集中於此函式，不再散落各處；缺少資料時會於 load() 警示並隱藏 CC 按鈕。
 */
function getSubtitleKey(videoId) {
  const list = getTutorialVideosList();
  const item = list.find((v) => v.id === videoId);
  if (item && item.subtitleKey) return item.subtitleKey;
  return String(videoId).replace(/^antigravity-/, '');
}

/** 取得指定影片的字幕主題（含所有語系）；無資料時回傳 null */
function getSubtitleTrack(videoId) {
  if (typeof SUBTITLE_TRACKS === 'undefined') return null;
  return SUBTITLE_TRACKS[getSubtitleKey(videoId)] || null;
}

const SubtitleManager = {
  isEnabled: true,
  currentCues: [],
  currentVideoId: '',
  currentLang: '',
  activeCueIndex: -1,

  init() {
    // 於初始化階段才讀取設定，避免腳本載入期就觸碰儲存層（隱私模式下 localStorage 會 throw）
    this.isEnabled = SafeStorage.get('antigravity_subtitle_enabled') !== 'false';
    this.updateButtonUI();
    this.load(getActiveVideoId(), getCurrentLang());
  },

  updateButtonUI() {
    const dom = getPlayerDOM();
    if (dom.ccBtn) {
      dom.ccBtn.classList.toggle('active', this.isEnabled);
      dom.ccBtn.setAttribute('aria-pressed', this.isEnabled ? 'true' : 'false');
    }
    if (!this.isEnabled) {
      this.hideText();
    }
  },

  toggle() {
    this.isEnabled = !this.isEnabled;
    SafeStorage.set('antigravity_subtitle_enabled', this.isEnabled ? 'true' : 'false');
    this.updateButtonUI();
    if (this.isEnabled) {
      this.activeCueIndex = -1; // 重設快取索引，確保能立刻觸發當前語句渲染
      this.sync(getCurrentPlaybackTime());
    } else {
      this.hideText();
    }
  },

  load(videoId, lang) {
    if (!videoId) return;
    this.currentVideoId = videoId;
    this.currentLang = getSubtitleLang(lang || getCurrentLang());
    this.currentCues = [];
    this.activeCueIndex = -1;
    this.hideText();

    const track = getSubtitleTrack(videoId);
    // 無字幕資料的主題直接隱藏 CC 按鈕，避免「燈亮著卻沒有字幕」的假狀態
    this.updateAvailability(!!track);

    if (!track) {
      console.warn(`[Subtitle] 找不到字幕主題資料：videoId=${videoId}（key=${getSubtitleKey(videoId)}）`);
      return;
    }

    const cues = track[this.currentLang];
    if (!cues || cues.length === 0) {
      console.warn(`[Subtitle] 主題 ${getSubtitleKey(videoId)} 缺少語系 ${this.currentLang} 字幕`);
      return;
    }

    this.currentCues = cues;
    this.sync(getCurrentPlaybackTime());
  },

  /** 依字幕資料是否存在切換 CC 按鈕顯示（樣式對應 .custom-ctrl-btn[hidden]） */
  updateAvailability(available) {
    const dom = getPlayerDOM();
    if (dom.ccBtn) dom.ccBtn.hidden = !available;
  },

  /** 以二分搜尋定位當前 cue（資料已依 start 排序），取代每次同步都線性掃描全部字幕的成本 */
  findCueIndex(currentTime) {
    const cues = this.currentCues;
    let lo = 0;
    let hi = cues.length - 1;
    let candidate = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (cues[mid].start <= currentTime) {
        candidate = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    if (candidate === -1) return -1;
    return currentTime <= cues[candidate].end ? candidate : -1;
  },

  sync(currentTime) {
    if (!this.isEnabled || !this.currentCues || this.currentCues.length === 0) {
      this.hideText();
      return;
    }

    const matchedIndex = this.findCueIndex(currentTime);
    if (matchedIndex === -1) {
      if (this.activeCueIndex !== -1) this.hideText();
      return;
    }

    if (this.activeCueIndex !== matchedIndex) {
      this.activeCueIndex = matchedIndex;
      this.showText(this.currentCues[matchedIndex].text);
    }
  },

  showText(text) {
    const dom = getPlayerDOM();
    if (dom.subtitleText && dom.subtitleBubble) {
      dom.subtitleText.textContent = text;
      dom.subtitleBubble.style.display = 'inline-block';
    }
  },

  hideText() {
    this.activeCueIndex = -1; // 關鍵修正：隱藏時必須重設索引，否則重新開啟時若在同一句會被阻擋
    const dom = getPlayerDOM();
    if (dom.subtitleBubble) {
      dom.subtitleBubble.style.display = 'none';
    }
    if (dom.subtitleText) {
      dom.subtitleText.textContent = '';
    }
  }
};

let isMouseHoveringControls = false;

/**
 * 播放器 UI 自動收合時，若焦點仍停在控制列按鈕上（該按鈕已透明不可見），
 * 將焦點交還播放器本體（tabindex="0"），維持鍵盤操作的連續性。
 *
 * 註：不再採用「強制 blur()」的舊作法——那會把鍵盤焦點整個抽回 body，
 * 使連續操作斷鏈；行動端點擊殘留的外框已由 CSS
 * `.custom-ctrl-btn:focus:not(:focus-visible)` 從根本解決，無需 JS 補丁。
 */
function moveFocusToPlayerSurface() {
  const dom = getPlayerDOM();
  const container = dom.container;
  if (!container) return;

  const el = document.activeElement;
  if (el && el !== container && el.tagName === 'BUTTON' && container.contains(el)) {
    // preventScroll：焦點轉移不得觸發任何捲動位移
    container.focus({ preventScroll: true });
  }
}

function toggleSubtitles() {
  SubtitleManager.toggle();
}

function wakePlayerUI() {
  const dom = getPlayerDOM();
  if (!dom.container || !dom.controls) return;

  if (dom.container.classList.contains('hide-ui')) {
    dom.container.classList.remove('hide-ui');
  }
  if (!dom.controls.classList.contains('visible')) {
    dom.controls.classList.add('visible');
  }

  clearTimeout(controlsHideTimer);

  if (isPlaying && !isDraggingProgress) {
    controlsHideTimer = setTimeout(() => {
      hidePlayerUI();
    }, 2400); // 靜止 2.4 秒後平滑自動收合控制列並隱藏游標
  }
}

function hidePlayerUI() {
  const dom = getPlayerDOM();
  if (!dom.container || !dom.controls) return;

  // 僅在桌面環境且有真正的滑鼠懸停在控制列上時，才阻止自動隱藏
  // 手機/平板觸控裝置絕不受 Sticky Hover 阻礙，時間到期強制平滑隱藏！
  const isRealMouseHover = isMouseHoveringControls && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isPlaying && !isDraggingProgress && !isRealMouseHover) {
    dom.container.classList.add('hide-ui');
    dom.controls.classList.remove('visible');

    // 隱藏時把焦點交還播放器本體，避免焦點滯留在已不可見的按鈕上
    moveFocusToPlayerSurface();
  }
}

function updatePlayPauseUI(playing) {
  const dom = getPlayerDOM();
  if (playing) {
    if (dom.playIcon) dom.playIcon.style.display = 'none';
    if (dom.pauseIcon) dom.pauseIcon.style.display = 'block';
    if (dom.controls) dom.controls.classList.remove('paused');
    if (dom.container) dom.container.classList.remove('paused');
  } else {
    clearTimeout(controlsHideTimer);
    if (dom.playIcon) dom.playIcon.style.display = 'block';
    if (dom.pauseIcon) dom.pauseIcon.style.display = 'none';
    if (dom.controls) {
      dom.controls.classList.add('paused');
      dom.controls.classList.add('visible');
    }
    if (dom.container) {
      dom.container.classList.add('paused');
      dom.container.classList.remove('hide-ui');
    }
  }
}

function toggleCustomPlayer() {
  // 防止進度條拖曳後的 ghost click 與拖曳中的穿透
  if (justDraggedProgress || isDraggingProgress) return;
  const dom = getPlayerDOM();

  if (!html5VideoEl) html5VideoEl = dom.html5Video || document.getElementById('tutorial-html5-video');
  if (!html5VideoEl) return;

  if (html5VideoEl.paused) {
    const p = html5VideoEl.play();
    if (p && p.catch) {
      p.catch(e => {
        console.warn('HTML5 Video Play:', e);
        isPlaying = false;
        updatePlayPauseUI(false);
        showBufferingIndicator(false);
      });
    }
    isPlaying = true;
    if (dom.badgePlay) dom.badgePlay.style.display = 'block';
    if (dom.badgePause) dom.badgePause.style.display = 'none';
    updatePlayPauseUI(true);
    wakePlayerUI();
  } else {
    html5VideoEl.pause();
    isPlaying = false;
    showBufferingIndicator(false);
    if (dom.badgePlay) dom.badgePlay.style.display = 'none';
    if (dom.badgePause) dom.badgePause.style.display = 'block';
    updatePlayPauseUI(false);
  }

  // 0.3 秒極速淡出微提示
  if (dom.badge) {
    dom.badge.classList.add('flash');
    setTimeout(() => {
      dom.badge.classList.remove('flash');
    }, 300);
  }
}

function toggleMute() {
  const dom = getPlayerDOM();

  if (!html5VideoEl) html5VideoEl = dom.html5Video || document.getElementById('tutorial-html5-video');
  if (!html5VideoEl) return;
  html5VideoEl.muted = !html5VideoEl.muted;
  if (!html5VideoEl.muted) {
    if (html5VideoEl.volume === 0) {
      html5VideoEl.volume = 1;
    }
    if (dom.volHigh) dom.volHigh.style.display = 'block';
    if (dom.volMute) dom.volMute.style.display = 'none';
    const targetVol = (html5VideoEl.volume * 100) || 100;
    updateVolumeSliderUI(targetVol);
  } else {
    if (dom.volHigh) dom.volHigh.style.display = 'none';
    if (dom.volMute) dom.volMute.style.display = 'block';
    updateVolumeSliderUI(0);
  }
  wakePlayerUI();
}

function updateVolumeSliderUI(val) {
  const dom = getPlayerDOM();
  const slider = dom.volSlider || document.getElementById('ctrl-volume-slider');
  if (!slider) return;
  const num = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
  slider.value = num;
  slider.style.setProperty('--vol-percent', `${num}%`);
}

function changeVolume(val) {
  const dom = getPlayerDOM();
  val = parseInt(val, 10);
  if (isNaN(val)) val = 100;

  updateVolumeSliderUI(val);

  if (!html5VideoEl) html5VideoEl = dom.html5Video || document.getElementById('tutorial-html5-video');
  if (!html5VideoEl) return;
  html5VideoEl.volume = val / 100;
  html5VideoEl.muted = (val === 0);

  if (val === 0) {
    if (dom.volHigh) dom.volHigh.style.display = 'none';
    if (dom.volMute) dom.volMute.style.display = 'block';
  } else {
    if (dom.volHigh) dom.volHigh.style.display = 'block';
    if (dom.volMute) dom.volMute.style.display = 'none';
  }
  wakePlayerUI();
}

let isWebFullscreen = false;

// 嘗試鎖定或解鎖行動端橫向螢幕 (Screen Orientation API)
function tryLockLandscape() {
  try {
    if (screen.orientation && typeof screen.orientation.lock === 'function') {
      screen.orientation.lock('landscape').catch(() => {
        // 行動裝置不支援或使用者未旋轉時靜默忽略
      });
    }
  } catch (e) {
    // 忽略異常
  }
}

function tryUnlockOrientation() {
  try {
    if (screen.orientation && typeof screen.orientation.unlock === 'function') {
      screen.orientation.unlock();
    }
  } catch (e) {
    // 忽略異常
  }
}

/**
 * 全螢幕外框歸位窗口（對應 CSS .is-fs-settling / .is-fs-releasing）
 *
 * 瀏覽器進出全螢幕時會自行播放縮放動畫（Chrome 約 300ms），動畫期間元素
 * 仍接近滿版尺寸；此時若套用視窗外框，1px 白色邊框與 ring shadow 就會在
 * 畫面邊緣閃出白線。故於歸位窗口內暫時隱藏外框，待尺寸歸位後再無動畫地恢復。
 */
const FS_FRAME_SETTLE_MS = 400; // 涵蓋 UA 縮放動畫（約 300ms）並保留餘裕
let fsFrameSettleTimer = null;

function markFullscreenFrameSettling() {
  const container = getPlayerDOM().container;
  if (!container) return;

  container.classList.remove('is-fs-releasing');
  container.classList.add('is-fs-settling');

  clearTimeout(fsFrameSettleTimer);
  fsFrameSettleTimer = setTimeout(() => {
    // 先恢復外框（此時仍鎖住過渡），下一幀才解除過渡鎖，確保不會產生淡入動畫
    container.classList.remove('is-fs-settling');
    container.classList.add('is-fs-releasing');
    requestAnimationFrame(() => container.classList.remove('is-fs-releasing'));
  }, FS_FRAME_SETTLE_MS);
}

function enterWebFullscreen() {
  const container = document.getElementById('main-video-player');
  const fsEnter = document.getElementById('ctrl-icon-fullscreen-enter');
  const fsExit = document.getElementById('ctrl-icon-fullscreen-exit');
  if (!container) return;

  isWebFullscreen = true;
  container.classList.add('is-web-fullscreen');
  document.body.classList.add('has-web-fullscreen');
  markFullscreenFrameSettling();

  if (fsEnter && fsExit) {
    fsEnter.style.display = 'none';
    fsExit.style.display = 'block';
  }

  tryLockLandscape();
  isDraggingProgress = false;
  wakePlayerUI();
}

function exitWebFullscreen() {
  const container = document.getElementById('main-video-player');
  const fsEnter = document.getElementById('ctrl-icon-fullscreen-enter');
  const fsExit = document.getElementById('ctrl-icon-fullscreen-exit');
  if (!container) return;

  isWebFullscreen = false;
  container.classList.remove('is-web-fullscreen');
  document.body.classList.remove('has-web-fullscreen');
  markFullscreenFrameSettling();

  if (fsEnter && fsExit) {
    fsEnter.style.display = 'block';
    fsExit.style.display = 'none';
  }

  tryUnlockOrientation();

  // 退出時瞬間校準置中
  requestAnimationFrame(() => {
    if (container) {
      container.scrollIntoView({
        behavior: 'instant',
        block: 'center',
        inline: 'nearest'
      });
    }
  });

  isDraggingProgress = false;
  wakePlayerUI();
}

function updateFullscreenState() {
  const container = document.getElementById('main-video-player');
  const fsEnter = document.getElementById('ctrl-icon-fullscreen-enter');
  const fsExit = document.getElementById('ctrl-icon-fullscreen-exit');
  const isNativeFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);

  if (container) {
    if (isNativeFs) {
      container.classList.add('is-fullscreen');
    } else {
      container.classList.remove('is-fullscreen');
    }
    // 進入/退出原生全螢幕皆會經過此處，統一開啟外框歸位窗口
    markFullscreenFrameSettling();
  }

  // 若退出原生全螢幕，同步清除 web 全螢幕殘留狀態
  if (!isNativeFs && isWebFullscreen) {
    isWebFullscreen = false;
    if (container) container.classList.remove('is-web-fullscreen');
    document.body.classList.remove('has-web-fullscreen');
  }

  const isFs = isNativeFs || isWebFullscreen;

  if (fsEnter && fsExit) {
    if (isFs) {
      fsEnter.style.display = 'none';
      fsExit.style.display = 'block';
    } else {
      fsEnter.style.display = 'block';
      fsExit.style.display = 'none';
    }
  }

  if (isFs) {
    tryLockLandscape();
    if (window.NebulaEngine && typeof window.NebulaEngine.pause === 'function') {
      window.NebulaEngine.pause();
    }
  } else {
    tryUnlockOrientation();
    if (window.NebulaEngine && typeof window.NebulaEngine.resume === 'function') {
      window.NebulaEngine.resume();
    }
  }

  // 退出全螢幕時的無縫就位保障
  if (!isFs) {
    // 備用校準：以 instant (無動畫) 確保精準居中，徹底杜絕縮回後的二次滑動感
    requestAnimationFrame(() => {
      if (container) {
        container.scrollIntoView({
          behavior: 'instant',
          block: 'center',
          inline: 'nearest'
        });
      }
    });
  }

  isDraggingProgress = false;
  wakePlayerUI();
}

function toggleFullscreen() {
  const container = document.getElementById('main-video-player');
  if (!container) return;

  // 1. 若當前已處於 Web 視窗滿版全螢幕模式，立即退出
  if (isWebFullscreen) {
    exitWebFullscreen();
    return;
  }

  // 2. 若當前已處於原生全螢幕模式，調用原生退出
  const isNativeFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
  if (isNativeFs) {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(err => console.warn(err));
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    return;
  }

  // 3. 進入全螢幕檢測：檢查環境是否具備原生 Fullscreen API
  // 在 iPhone (iOS Safari) 與部分社群 App 內嵌 WebView (LINE / FB / IG) 中，一般 div 不支援原生全螢幕
  const hasNativeFsSupport = typeof (
    container.requestFullscreen ||
    container.webkitRequestFullscreen ||
    container.mozRequestFullScreen ||
    container.msRequestFullscreen
  ) === 'function' && document.fullscreenEnabled !== false;

  if (!hasNativeFsSupport) {
    // 行動端無痛切換至 Web 視窗滿版全螢幕
    enterWebFullscreen();
    return;
  }

  // 4. 支援原生全螢幕之環境（桌機、Android Chrome、iPad 等）：
  // 進入全螢幕前預先瞬間置中（方案 A）
  container.scrollIntoView({
    behavior: 'instant',
    block: 'center',
    inline: 'nearest'
  });

  try {
    if (container.requestFullscreen) {
      const p = container.requestFullscreen();
      if (p && p.catch) {
        p.catch(err => {
          console.warn('Native requestFullscreen denied, fallback to web fullscreen:', err);
          enterWebFullscreen();
        });
      }
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
      container.mozRequestFullScreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    } else {
      enterWebFullscreen();
    }
  } catch (err) {
    console.warn('Native fullscreen exception, fallback to web fullscreen:', err);
    enterWebFullscreen();
  }
}

let justDraggedProgress = false;
let dragCooldownTimer = null;

function safeSeekHtml5Video(targetTime) {
  if (!html5VideoEl) return;
  const dur = html5VideoEl.duration;
  if (!dur || dur <= 0 || !isFinite(dur)) return;
  const clamped = Math.max(0, Math.min(dur, targetTime));

  html5VideoEl.currentTime = clamped;
}

function seekRelative(seconds) {
  if (!html5VideoEl) return;
  const dur = html5VideoEl.duration || 0;
  const curr = html5VideoEl.currentTime || 0;
  const target = Math.max(0, Math.min(dur, curr + seconds));
  safeSeekHtml5Video(target);
  updateTimeAndDuration();
}

function adjustVolumeRelative(delta) {
  const slider = document.getElementById('ctrl-volume-slider');
  let currentVol = 100;
  if (html5VideoEl) {
    currentVol = html5VideoEl.muted ? 0 : Math.round(html5VideoEl.volume * 100);
  }
  const newVol = Math.max(0, Math.min(100, currentVol + delta));
  if (slider) slider.value = newVol;
  changeVolume(newVol);
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateTimeAndDuration() {
  if (isDraggingProgress) return;
  const dom = getPlayerDOM();

  if (!html5VideoEl) html5VideoEl = dom.html5Video || document.getElementById('tutorial-html5-video');
  if (!html5VideoEl) return;
  const curr = html5VideoEl.currentTime || 0;
  const dur = html5VideoEl.duration || 0;
  let loadedPct = 0;

  if (html5VideoEl.buffered && html5VideoEl.buffered.length > 0 && dur > 0) {
    for (let i = 0; i < html5VideoEl.buffered.length; i++) {
      if (curr >= html5VideoEl.buffered.start(i) && curr <= html5VideoEl.buffered.end(i)) {
        loadedPct = (html5VideoEl.buffered.end(i) / dur) * 100;
        break;
      }
    }
  }

  if (dom.timeCurrent) dom.timeCurrent.textContent = formatTime(curr);
  if (dom.timeDuration && dur > 0) dom.timeDuration.textContent = formatTime(dur);

  if (dur > 0) {
    const pct = (curr / dur) * 100;
    if (dom.filledBar) dom.filledBar.style.width = `${pct}%`;
    if (dom.thumbEl) dom.thumbEl.style.left = `${pct}%`;
    if (dom.bufBar) dom.bufBar.style.width = `${loadedPct}%`;
  }

  // 同步字幕顯示
  if (typeof SubtitleManager !== 'undefined') {
    SubtitleManager.sync(curr);
  }
}

let isCustomPlayerInited = false;

function initCustomVideoPlayer() {
  if (isCustomPlayerInited) return;
  isCustomPlayerInited = true;

  const dom = getPlayerDOM();
  html5VideoEl = dom.html5Video || document.getElementById('tutorial-html5-video');
  const container = dom.container;
  const progContainer = dom.progContainer;
  const controls = dom.controls;
  const volSlider = dom.volSlider;
  if (!container || !progContainer) return;

  // 初始化音量滑桿雙色進度填充
  if (volSlider) {
    updateVolumeSliderUI(volSlider.value || 100);
  }

  // 監聽跨瀏覽器全螢幕切換事件
  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
    document.addEventListener(evt, updateFullscreenState);
  });

  // 監聽手機螢幕橫直向旋轉，即時重算與自適應佈局
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      wakePlayerUI();
      if (typeof updateTimeAndDuration === 'function') {
        updateTimeAndDuration();
      }
    }, 120);
  });

  // HTML5 Video 原生事件監聽與緩衝狀態管理
  if (html5VideoEl) {
    html5VideoEl.addEventListener('timeupdate', updateTimeAndDuration);
    html5VideoEl.addEventListener('loadedmetadata', updateTimeAndDuration);
    html5VideoEl.addEventListener('play', () => {
      isPlaying = true;
      updatePlayPauseUI(true);
      wakePlayerUI();
    });
    html5VideoEl.addEventListener('pause', () => {
      isPlaying = false;
      updatePlayPauseUI(false);
      showBufferingIndicator(false);
    });
    html5VideoEl.addEventListener('ended', () => {
      isPlaying = false;
      updatePlayPauseUI(false);
      showBufferingIndicator(false);
    });
    html5VideoEl.addEventListener('waiting', () => {
      showBufferingIndicator(true);
    });
    html5VideoEl.addEventListener('playing', () => {
      showBufferingIndicator(false);
      isPlaying = true;
      updatePlayPauseUI(true);
    });
    html5VideoEl.addEventListener('canplay', () => {
      showBufferingIndicator(false);
    });
    html5VideoEl.addEventListener('seeking', () => {
      showBufferingIndicator(true);
    });
    html5VideoEl.addEventListener('seeked', () => {
      showBufferingIndicator(false);
    });
    html5VideoEl.addEventListener('stalled', () => {
      showBufferingIndicator(true);
    });

    // 若 HTML5 載入失敗（格式不支援或檔案異常），提供明確提示
    html5VideoEl.addEventListener('error', (e) => {
      showBufferingIndicator(false);
      console.warn('HTML5 Video 解碼或載入失敗:', e);
      showToast('影片載入失敗，請確認影片檔案是否存在');
    });
  }

  // 控制列與滑鼠游標喚醒/自動隱藏監聽 (以 requestAnimationFrame 節流高輪詢率滑鼠)
  let wakeRafId = null;
  const throttledWakePlayerUI = () => {
    if (wakeRafId) return;
    wakeRafId = requestAnimationFrame(() => {
      wakePlayerUI();
      wakeRafId = null;
    });
  };

  container.addEventListener('pointermove', throttledWakePlayerUI);
  container.addEventListener('pointerenter', throttledWakePlayerUI);
  container.addEventListener('touchstart', throttledWakePlayerUI, { passive: true });
  container.addEventListener('mouseleave', () => {
    clearTimeout(controlsHideTimer);
    if (isPlaying && !isDraggingProgress && !isMouseHoveringControls) {
      controlsHideTimer = setTimeout(() => {
        hidePlayerUI();
      }, 500);
    }
  });

  // 精準追蹤桌面滑鼠的真實懸停（過濾觸控 touch，避免手機 sticky hover 阻擋自動隱藏）
  controls.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') isMouseHoveringControls = true;
  });
  controls.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') isMouseHoveringControls = false;
  });

  // 點擊容器時自動聚焦，確保滑鼠移出後鍵盤快捷鍵（如 Space）依然能精準控制且不發生全頁跳躍式滾動
  container.addEventListener('pointerdown', () => {
    if (document.activeElement !== container && !container.contains(document.activeElement)) {
      container.focus({ preventScroll: true });
    }
  });

  // 播放器鍵盤快捷鍵
  // 作用範圍嚴格限定「全螢幕中」或「播放器持有焦點且仍在視窗內」，
  // 避免影片於背景播放時綁架整頁的空白鍵與方向鍵捲動。
  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const isInput = !!active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName);
    if (isInput) return;

    const isNativeFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    const isFs = isNativeFs || isWebFullscreen;

    if (e.key === 'Escape' && isWebFullscreen) {
      e.preventDefault();
      exitWebFullscreen();
      return;
    }

    const isFocusInside = !!active && (active === container || container.contains(active));
    const rect = container.getBoundingClientRect();
    const isVisibleOnScreen = rect.top < window.innerHeight && rect.bottom > 0;

    if (!isFs && !(isFocusInside && isVisibleOnScreen)) return;

    // 焦點位於控制列按鈕時，空白鍵交還原生按鈕啟用（避免與按鈕語意互相衝突）
    if (e.code === 'Space' && active && active.tagName === 'BUTTON') return;

    if (e.code === 'Space' || e.key === 'k' || e.key === 'K') {
      e.preventDefault();
      toggleCustomPlayer();
      wakePlayerUI();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      toggleMute();
      wakePlayerUI();
    } else if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      toggleSubtitles();
      wakePlayerUI();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      seekRelative(-5);
      wakePlayerUI();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      seekRelative(5);
      wakePlayerUI();
    } else if (e.code === 'ArrowUp') {
      e.preventDefault();
      adjustVolumeRelative(5);
      wakePlayerUI();
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      adjustVolumeRelative(-5);
      wakePlayerUI();
    }
  });

  // click-surface 使用 pointerdown+pointerup 精確判定「有意按下並釋放」才觸發播放/暫停
  // 雙擊防競態：利用 260ms 計時器解耦單擊與雙擊，徹底杜絕快速點擊產生的 Play Promise 中斷報錯
  const clickSurface = dom.clickSurface || document.getElementById('player-click-surface');
  if (clickSurface) {
    let surfacePointerDownTime = 0;
    let surfacePointerDownX = 0;
    let surfacePointerDownY = 0;
    let lastTapTime = 0;
    let singleTapTimer = null;

    clickSurface.addEventListener('pointerdown', (e) => {
      surfacePointerDownTime = Date.now();
      surfacePointerDownX = e.clientX;
      surfacePointerDownY = e.clientY;
    });

    clickSurface.addEventListener('pointerup', (e) => {
      const dt = Date.now() - surfacePointerDownTime;
      const dx = Math.abs(e.clientX - surfacePointerDownX);
      const dy = Math.abs(e.clientY - surfacePointerDownY);
      // 僅在快速按下並釋放（<400ms）且未移動（<10px）時才視為有效手勢
      if (dt < 400 && dx < 10 && dy < 10) {
        const now = Date.now();
        if (now - lastTapTime < 280) {
          // 雙擊全螢幕：立即取消待執行的單擊播放/暫停，平滑切換全螢幕，零播放衝突
          lastTapTime = 0;
          if (singleTapTimer) {
            clearTimeout(singleTapTimer);
            singleTapTimer = null;
          }
          toggleFullscreen();
        } else {
          lastTapTime = now;
          if (singleTapTimer) clearTimeout(singleTapTimer);
          singleTapTimer = setTimeout(() => {
            toggleCustomPlayer();
            singleTapTimer = null;
          }, 260);
        }
      }
    });

    // 阻止 click-surface 上的 click 事件（防止殘留的 onclick 或瀏覽器自動派發的 click）
    clickSurface.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  // 阻斷控制列事件穿透到背景 click-surface
  controls.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  controls.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
  });
  controls.addEventListener('pointerup', (e) => {
    e.stopPropagation();
  });

  // 計算進度條點擊/拖曳比例 (0 ~ 1)
  const getProgressPos = (e) => {
    const rect = progContainer.getBoundingClientRect();
    if (!rect.width) return 0;
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  };

  // 僅即時更新 UI（不頻繁請求影片解碼，保證 60fps 極速響應與 0 卡頓）
  const updateSeekUI = (pos) => {
    const dur = html5VideoEl ? (html5VideoEl.duration || 0) : 0;
    if (dom.filledBar) dom.filledBar.style.width = `${pos * 100}%`;
    if (dom.thumbEl) dom.thumbEl.style.left = `${pos * 100}%`;
    if (dom.timeCurrent && dur > 0) dom.timeCurrent.textContent = formatTime(pos * dur);
  };

  // 真正執行跳轉（僅在點擊釋放或拖曳結束時執行一次）
  const applySeek = (pos) => {
    if (html5VideoEl) {
      const dur = html5VideoEl.duration || 0;
      const targetTime = pos * dur;
      safeSeekHtml5Video(targetTime);
    }
    updateSeekUI(pos);
    wakePlayerUI();
  };

  // 使用現代 Pointer Events 與 setPointerCapture 徹底解決全螢幕放開滑鼠丟失事件
  let lastPointerPos = 0;

  progContainer.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    isDraggingProgress = true;
    try {
      progContainer.setPointerCapture(e.pointerId);
    } catch (err) {}
    lastPointerPos = getProgressPos(e);
    updateSeekUI(lastPointerPos);
    wakePlayerUI();
  });

  progContainer.addEventListener('pointermove', (e) => {
    if (!isDraggingProgress) return;
    e.stopPropagation();
    lastPointerPos = getProgressPos(e);
    updateSeekUI(lastPointerPos);
    wakePlayerUI();
  });

  const endDragSeek = (e) => {
    if (!isDraggingProgress) return;
    e.stopPropagation();
    try {
      if (progContainer.hasPointerCapture(e.pointerId)) {
        progContainer.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}
    isDraggingProgress = false;
    justDraggedProgress = true;
    clearTimeout(dragCooldownTimer);
    dragCooldownTimer = setTimeout(() => {
      justDraggedProgress = false;
    }, 280);

    lastPointerPos = getProgressPos(e);
    applySeek(lastPointerPos);
  };

  // 觸控中斷保護：若被手勢或來電 cancel，僅釋放指標捕獲，絕不執行無效跳轉
  const cancelDragSeek = (e) => {
    if (!isDraggingProgress) return;
    e.stopPropagation();
    try {
      if (progContainer.hasPointerCapture(e.pointerId)) {
        progContainer.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}
    isDraggingProgress = false;
    justDraggedProgress = true;
    clearTimeout(dragCooldownTimer);
    dragCooldownTimer = setTimeout(() => {
      justDraggedProgress = false;
    }, 280);
    updateTimeAndDuration();
  };

  progContainer.addEventListener('pointerup', endDragSeek);
  progContainer.addEventListener('pointercancel', cancelDragSeek);

  // 初始化字幕引擎 (載入預設字幕並還原設定)
  if (typeof SubtitleManager !== 'undefined') {
    SubtitleManager.init();
  }
}

function getTutorialVideosList() {
  if (typeof TUTORIAL_VIDEOS !== 'undefined' && Array.isArray(TUTORIAL_VIDEOS) && TUTORIAL_VIDEOS.length > 0) {
    return TUTORIAL_VIDEOS;
  }
  return typeof PLUGINS_DATA !== 'undefined' ? PLUGINS_DATA : [];
}

let currentActiveVideoId = 'antigravity-design-philosophy';

function initVideoShowcase(preservePlayback = false) {
  const playlistPills = document.getElementById('video-playlist-pills');
  const videoList = getTutorialVideosList();
  if (!playlistPills || videoList.length === 0) return;

  const targetId = currentActiveVideoId || (videoList[0] ? videoList[0].id : null);

  playlistPills.innerHTML = videoList.map((item) => {
    const name = item.name ? (item.name[currentLang] || item.name['zh-TW']) : (item.title || '');
    const shortName = name.split('(')[0].trim();
    const isActive = item.id === targetId;
    return `
      <button class="playlist-btn ${isActive ? 'active' : ''}" data-video-id="${item.id}" onclick="switchTutorialVideo('${item.id}')">
        <img src="${item.icon || 'assets/icons/philosophy.svg'}" style="width: 16px; height: 16px;" alt="" />
        <span>${shortName}</span>
      </button>
    `;
  }).join('');

  if (targetId) {
    if (preservePlayback) {
      // 僅更新文字標題與說明，不中斷當前影片、不重設時間軸
      updateTutorialVideoMetaOnly(targetId);
    } else {
      switchTutorialVideo(targetId);
    }
  }
}

function updateTutorialVideoMetaOnly(videoId) {
  const videoList = getTutorialVideosList();
  const videoItem = videoList.find(v => v.id === videoId) || (typeof PLUGINS_DATA !== 'undefined' ? PLUGINS_DATA.find(p => p.id === videoId) : null);
  if (!videoItem) return;
  const dom = getPlayerDOM();
  if (dom.videoTitle) {
    const rawName = videoItem.name ? (videoItem.name[currentLang] || videoItem.name['zh-TW']) : (videoItem.title || '');
    dom.videoTitle.textContent = rawName;
  }
  if (dom.videoDesc) {
    dom.videoDesc.textContent = videoItem.shortDesc ? (videoItem.shortDesc[currentLang] || videoItem.shortDesc['zh-TW']) : '';
  }
}

function switchTutorialVideo(videoId) {
  const videoList = getTutorialVideosList();
  const videoItem = videoList.find(v => v.id === videoId) || (typeof PLUGINS_DATA !== 'undefined' ? PLUGINS_DATA.find(p => p.id === videoId) : null);
  if (!videoItem) return;

  currentActiveVideoId = videoId;
  const dom = getPlayerDOM();

  // 使用 data-video-id 精準高亮對應按鈕
  const buttons = document.querySelectorAll('.playlist-btn');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-video-id') === videoId);
  });

  // 重設播放狀態與進度條
  isPlaying = false;
  clearTimeout(controlsHideTimer);
  updatePlayPauseUI(false);
  showBufferingIndicator(false);

  if (dom.filledBar) dom.filledBar.style.width = '0%';
  if (dom.thumbEl) dom.thumbEl.style.left = '0%';
  if (dom.bufBar) dom.bufBar.style.width = '0%';
  if (dom.timeCurrent) dom.timeCurrent.textContent = '0:00';
  if (dom.timeDuration) dom.timeDuration.textContent = '0:00';

  if (!html5VideoEl) html5VideoEl = dom.html5Video || document.getElementById('tutorial-html5-video');

  // 載入原生影片 (HTML5 Video)
  if (videoItem.videoSrc && html5VideoEl) {
    html5VideoEl.src = videoItem.videoSrc;
    html5VideoEl.load();
    updateTimeAndDuration();
  }

  updateTutorialVideoMetaOnly(videoId);

  // 切換載入對應影片之字幕
  if (typeof SubtitleManager !== 'undefined') {
    SubtitleManager.load(videoId, getCurrentLang());
  }
}

/**
 * Installation Method Switcher Controller
 */
function switchInstallMethod(method) {
  const tabZip = document.getElementById('tab-btn-zip');
  const tabGit = document.getElementById('tab-btn-git');
  const panelZip = document.getElementById('install-panel-zip');
  const panelGit = document.getElementById('install-panel-git');

  if (method === 'zip') {
    if (tabZip) tabZip.classList.add('active');
    if (tabGit) tabGit.classList.remove('active');
    if (panelZip) panelZip.classList.add('active');
    if (panelGit) panelGit.classList.remove('active');
  } else if (method === 'git') {
    if (tabGit) tabGit.classList.add('active');
    if (tabZip) tabZip.classList.remove('active');
    if (panelGit) panelGit.classList.add('active');
    if (panelZip) panelZip.classList.remove('active');
  }
}

/**
 * --------------------------------------------------------------------------
 * Developer Notes Article Renderer & Markdown Parser
 * --------------------------------------------------------------------------
 */
function parseNotesMarkdown(markdownText) {
  if (!markdownText) return '';
  
  const lines = markdownText.trim().split('\n');
  let html = '';
  let inUl = false;
  let inOl = false;

  function closeLists() {
    if (inUl) {
      html += '</ul>\n';
      inUl = false;
    }
    if (inOl) {
      html += '</ol>\n';
      inOl = false;
    }
  }

  function inlineFormat(text) {
    let res = text;
    // Bold: **text**
    res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* (after bold)
    res = res.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Inline code: `text`
    res = res.replace(/`([^`]+)`/g, '<code class="notes-inline-code">$1</code>');
    return res;
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      closeLists();
      continue;
    }

    if (line === '---') {
      closeLists();
      html += '<hr class="notes-divider" />\n';
      continue;
    }

    // Markdown Image: ![alt](src)
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      closeLists();
      const alt = imgMatch[1];
      const src = imgMatch[2];
      html += `<div class="notes-image-container"><img src="${src}" alt="${alt}" class="notes-image" loading="lazy" />${alt ? `<div class="notes-image-caption">${alt}</div>` : ''}</div>\n`;
      continue;
    }

    if (line.startsWith('> ')) {
      closeLists();
      html += `<blockquote class="notes-blockquote">${inlineFormat(line.slice(2))}</blockquote>\n`;
      continue;
    }

    if (line.startsWith('### ')) {
      closeLists();
      html += `<h4 class="notes-subheading">${inlineFormat(line.slice(4))}</h4>\n`;
      continue;
    }

    if (line.startsWith('## ')) {
      closeLists();
      html += `<h3 class="notes-heading">${inlineFormat(line.slice(3))}</h3>\n`;
      continue;
    }

    if (line.startsWith('# ')) {
      closeLists();
      html += `<h2 class="notes-title-main">${inlineFormat(line.slice(2))}</h2>\n`;
      continue;
    }

    // Unordered list item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const isNested = rawLine.startsWith('  ') || rawLine.startsWith('\t');
      if (inOl) closeLists();
      if (!inUl) {
        html += '<ul class="notes-list">\n';
        inUl = true;
      }
      html += `  <li class="notes-list-item${isNested ? ' notes-list-item-nested' : ''}">${inlineFormat(line.slice(2))}</li>\n`;
      continue;
    }

    // Ordered list item
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (inUl) closeLists();
      if (!inOl) {
        html += '<ol class="notes-ordered-list">\n';
        inOl = true;
      }
      html += `  <li class="notes-ordered-item">${inlineFormat(olMatch[2])}</li>\n`;
      continue;
    }

    // Regular paragraph
    closeLists();
    html += `<p class="notes-paragraph">${inlineFormat(line)}</p>\n`;
  }

  closeLists();
  return html;
}

function renderDeveloperNotes() {
  const container = document.getElementById('notes-article-card');
  if (!container || typeof DEVELOPER_NOTES_ARTICLE === 'undefined') return;

  const lang = (typeof currentLang !== 'undefined' && DEVELOPER_NOTES_ARTICLE[currentLang]) ? currentLang : 'zh-TW';
  const article = DEVELOPER_NOTES_ARTICLE[lang] || DEVELOPER_NOTES_ARTICLE['zh-TW'];
  if (!article) return;

  const bodyHtml = parseNotesMarkdown(article.content);
  const copyBtnLabel = t('btn_copy_notes') || '複製文章 Markdown';

  container.innerHTML = `
    <div class="notes-article-body">
      ${bodyHtml}
    </div>

    <div class="notes-footer-callout">
      <div class="callout-icon">💡</div>
      <div class="callout-content">
        <div class="callout-title">${lang === 'zh-TW' ? '在 IDE 中無縫實踐此架構' : 'Implement This in Your IDE'}</div>
        <div class="callout-desc">${lang === 'zh-TW' 
          ? '搭配「Antigravity 控制中心」的多專案工作區管理，一鍵自動同步與映射全域 Skills，享受零摩擦的跨 Agent 協同體驗。' 
          : 'Use Antigravity Toolbox to manage multi-root workspaces and auto-sync global skills via Windows Junctions for a zero-friction experience.'}</div>
      </div>
      <div class="callout-actions">
        <button class="btn-notes-copy" onclick="copyNotesArticleMarkdown()" title="${copyBtnLabel}">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span id="btn-copy-notes-text">${copyBtnLabel}</span>
        </button>
        <a href="#explore" class="callout-btn">${lang === 'zh-TW' ? '探索控制中心 ↗' : 'View Toolbox ↗'}</a>
      </div>
    </div>
  `;
}

function copyNotesArticleMarkdown() {
  if (typeof DEVELOPER_NOTES_ARTICLE === 'undefined') return;
  const lang = (typeof currentLang !== 'undefined' && DEVELOPER_NOTES_ARTICLE[currentLang]) ? currentLang : 'zh-TW';
  const article = DEVELOPER_NOTES_ARTICLE[lang] || DEVELOPER_NOTES_ARTICLE['zh-TW'];
  if (!article || !article.content) return;

  const fullText = `# ${article.title}\n\n> ${article.subtitle}\n\n${article.content.trim()}\n`;
  copyToClipboard(fullText, t('notes_copied') || '已複製開發者筆記全文！');
}


