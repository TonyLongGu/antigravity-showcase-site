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

  // 4. Initialize Modal
  initModal();

  // 5. Initialize Navigation & Scrollspy
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

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
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

function onYtPlayerStateChange(event) {
  if (currentVideoMode !== 'youtube') return;
  const playIcon = document.getElementById('ctrl-icon-play');
  const pauseIcon = document.getElementById('ctrl-icon-pause');
  const controls = document.getElementById('custom-player-controls');

  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = 'block';
    if (controls) controls.classList.remove('paused');
    startProgressLoop();
  } else {
    isPlaying = false;
    if (playIcon) playIcon.style.display = 'block';
    if (pauseIcon) pauseIcon.style.display = 'none';
    if (controls) controls.classList.add('paused');
    stopProgressLoop();
    updateTimeAndDuration();
  }
}

function toggleCustomPlayer() {
  const badge = document.getElementById('player-feedback-badge');
  const badgePlay = document.getElementById('badge-icon-play');
  const badgePause = document.getElementById('badge-icon-pause');
  const playIcon = document.getElementById('ctrl-icon-play');
  const pauseIcon = document.getElementById('ctrl-icon-pause');
  const controls = document.getElementById('custom-player-controls');

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
      startProgressLoop();
    } else {
      html5VideoEl.pause();
      isPlaying = false;
      if (badgePlay) badgePlay.style.display = 'none';
      if (badgePause) badgePause.style.display = 'block';
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (controls) controls.classList.add('paused');
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
  const slider = document.getElementById('ctrl-volume-slider');

  if (currentVideoMode === 'html5') {
    if (!html5VideoEl) html5VideoEl = document.getElementById('tutorial-html5-video');
    if (!html5VideoEl) return;
    html5VideoEl.muted = !html5VideoEl.muted;
    if (!html5VideoEl.muted) {
      if (volHigh) volHigh.style.display = 'block';
      if (volMute) volMute.style.display = 'none';
      if (slider) slider.value = (html5VideoEl.volume * 100) || 100;
    } else {
      if (volHigh) volHigh.style.display = 'none';
      if (volMute) volMute.style.display = 'block';
      if (slider) slider.value = 0;
    }
  } else if (currentVideoMode === 'youtube') {
    if (!customYtPlayer || !isYtPlayerReady) return;
    if (customYtPlayer.isMuted()) {
      customYtPlayer.unMute();
      if (volHigh) volHigh.style.display = 'block';
      if (volMute) volMute.style.display = 'none';
      if (slider) slider.value = customYtPlayer.getVolume() || 100;
    } else {
      customYtPlayer.mute();
      if (volHigh) volHigh.style.display = 'none';
      if (volMute) volMute.style.display = 'block';
      if (slider) slider.value = 0;
    }
  }
}

function changeVolume(val) {
  const volHigh = document.getElementById('ctrl-icon-vol-high');
  const volMute = document.getElementById('ctrl-icon-vol-mute');
  val = parseInt(val, 10);

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
}

function toggleFullscreen() {
  const container = document.getElementById('main-video-player');
  const fsEnter = document.getElementById('ctrl-icon-fullscreen-enter');
  const fsExit = document.getElementById('ctrl-icon-fullscreen-exit');
  if (!container) return;

  if (!document.fullscreenElement) {
    container.requestFullscreen().then(() => {
      if (fsEnter) fsEnter.style.display = 'none';
      if (fsExit) fsExit.style.display = 'block';
    }).catch(err => console.warn(err));
  } else {
    document.exitFullscreen().then(() => {
      if (fsEnter) fsEnter.style.display = 'block';
      if (fsExit) fsExit.style.display = 'none';
    }).catch(err => console.warn(err));
  }
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
      loadedPct = (html5VideoEl.buffered.end(html5VideoEl.buffered.length - 1) / dur) * 100;
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
  if (!container || !progContainer) return;

  // HTML5 Video 原生事件監聽
  if (html5VideoEl) {
    html5VideoEl.addEventListener('timeupdate', updateTimeAndDuration);
    html5VideoEl.addEventListener('loadedmetadata', updateTimeAndDuration);
    html5VideoEl.addEventListener('ended', () => {
      isPlaying = false;
      const playIcon = document.getElementById('ctrl-icon-play');
      const pauseIcon = document.getElementById('ctrl-icon-pause');
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (controls) controls.classList.add('paused');
    });
  }

  // 控制列自動隱藏 (移出 0.4s 漸隱，靜止 1.8s 漸隱)
  const showControls = () => {
    if (controls) controls.classList.add('visible');
    clearTimeout(controlsHideTimer);
    if (isPlaying) {
      controlsHideTimer = setTimeout(() => {
        if (controls && isPlaying && !isDraggingProgress) {
          controls.classList.remove('visible');
        }
      }, 1800);
    }
  };

  container.addEventListener('mousemove', showControls);
  container.addEventListener('mouseleave', () => {
    clearTimeout(controlsHideTimer);
    if (isPlaying && !isDraggingProgress) {
      controlsHideTimer = setTimeout(() => {
        if (controls) controls.classList.remove('visible');
      }, 400);
    }
  });

  // 進度條跳轉
  const handleSeek = (e) => {
    const rect = progContainer.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

    let dur = 0;
    if (currentVideoMode === 'html5' && html5VideoEl) {
      dur = html5VideoEl.duration || 0;
      const targetTime = pos * dur;
      html5VideoEl.currentTime = targetTime;
    } else if (currentVideoMode === 'youtube' && customYtPlayer && isYtPlayerReady) {
      dur = customYtPlayer.getDuration() || 0;
      const targetTime = pos * dur;
      customYtPlayer.seekTo(targetTime, true);
    }

    const filledBar = document.getElementById('player-progress-filled');
    const thumbEl = document.getElementById('player-progress-thumb');
    const timeCurrEl = document.getElementById('time-current');

    if (filledBar) filledBar.style.width = `${pos * 100}%`;
    if (thumbEl) thumbEl.style.left = `${pos * 100}%`;
    if (timeCurrEl && dur > 0) timeCurrEl.textContent = formatTime(pos * dur);
  };

  progContainer.addEventListener('click', handleSeek);

  progContainer.addEventListener('mousedown', (e) => {
    isDraggingProgress = true;
    handleSeek(e);

    const onMove = (moveEvt) => {
      if (isDraggingProgress) handleSeek(moveEvt);
    };

    const onUp = () => {
      isDraggingProgress = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });
}

/**
 * Video Showcase & Playlist Switcher
 */
function getTutorialVideosList() {
  if (typeof TUTORIAL_VIDEOS !== 'undefined' && Array.isArray(TUTORIAL_VIDEOS) && TUTORIAL_VIDEOS.length > 0) {
    return TUTORIAL_VIDEOS;
  }
  return typeof PLUGINS_DATA !== 'undefined' ? PLUGINS_DATA : [];
}

function initVideoShowcase() {
  const playlistPills = document.getElementById('video-playlist-pills');
  const videoList = getTutorialVideosList();
  if (!playlistPills || videoList.length === 0) return;

  playlistPills.innerHTML = videoList.map((item, idx) => {
    const name = item.name ? (item.name[currentLang] || item.name['zh-TW']) : (item.title || '');
    const shortName = name.split('(')[0].trim();
    return `
      <button class="playlist-btn ${idx === 0 ? 'active' : ''}" onclick="switchTutorialVideo('${item.id}')">
        <img src="${item.icon || 'assets/icons/philosophy.svg'}" style="width: 16px; height: 16px;" alt="" />
        ${shortName}
      </button>
    `;
  }).join('');

  if (videoList.length > 0) {
    switchTutorialVideo(videoList[0].id);
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
  if (playIcon) playIcon.style.display = 'block';
  if (pauseIcon) pauseIcon.style.display = 'none';
  if (controls) controls.classList.add('paused');
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
    const rawName = videoItem.name ? (videoItem.name[currentLang] || videoItem.name['zh-TW']) : (videoItem.title || '實戰教學');
    videoTitle.textContent = `${rawName} — 實戰教學`;
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

