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
 * Video Showcase & Playlist Switcher
 */
function initVideoShowcase() {
  const playlistPills = document.getElementById('video-playlist-pills');
  if (!playlistPills || typeof PLUGINS_DATA === 'undefined') return;

  playlistPills.innerHTML = PLUGINS_DATA.map((plugin, idx) => {
    const name = plugin.name[currentLang] || plugin.name['zh-TW'];
    const shortName = name.split('(')[0].trim();
    return `
      <button class="playlist-btn ${idx === 0 ? 'active' : ''}" onclick="switchTutorialVideo('${plugin.id}')">
        <img src="${plugin.icon}" style="width: 16px; height: 16px;" alt="" />
        ${shortName}
      </button>
    `;
  }).join('');

  if (PLUGINS_DATA.length > 0) {
    switchTutorialVideo(PLUGINS_DATA[0].id);
  }
}

/**
 * Smart YouTube URL Parser
 * 自動解析各種 YouTube 格式（完整網址、youtu.be、embed 標籤或純影片 ID）
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
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&enablejsapi=1`,
    thumbUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  };
}

function playTutorialVideo() {
  const cover = document.getElementById('video-thumbnail-cover');
  const iframe = document.getElementById('tutorial-video-iframe');
  
  if (cover) cover.style.display = 'none';
  if (iframe) {
    if (iframe.dataset.src) {
      iframe.src = iframe.dataset.src + '&autoplay=1';
    }
  }
}

function switchTutorialVideo(pluginId) {
  const plugin = PLUGINS_DATA.find(p => p.id === pluginId);
  if (!plugin) return;

  const videoIframe = document.getElementById('tutorial-video-iframe');
  const videoCover = document.getElementById('video-thumbnail-cover');
  const videoTitle = document.getElementById('tutorial-video-title');
  const videoDesc = document.getElementById('tutorial-video-desc');
  const buttons = document.querySelectorAll('.playlist-btn');

  const shortName = (plugin.name['zh-TW'] || '').split('(')[0].trim();
  const shortNameEn = (plugin.name['en'] || '').split('(')[0].trim();

  buttons.forEach(btn => {
    if (btn.textContent.includes(shortName) || btn.textContent.includes(shortNameEn)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const parsed = parseYouTubeUrls(plugin.videoUrl || plugin.videoEmbedUrl || 'fgDIeYi-NCo');

  if (videoCover) {
    videoCover.style.display = 'flex';
    videoCover.style.backgroundImage = `url('${parsed.thumbUrl}')`;
  }
  if (videoIframe) {
    videoIframe.dataset.src = parsed.embedUrl;
    videoIframe.src = parsed.embedUrl;
  }
  if (videoTitle) {
    videoTitle.textContent = `${plugin.name[currentLang] || plugin.name['zh-TW']} — 實戰教學`;
  }
  if (videoDesc) {
    videoDesc.textContent = plugin.shortDesc[currentLang] || plugin.shortDesc['zh-TW'];
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

