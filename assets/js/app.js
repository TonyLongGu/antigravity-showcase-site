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

  // Smooth scroll with customized offset to display more rich content directly
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
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
    showToast('複製失敗，請手動選取');
  }
  document.body.removeChild(textArea);
}

function copyInstallCmd(cmd) {
  copyToClipboard(cmd, `已複製指令: ${cmd}`);
}

function copyAiInstallPrompt() {
  const isEn = (typeof currentLang !== 'undefined' && currentLang === 'en');
  const promptText = isEn 
    ? `Please help me install the Antigravity IDE native extensions from GitHub (https://github.com/TonyLongGu/antigravity-plugins.git).

Please guide me through the following interactive workflow:
1. Ask me which plugins to install (Provide options: 1-Click Install All 6 Plugins, or selectively choose individual plugins).
2. Ask me where I want to clone and store the repository locally (Provide a recommended default path, e.g. D:\\antigravity-plugins).
3. Based on my response, automatically clone the repository to that location and create the IDE extension mounts (execute installation scripts or create Directory Junctions).
4. After installation is complete, guide me to reload the IDE window (Developer: Reload Window).`
    : `請幫我從 GitHub (https://github.com/TonyLongGu/antigravity-plugins.git) 安裝 Antigravity IDE 原生擴充套件。

請依序執行以下引導流程：
1. 先詢問我要安裝哪些套件（提供選項：一鍵安裝全部 6 大套件，或自選個別套件）。
2. 詢問我希望將專案原始碼 Clone/放置在本機的哪個目錄（提供預設建議路徑，如 D:\\antigravity-plugins）。
3. 根據我的回覆，自動在該目錄執行 Git Clone，並自動為選定的套件建立 IDE 擴充功能掛載（執行安裝腳本或建立 Junction 符號連結）。
4. 安裝完成後，提醒我重新載入視窗 (Developer: Reload Window)。`;

  copyToClipboard(promptText, t('install_ai_prompt_copied'));
}

/**
 * Antigravity High-Performance Video Player Engine
 * 支援 HTML5 原生影片 (.mov/.mp4，0 秒無延遲、0 暫停黑幕、0.3s 極速微提示)
 * 同時相容 YouTube IFrame API
 */
let currentVideoMode = 'html5'; // 'html5' or 'youtube'
let html5VideoEl = null;
let customYtPlayer = null;
let isYtPlayerReady = false;
let isPlaying = false;
let updateProgressInterval = null;
let controlsHideTimer = null;
let isDraggingProgress = false;

window.onYouTubeIframeAPIReady = function() {
  try {
    customYtPlayer = new YT.Player('tutorial-video-iframe', {
      events: {
        'onReady': onYtPlayerReady,
        'onStateChange': onYtPlayerStateChange
      }
    });
  } catch (err) {
    console.warn('YouTube IFrame API Init:', err);
  }
};

function onYtPlayerReady(event) {
  isYtPlayerReady = true;
  if (currentVideoMode === 'youtube') {
    updateTimeAndDuration();
  }
}

function wakePlayerUI() {
  const container = document.getElementById('main-video-player');
  const controls = document.getElementById('custom-player-controls');
  if (!container || !controls) return;

  container.classList.remove('hide-ui');
  controls.classList.add('visible');

  clearTimeout(controlsHideTimer);

  if (isPlaying && !isDraggingProgress) {
    controlsHideTimer = setTimeout(() => {
      hidePlayerUI();
    }, 2400); // 靜止 2.4 秒後平滑自動收合控制列並隱藏游標
  }
}

function hidePlayerUI() {
  const container = document.getElementById('main-video-player');
  const controls = document.getElementById('custom-player-controls');
  if (!container || !controls) return;

  // 僅在播放中且未拖曳進度條時才隱藏
  if (isPlaying && !isDraggingProgress) {
    container.classList.add('hide-ui');
    controls.classList.remove('visible');
  }
}

function onYtPlayerStateChange(event) {
  if (currentVideoMode !== 'youtube') return;
  const playIcon = document.getElementById('ctrl-icon-play');
  const pauseIcon = document.getElementById('ctrl-icon-pause');
  const controls = document.getElementById('custom-player-controls');
  const container = document.getElementById('main-video-player');

  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = 'block';
    if (controls) controls.classList.remove('paused');
    if (container) container.classList.remove('paused');
    startProgressLoop();
    wakePlayerUI();
  } else {
    isPlaying = false;
    clearTimeout(controlsHideTimer);
    if (playIcon) playIcon.style.display = 'block';
    if (pauseIcon) pauseIcon.style.display = 'none';
    if (controls) {
      controls.classList.add('paused');
      controls.classList.add('visible');
    }
    if (container) {
      container.classList.add('paused');
      container.classList.remove('hide-ui');
    }
    stopProgressLoop();
    updateTimeAndDuration();
  }
}

function toggleCustomPlayer() {
  // 防止進度條拖曳後的 ghost click、拖曳中的穿透、以及 seek 過程中的誤觸
  if (justDraggedProgress || isDraggingProgress) return;
  if (html5VideoEl && html5VideoEl.seeking) return;
  const badge = document.getElementById('player-feedback-badge');
  const badgePlay = document.getElementById('badge-icon-play');
  const badgePause = document.getElementById('badge-icon-pause');
  const playIcon = document.getElementById('ctrl-icon-play');
  const pauseIcon = document.getElementById('ctrl-icon-pause');
  const controls = document.getElementById('custom-player-controls');
  const container = document.getElementById('main-video-player');

  if (currentVideoMode === 'html5') {
    if (!html5VideoEl) html5VideoEl = document.getElementById('tutorial-html5-video');
    if (!html5VideoEl) return;

    if (html5VideoEl.paused) {
      html5VideoEl.play().catch(e => console.warn('HTML5 Video Play:', e));
      isPlaying = true;
      if (badgePlay) badgePlay.style.display = 'block';
      if (badgePause) badgePause.style.display = 'none';
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
      if (controls) controls.classList.remove('paused');
      if (container) container.classList.remove('paused');
      startProgressLoop();
      wakePlayerUI();
    } else {
      html5VideoEl.pause();
      isPlaying = false;
      clearTimeout(controlsHideTimer);
      if (badgePlay) badgePlay.style.display = 'none';
      if (badgePause) badgePause.style.display = 'block';
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (controls) {
        controls.classList.add('paused');
        controls.classList.add('visible');
      }
      if (container) {
        container.classList.add('paused');
        container.classList.remove('hide-ui');
      }
      stopProgressLoop();
    }
  } else if (currentVideoMode === 'youtube') {
    if (!customYtPlayer || !isYtPlayerReady) return;
    try {
      const state = customYtPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        customYtPlayer.pauseVideo();
        if (badgePlay) badgePlay.style.display = 'none';
        if (badgePause) badgePause.style.display = 'block';
      } else {
        customYtPlayer.playVideo();
        if (badgePlay) badgePlay.style.display = 'block';
        if (badgePause) badgePause.style.display = 'none';
      }
    } catch (err) {
      console.warn('toggleCustomPlayer YT:', err);
    }
  }

  // 0.3 秒極速淡出微提示
  if (badge) {
    badge.classList.add('flash');
    setTimeout(() => {
      badge.classList.remove('flash');
    }, 300);
  }
}

function toggleMute() {
  const volHigh = document.getElementById('ctrl-icon-vol-high');
  const volMute = document.getElementById('ctrl-icon-vol-mute');

  if (currentVideoMode === 'html5') {
    if (!html5VideoEl) html5VideoEl = document.getElementById('tutorial-html5-video');
    if (!html5VideoEl) return;
    html5VideoEl.muted = !html5VideoEl.muted;
    if (!html5VideoEl.muted) {
      if (volHigh) volHigh.style.display = 'block';
      if (volMute) volMute.style.display = 'none';
      const targetVol = (html5VideoEl.volume * 100) || 100;
      updateVolumeSliderUI(targetVol);
    } else {
      if (volHigh) volHigh.style.display = 'none';
      if (volMute) volMute.style.display = 'block';
      updateVolumeSliderUI(0);
    }
  } else if (currentVideoMode === 'youtube') {
    if (!customYtPlayer || !isYtPlayerReady) return;
    if (customYtPlayer.isMuted()) {
      customYtPlayer.unMute();
      if (volHigh) volHigh.style.display = 'block';
      if (volMute) volMute.style.display = 'none';
      const targetVol = customYtPlayer.getVolume() || 100;
      updateVolumeSliderUI(targetVol);
    } else {
      customYtPlayer.mute();
      if (volHigh) volHigh.style.display = 'none';
      if (volMute) volMute.style.display = 'block';
      updateVolumeSliderUI(0);
    }
  }
  wakePlayerUI();
}

function updateVolumeSliderUI(val) {
  const slider = document.getElementById('ctrl-volume-slider');
  if (!slider) return;
  const num = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
  slider.value = num;
  slider.style.setProperty('--vol-percent', `${num}%`);
}

function changeVolume(val) {
  const volHigh = document.getElementById('ctrl-icon-vol-high');
  const volMute = document.getElementById('ctrl-icon-vol-mute');
  val = parseInt(val, 10);
  if (isNaN(val)) val = 100;

  updateVolumeSliderUI(val);

  if (currentVideoMode === 'html5') {
    if (!html5VideoEl) html5VideoEl = document.getElementById('tutorial-html5-video');
    if (!html5VideoEl) return;
    html5VideoEl.volume = val / 100;
    html5VideoEl.muted = (val === 0);
  } else if (currentVideoMode === 'youtube') {
    if (!customYtPlayer || !isYtPlayerReady) return;
    customYtPlayer.setVolume(val);
    if (val === 0) customYtPlayer.mute();
    else if (customYtPlayer.isMuted()) customYtPlayer.unMute();
  }

  if (val === 0) {
    if (volHigh) volHigh.style.display = 'none';
    if (volMute) volMute.style.display = 'block';
  } else {
    if (volHigh) volHigh.style.display = 'block';
    if (volMute) volMute.style.display = 'none';
  }
  wakePlayerUI();
}

let isWebFullscreen = false;

function enterWebFullscreen() {
  const container = document.getElementById('main-video-player');
  const fsEnter = document.getElementById('ctrl-icon-fullscreen-enter');
  const fsExit = document.getElementById('ctrl-icon-fullscreen-exit');
  if (!container) return;

  isWebFullscreen = true;
  container.classList.add('is-web-fullscreen');
  document.body.classList.add('has-web-fullscreen');

  if (fsEnter && fsExit) {
    fsEnter.style.display = 'none';
    fsExit.style.display = 'block';
  }

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

  if (fsEnter && fsExit) {
    fsEnter.style.display = 'block';
    fsExit.style.display = 'none';
  }

  // 釋放全螢幕按鈕焦點
  const fsBtn = document.getElementById('ctrl-fullscreen-btn');
  if (fsBtn && (document.activeElement === fsBtn || container.contains(document.activeElement))) {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  }

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

  // 退出全螢幕時的焦點釋放與無縫就位保障
  if (!isFs) {
    // 1. 釋放全螢幕按鈕焦點，避免瀏覽器在恢復排版時強制滾動貼齊右下角按鈕
    const fsBtn = document.getElementById('ctrl-fullscreen-btn');
    if (fsBtn && (document.activeElement === fsBtn || (container && container.contains(document.activeElement)))) {
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
    }

    // 2. 備用校準：以 instant (無動畫) 確保精準居中，徹底杜絕縮回後的二次滑動感
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
  let dur = 0;
  let curr = 0;
  if (currentVideoMode === 'html5' && html5VideoEl) {
    dur = html5VideoEl.duration || 0;
    curr = html5VideoEl.currentTime || 0;
    const target = Math.max(0, Math.min(dur, curr + seconds));
    safeSeekHtml5Video(target);
    updateTimeAndDuration();
  } else if (currentVideoMode === 'youtube' && customYtPlayer && isYtPlayerReady) {
    try {
      dur = customYtPlayer.getDuration() || 0;
      curr = customYtPlayer.getCurrentTime() || 0;
      const target = Math.max(0, Math.min(dur, curr + seconds));
      customYtPlayer.seekTo(target, true);
      updateTimeAndDuration();
    } catch (e) {}
  }
}

function adjustVolumeRelative(delta) {
  const slider = document.getElementById('ctrl-volume-slider');
  let currentVol = 100;
  if (currentVideoMode === 'html5' && html5VideoEl) {
    currentVol = html5VideoEl.muted ? 0 : Math.round(html5VideoEl.volume * 100);
  } else if (currentVideoMode === 'youtube' && customYtPlayer && isYtPlayerReady) {
    try {
      currentVol = customYtPlayer.isMuted() ? 0 : customYtPlayer.getVolume();
    } catch (e) {}
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

function startProgressLoop() {
  stopProgressLoop();
  updateProgressInterval = setInterval(updateTimeAndDuration, 200);
}

function stopProgressLoop() {
  if (updateProgressInterval) {
    clearInterval(updateProgressInterval);
    updateProgressInterval = null;
  }
}

function updateTimeAndDuration() {
  if (isDraggingProgress) return;

  let curr = 0;
  let dur = 0;
  let loadedPct = 0;

  if (currentVideoMode === 'html5') {
    if (!html5VideoEl) html5VideoEl = document.getElementById('tutorial-html5-video');
    if (!html5VideoEl) return;
    curr = html5VideoEl.currentTime || 0;
    dur = html5VideoEl.duration || 0;
    if (html5VideoEl.buffered && html5VideoEl.buffered.length > 0 && dur > 0) {
      for (let i = 0; i < html5VideoEl.buffered.length; i++) {
        if (curr >= html5VideoEl.buffered.start(i) && curr <= html5VideoEl.buffered.end(i)) {
          loadedPct = (html5VideoEl.buffered.end(i) / dur) * 100;
          break;
        }
      }
    }
  } else if (currentVideoMode === 'youtube') {
    if (!customYtPlayer || !isYtPlayerReady) return;
    try {
      curr = customYtPlayer.getCurrentTime() || 0;
      dur = customYtPlayer.getDuration() || 0;
      loadedPct = (customYtPlayer.getVideoLoadedFraction() || 0) * 100;
    } catch (e) {}
  }

  const timeCurrEl = document.getElementById('time-current');
  const timeDurEl = document.getElementById('time-duration');
  const filledBar = document.getElementById('player-progress-filled');
  const thumbEl = document.getElementById('player-progress-thumb');
  const bufBar = document.getElementById('player-progress-buffered');

  if (timeCurrEl) timeCurrEl.textContent = formatTime(curr);
  if (timeDurEl && dur > 0) timeDurEl.textContent = formatTime(dur);

  if (dur > 0) {
    const pct = (curr / dur) * 100;
    if (filledBar) filledBar.style.width = `${pct}%`;
    if (thumbEl) thumbEl.style.left = `${pct}%`;
    if (bufBar) bufBar.style.width = `${loadedPct}%`;
  }
}

let isCustomPlayerInited = false;

function initCustomVideoPlayer() {
  if (isCustomPlayerInited) return;
  isCustomPlayerInited = true;

  html5VideoEl = document.getElementById('tutorial-html5-video');
  const container = document.getElementById('main-video-player');
  const progContainer = document.getElementById('player-progress-container');
  const controls = document.getElementById('custom-player-controls');
  const volSlider = document.getElementById('ctrl-volume-slider');
  if (!container || !progContainer) return;

  // 初始化音量滑桿雙色進度填充
  if (volSlider) {
    updateVolumeSliderUI(volSlider.value || 100);
  }

  // 監聽跨瀏覽器全螢幕切換事件
  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
    document.addEventListener(evt, updateFullscreenState);
  });

  // HTML5 Video 原生事件監聽
  if (html5VideoEl) {
    html5VideoEl.addEventListener('timeupdate', updateTimeAndDuration);
    html5VideoEl.addEventListener('loadedmetadata', updateTimeAndDuration);
    html5VideoEl.addEventListener('play', () => {
      isPlaying = true;
      const playIcon = document.getElementById('ctrl-icon-play');
      const pauseIcon = document.getElementById('ctrl-icon-pause');
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
      if (controls) controls.classList.remove('paused');
      if (container) container.classList.remove('paused');
      startProgressLoop();
      wakePlayerUI();
    });
    html5VideoEl.addEventListener('pause', () => {
      isPlaying = false;
      clearTimeout(controlsHideTimer);
      const playIcon = document.getElementById('ctrl-icon-play');
      const pauseIcon = document.getElementById('ctrl-icon-pause');
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (controls) {
        controls.classList.add('paused');
        controls.classList.add('visible');
      }
      if (container) {
        container.classList.add('paused');
        container.classList.remove('hide-ui');
      }
      stopProgressLoop();
    });
    html5VideoEl.addEventListener('ended', () => {
      isPlaying = false;
      clearTimeout(controlsHideTimer);
      const playIcon = document.getElementById('ctrl-icon-play');
      const pauseIcon = document.getElementById('ctrl-icon-pause');
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (controls) {
        controls.classList.add('paused');
        controls.classList.add('visible');
      }
      if (container) {
        container.classList.add('paused');
        container.classList.remove('hide-ui');
      }
      stopProgressLoop();
    });

    // 全螢幕 Seek 卡頓自動恢復：偵測 waiting 狀態並在就緒時確保播放
    html5VideoEl.addEventListener('waiting', () => {
      if (isPlaying && !html5VideoEl.paused) {
        setTimeout(() => {
          if (html5VideoEl && isPlaying && html5VideoEl.readyState >= 2) {
            const p = html5VideoEl.play();
            if (p && p.catch) p.catch(() => {});
          }
        }, 500);
      }
    });
  }

  // 控制列與滑鼠游標喚醒/自動隱藏監聽
  container.addEventListener('mousemove', wakePlayerUI);
  container.addEventListener('pointermove', wakePlayerUI);
  container.addEventListener('mouseenter', wakePlayerUI);
  container.addEventListener('touchstart', wakePlayerUI, { passive: true });
  container.addEventListener('mouseleave', () => {
    clearTimeout(controlsHideTimer);
    if (isPlaying && !isDraggingProgress) {
      controlsHideTimer = setTimeout(() => {
        hidePlayerUI();
      }, 500);
    }
  });

  // 全域/播放器鍵盤快捷鍵 (全螢幕或播放中均可極速操控)
  document.addEventListener('keydown', (e) => {
    const isNativeFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    const isFs = isNativeFs || isWebFullscreen;
    const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if (isInput) return;

    if (e.key === 'Escape' && isWebFullscreen) {
      e.preventDefault();
      exitWebFullscreen();
      return;
    }

    const isHovered = container.matches(':hover');
    if (!isFs && !isHovered) return;

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
  // 取代 inline onclick，徹底避免全螢幕下各種 ghost click 穿透暫停
  const clickSurface = document.getElementById('player-click-surface');
  if (clickSurface) {
    let surfacePointerDownTime = 0;
    let surfacePointerDownX = 0;
    let surfacePointerDownY = 0;

    clickSurface.addEventListener('pointerdown', (e) => {
      surfacePointerDownTime = Date.now();
      surfacePointerDownX = e.clientX;
      surfacePointerDownY = e.clientY;
    });

    clickSurface.addEventListener('pointerup', (e) => {
      const dt = Date.now() - surfacePointerDownTime;
      const dx = Math.abs(e.clientX - surfacePointerDownX);
      const dy = Math.abs(e.clientY - surfacePointerDownY);
      // 僅在快速按下並釋放（<400ms）且未移動（<10px）時才視為有效點擊
      if (dt < 400 && dx < 10 && dy < 10) {
        toggleCustomPlayer();
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
    let dur = 0;
    if (currentVideoMode === 'html5' && html5VideoEl) {
      dur = html5VideoEl.duration || 0;
    } else if (currentVideoMode === 'youtube' && customYtPlayer && isYtPlayerReady) {
      dur = customYtPlayer.getDuration() || 0;
    }

    const filledBar = document.getElementById('player-progress-filled');
    const thumbEl = document.getElementById('player-progress-thumb');
    const timeCurrEl = document.getElementById('time-current');

    if (filledBar) filledBar.style.width = `${pos * 100}%`;
    if (thumbEl) thumbEl.style.left = `${pos * 100}%`;
    if (timeCurrEl && dur > 0) timeCurrEl.textContent = formatTime(pos * dur);
  };

  // 真正執行跳轉（僅在點擊釋放或拖曳結束時執行一次）
  const applySeek = (pos) => {
    let dur = 0;
    if (currentVideoMode === 'html5' && html5VideoEl) {
      dur = html5VideoEl.duration || 0;
      const targetTime = pos * dur;
      safeSeekHtml5Video(targetTime);
    } else if (currentVideoMode === 'youtube' && customYtPlayer && isYtPlayerReady) {
      dur = customYtPlayer.getDuration() || 0;
      const targetTime = pos * dur;
      try {
        customYtPlayer.seekTo(targetTime, true);
      } catch (e) {
        console.warn('YouTube Seek Error:', e);
      }
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

  progContainer.addEventListener('pointerup', endDragSeek);
  progContainer.addEventListener('pointercancel', endDragSeek);
}
function getTutorialVideosList() {
  if (typeof TUTORIAL_VIDEOS !== 'undefined' && Array.isArray(TUTORIAL_VIDEOS) && TUTORIAL_VIDEOS.length > 0) {
    return TUTORIAL_VIDEOS;
  }
  return typeof PLUGINS_DATA !== 'undefined' ? PLUGINS_DATA : [];
}

let currentActiveVideoId = 'antigravity-design-philosophy';

function initVideoShowcase() {
  const playlistPills = document.getElementById('video-playlist-pills');
  const videoList = getTutorialVideosList();
  if (!playlistPills || videoList.length === 0) return;

  const targetId = currentActiveVideoId || (videoList[0] ? videoList[0].id : null);

  playlistPills.innerHTML = videoList.map((item) => {
    const name = item.name ? (item.name[currentLang] || item.name['zh-TW']) : (item.title || '');
    const shortName = name.split('(')[0].trim();
    const isActive = item.id === targetId;
    return `
      <button class="playlist-btn ${isActive ? 'active' : ''}" onclick="switchTutorialVideo('${item.id}')">
        <img src="${item.icon || 'assets/icons/philosophy.svg'}" style="width: 16px; height: 16px;" alt="" />
        ${shortName}
      </button>
    `;
  }).join('');

  if (targetId) {
    switchTutorialVideo(targetId);
  }
}

/**
 * Smart YouTube URL Parser
 */
function parseYouTubeUrls(input) {
  if (!input) return { videoId: '', watchUrl: '', embedUrl: '', thumbUrl: '' };
  
  let videoId = input.trim();
  const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    videoId = match[1];
  } else if (videoId.includes('embed/')) {
    videoId = videoId.split('embed/')[1].split('?')[0];
  }

  return {
    videoId: videoId,
    watchUrl: `https://youtu.be/${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0&enablejsapi=1&iv_load_policy=3&disablekb=1&playsinline=1`,
    thumbUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  };
}

function switchTutorialVideo(videoId) {
  const videoList = getTutorialVideosList();
  const videoItem = videoList.find(v => v.id === videoId) || (typeof PLUGINS_DATA !== 'undefined' ? PLUGINS_DATA.find(p => p.id === videoId) : null);
  if (!videoItem) return;

  currentActiveVideoId = videoId;

  const html5Video = document.getElementById('tutorial-html5-video');
  const videoIframe = document.getElementById('tutorial-video-iframe');
  const videoTitle = document.getElementById('tutorial-video-title');
  const videoDesc = document.getElementById('tutorial-video-desc');
  const buttons = document.querySelectorAll('.playlist-btn');
  const playIcon = document.getElementById('ctrl-icon-play');
  const pauseIcon = document.getElementById('ctrl-icon-pause');
  const controls = document.getElementById('custom-player-controls');
  const filledBar = document.getElementById('player-progress-filled');
  const thumbEl = document.getElementById('player-progress-thumb');
  const bufBar = document.getElementById('player-progress-buffered');
  const timeCurrEl = document.getElementById('time-current');

  const shortName = videoItem.name ? ((videoItem.name['zh-TW'] || '').split('(')[0].trim()) : '';
  const shortNameEn = videoItem.name ? ((videoItem.name['en'] || '').split('(')[0].trim()) : '';

  buttons.forEach(btn => {
    if ((shortName && btn.textContent.includes(shortName)) || (shortNameEn && btn.textContent.includes(shortNameEn))) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 重設播放狀態與進度條
  isPlaying = false;
  clearTimeout(controlsHideTimer);
  const container = document.getElementById('main-video-player');
  if (container) {
    container.classList.add('paused');
    container.classList.remove('hide-ui');
  }
  if (playIcon) playIcon.style.display = 'block';
  if (pauseIcon) pauseIcon.style.display = 'none';
  if (controls) {
    controls.classList.add('paused');
    controls.classList.add('visible');
  }
  if (filledBar) filledBar.style.width = '0%';
  if (thumbEl) thumbEl.style.left = '0%';
  if (bufBar) bufBar.style.width = '0%';
  if (timeCurrEl) timeCurrEl.textContent = '0:00';

  // 優先使用本機原生影片 (HTML5 Video)
  if (videoItem.videoSrc && html5Video) {
    currentVideoMode = 'html5';
    html5Video.style.display = 'block';
    if (videoIframe) videoIframe.style.display = 'none';
    if (customYtPlayer && isYtPlayerReady && typeof customYtPlayer.pauseVideo === 'function') {
      customYtPlayer.pauseVideo();
    }

    html5Video.src = videoItem.videoSrc;
    html5Video.load();
    updateTimeAndDuration();
  } else {
    currentVideoMode = 'youtube';
    if (html5Video) {
      html5Video.pause();
      html5Video.style.display = 'none';
    }
    if (videoIframe) videoIframe.style.display = 'block';

    const parsed = parseYouTubeUrls(videoItem.videoUrl || videoItem.videoEmbedUrl || 'HSYWa4WkBe0');
    if (customYtPlayer && isYtPlayerReady && typeof customYtPlayer.loadVideoById === 'function') {
      customYtPlayer.cueVideoById(parsed.videoId);
    } else if (videoIframe) {
      videoIframe.dataset.src = parsed.embedUrl;
      videoIframe.src = parsed.embedUrl;
    }
  }

  if (videoTitle) {
    const rawName = videoItem.name ? (videoItem.name[currentLang] || videoItem.name['zh-TW']) : (videoItem.title || '');
    videoTitle.textContent = rawName;
  }
  if (videoDesc) {
    videoDesc.textContent = videoItem.shortDesc ? (videoItem.shortDesc[currentLang] || videoItem.shortDesc['zh-TW']) : '';
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

