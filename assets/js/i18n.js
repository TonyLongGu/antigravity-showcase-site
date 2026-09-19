/**
 * Antigravity Plugins Showcase - i18n Localization Engine
 */
const I18N = {
  'zh-TW': {
    page_title: 'VS Code Plugins - AI Agent IDE 專案管理插件',
    brand_title: 'VS Code',
    brand_subtitle: '擴充套件生態系',
    brand_badge: 'Plugins',
    nav_home: '首頁',
    nav_explore: '探索插件',
    nav_features: '核心特色',
    nav_video: '影音教學',
    nav_install: '安裝指南',
    nav_github: 'GitHub',
    lang_btn: 'EN',
    
    hero_badge: 'AI Agent IDE 專案管理插件',
    hero_last_updated_label: '網站更新時間：',
    hero_title_1: '極致擴展你的',
    hero_title_gradient: 'AI 協同開發體驗',
    hero_subtitle: '側邊欄、狀態列與右鍵工具可掛到各 IDE 擴充目錄；Windows Junction 免編譯，改完即生效。不相容套件會自動略過。',
    btn_explore: '瀏覽 6 大插件',
    btn_download_all_zip: '下載全套插件包 (.zip)',
    btn_watch_video: '觀看教學影片',
    btn_install_guide: '一鍵安裝教學',
    btn_copy_cmd: '複製',
    btn_copied: '已複製！',
    
    search_placeholder: '搜尋擴充套件名稱、指令、功能關鍵字...',
    tab_all: '全部插件',
    tab_sidebar: '側邊欄面板',
    tab_status: '狀態列監控',
    tab_explorer: '檔案總管視圖',
    tab_script: '腳本與工具箱',
    ide_filter_label: '依 IDE',
    tab_ide_all: '全部環境',
    
    btn_github_repo: '前往 GitHub 倉庫 ↗',
    btn_watch_tutorial: '教學影片',
    btn_quick_install: '安裝',
    empty_search_title: '查無符合的擴充套件',
    empty_search_desc: '請嘗試搜尋其他關鍵字，或切換分類 / IDE 篩選。',
    
    section_video_tag: '影片教學',
    section_video_title: '精選影音示範與實戰教學',
    section_video_desc: '示範畫面以 Antigravity 為主；Cursor / VS Code 的側邊欄與指令位置相同。用影片快速掌握操作。',
    video_playlist_prompt: '點擊切換各主題與插件教學影片：',
    ctrl_cc_title: '字幕開關 (C)',
    ctrl_play_title: '播放 / 暫停 (Space)',
    ctrl_mute_title: '靜音 / 取消靜音 (M)',
    ctrl_fullscreen_title: '全螢幕 (F)',
    copied_cmd_prefix: '已複製指令',
    copy_failed: '複製失敗，請手動選取',
    btn_card_github_title: '前往 GitHub 插件源碼目錄',
    
    nav_author: '關於作者',
    section_author_tag: '開發者簡介',
    section_author_title: '關於擴充套件作者',
    author_name: '劉庭豪',
    author_alias: 'TonyLongGu',
    author_badge: '獨立開發者 / 工具創作者',
    author_bio: '專注於 3D 動畫綁定工具、自動化腳本管線，以及為 VS Code 相容 AI Agent IDE 打造協同工具。',
    author_email_label: '聯絡信箱',
    author_website_label: '個人官方網站',
    author_visit_website: '前往個人作品集網站 ↗',
    author_copy_email: '複製',
    author_email_copied: '已複製信箱地址！',

    section_install_tag: '極速上手',
    section_install_title: '兩種安裝方式 • 輕鬆無縫部署',
    section_install_desc: '支援「下載 ZIP 點擊安裝」與「AI 智能引導安裝（複製 Prompt 即裝）」雙路徑，自由選擇一鍵全安裝或個別插件自選啟用。',
    
    install_tab_zip: '方式一：下載 ZIP 壓縮包',
    install_tab_zip_sub: '免 Git • 本機雙擊即用',
    install_tab_git: '方式二：AI 智能引導安裝',
    install_tab_git_sub: '一鍵複製提示詞 • AI 自動對話配置',
    
    install_zip_step1_title: '下載全套套件包並解壓縮',
    install_zip_step1_desc: '點擊下方按鈕下載最新版全套套件 ZIP，並解壓縮至本機任意目錄（例如 D:\\antigravity-plugins）：',
    btn_download_zip_action: '下載全套插件包 (.zip)',
    
    install_submode_title: '執行安裝腳本（一鍵全安裝 或 單獨安裝）',
    install_submode_full_title: '一鍵安裝全部插件',
    install_submode_full_desc: '雙擊專案根目錄下的「install-all.bat」（或以 PowerShell 執行 install-all.ps1）。腳本會詢問安裝目標（Antigravity / VS Code / Cursor / 全部），並為支援的套件建立免編譯掛載；不相容套件會自動略過：',
    install_submode_custom_title: '單獨安裝特定插件',
    install_submode_custom_desc: '進入欲啟用的插件目錄（例如 antigravity-toolbox/），雙擊該目錄下的「install-extension.bat」即可單獨啟用：',
    install_submode_custom_code: '<插件名稱>/install-extension.bat',
    install_common_step3_title: '重新載入目前使用的 IDE 視窗',
    install_common_step3_desc: 'Antigravity 與 Cursor：Ctrl + Shift + P → Developer: Reload Window。VS Code：建議完整關閉後再重開，較不易被 extensions.json 快取覆寫。',
    
    install_ai_step1_title: '複製 AI 智能安裝提示詞',
    install_ai_step1_desc: '點擊下方按鈕複製結構化安裝 Prompt，提示詞內建 GitHub 倉庫來源與全流程對話引導：',
    install_ai_prompt_copy_btn: '複製 AI 智能安裝提示詞',
    install_ai_prompt_copied: '已複製提示詞！請貼到目前 IDE 的 AI Chat',
    install_ai_step2_title: '貼到目前 IDE 的 AI Chat',
    install_ai_step2_desc: '在 Cursor、Antigravity 或 VS Code（Copilot Chat 等）打開 AI 對話框，貼上提示詞並發送。',
    install_ai_step3_title: '跟隨 AI 引導並全自動安裝',
    install_ai_step3_desc: 'AI Agent 將主動向您確認安裝項目與本機目錄，隨後全自動完成 Git Clone 與軟連結掛載：',
    install_ai_flow_q1_badge: '步驟 A',
    install_ai_flow_q1_text: 'AI 主動詢問：安裝【全套 6 大插件】還是【自選特定套件】？',
    install_ai_flow_q2_badge: '步驟 B',
    install_ai_flow_q2_text: 'AI 主動詢問：希望將專案安裝在本機哪個資料夾？（預設建議 D:\\antigravity-plugins）',
    install_ai_flow_q3_badge: '步驟 C',
    install_ai_flow_q3_text: 'AI 自動執行：背景 Clone 倉庫 ➔ 建立 Junction 軟連結 ➔ 引導重載視窗即刻生效！',
    
    install_feature_junction_title: 'Windows Junction 免編譯技術',
    install_feature_junction_desc: '以目錄連接點掛到 Antigravity、Cursor 或 VS Code 各自的 extensions 目錄，零磁碟重複，修改即熱生效。環境嚴格隔離。',
    install_feature_safe_title: '無痕卸載安全無殘留',
    install_feature_safe_desc: '隨時雙擊根目錄下的「uninstall-all.bat」或個別目錄下的「uninstall-extension.bat」秒級乾淨卸載。',
    
    install_zip_note_badge: '無需 Git 環境 • 解壓即用',
    install_submode_full_badge: '雙擊執行腳本',
    install_submode_custom_badge: '進入插件目錄執行',
    install_ai_note_badge: '零終端機操作 • AI 互動引導',
    install_ai_installer_title: '跨 IDE 互動式安裝引導',
    install_ai_preview_prompt: '“請幫我從 GitHub (https://github.com/TonyLongGu/antigravity-plugins.git) 安裝 Antigravity Plugins。<br><br>請依序執行以下引導流程：<br>1. 先確認我目前使用的 IDE（Antigravity / Cursor / VS Code）。<br>2. 詢問我要安裝哪些套件（全部，或自選）。不相容目前 IDE 的套件請略過並說明原因。<br>3. 詢問本機放置目錄（預設建議 D:\\antigravity-plugins），然後 Git Clone 並掛載到該 IDE 的 extensions 目錄。<br>4. 完成後提醒重載視窗；若是 VS Code，建議完整關閉再開。”',
    git_clone_copied: '已複製 Git Clone 指令！',
    footer_issues: '問題回報 (Issues)',
    
    section_plugins_tag: '探索插件',
    section_plugins_title: '相容多款 IDE，打造多功能應用插件',
    section_plugins_desc: '即時搜尋、依分類或 IDE 過濾。每張卡片標示實際支援環境，再一鍵前往 GitHub。',
    
    footer_brand: 'VS Code Plugins',
    footer_desc: '源於 VS Code 的開源擴充套件，支援掛載到 VS Code、Antigravity、Cursor，讓 AI 協同開發更好掌控。',
    footer_quick_links: '快速導航',
    footer_resources: '生態資源',
    footer_community: '開源社群',
    footer_rights: '版權所有。以 MIT 授權條款開源發布。',
    footer_tagline: '源於 VS Code · 亦支援 Antigravity 與 Cursor',
    footer_disclaimer: '免責聲明：本專案為獨立開源社群專案，與 Google、Antigravity、Cursor 或 Microsoft / VS Code 官方無關。所有產品名稱與商標均屬其各自所有者所有。'
  },
  
  'en': {
    page_title: 'VS Code Plugins — Project plugins for AI Agent IDEs',
    brand_title: 'VS Code',
    brand_subtitle: 'PLUGINS ECOSYSTEM',
    brand_badge: 'Plugins',
    nav_home: 'Home',
    nav_explore: 'Explore Plugins',
    nav_features: 'Features',
    nav_video: 'Video Tutorials',
    nav_author: 'About Creator',
    nav_install: 'Installation',
    nav_github: 'GitHub',
    lang_btn: '繁中',
    
    hero_badge: 'Project plugins for AI Agent IDEs',
    hero_last_updated_label: 'Site Updated:',
    hero_title_1: 'Supercharge Your',
    hero_title_gradient: 'AI Pair Programming Flow',
    hero_subtitle: 'Sidebar, status bar, and context-menu tools mount into each IDE extensions folder via Windows Junction. Unsupported plugins are skipped automatically.',
    btn_explore: 'Explore 6 Plugins',
    btn_download_all_zip: 'Download All (.zip)',
    btn_watch_video: 'Watch Video Tutorial',
    btn_install_guide: 'Installation Guide',
    btn_copy_cmd: 'Copy',
    btn_copied: 'Copied!',
    
    search_placeholder: 'Search plugin name, commands, features...',
    tab_all: 'All Plugins',
    tab_sidebar: 'Sidebar Panels',
    tab_status: 'Status Bar Metrics',
    tab_explorer: 'Explorer Views',
    tab_script: 'Scripts & Toolbox',
    ide_filter_label: 'By IDE',
    tab_ide_all: 'All IDEs',
    
    btn_github_repo: 'View on GitHub ↗',
    btn_watch_tutorial: 'Video Guide',
    btn_quick_install: 'Install',
    empty_search_title: 'No Matching Plugins Found',
    empty_search_desc: 'Try different keywords, or switch category / IDE filters.',
    
    section_video_tag: 'Video Guides',
    section_video_title: 'Featured Video Walkthroughs',
    section_video_desc: 'Demos are recorded in Antigravity; Cursor / VS Code use the same sidebar and command locations.',
    video_playlist_prompt: 'Click to switch tutorial video topics & plugins:',
    ctrl_cc_title: 'Subtitles Toggle (C)',
    ctrl_play_title: 'Play / Pause (Space)',
    ctrl_mute_title: 'Mute / Unmute (M)',
    ctrl_fullscreen_title: 'Fullscreen (F)',
    copied_cmd_prefix: 'Copied command',
    copy_failed: 'Copy failed, please copy manually',
    btn_card_github_title: 'View plugin source on GitHub',
    
    section_author_tag: 'Developer Profile',
    section_author_title: 'About the Creator',
    author_name: 'Ting-Hao Liu',
    author_alias: 'TonyLongGu',
    author_badge: 'Creator & Tool Developer',
    author_bio: 'Focused on 3D animation rigging tools, pipeline automation, and companion tools for VS Code-compatible AI Agent IDEs.',
    author_email_label: 'Email',
    author_website_label: 'Portfolio Website',
    author_visit_website: 'Visit Portfolio ↗',
    author_copy_email: 'Copy',
    author_email_copied: 'Email copied to clipboard!',

    section_install_tag: 'Quick Start',
    section_install_title: 'Two Installation Methods • Seamless Setup',
    section_install_desc: 'Choose between "Download ZIP 1-Click Install" or "AI Guided Installation (Prompt-Driven)". Supports both full-suite batch install and selective individual plugin setups.',
    
    install_tab_zip: 'Method 1: Download ZIP Package',
    install_tab_zip_sub: 'No Git Required • Point & Click',
    install_tab_git: 'Method 2: AI Guided Installation',
    install_tab_git_sub: 'One-Click Prompt • AI Conversational Setup',
    
    install_zip_step1_title: 'Download Suite Package & Extract',
    install_zip_step1_desc: 'Click the button below to download the latest suite ZIP and extract it to any local directory (e.g. D:\\antigravity-plugins):',
    btn_download_zip_action: 'Download Suite (.zip)',
    
    install_submode_title: 'Run Installation Script (All or Specific)',
    install_submode_full_title: 'Install All Plugins',
    install_submode_full_desc: 'Double-click "install-all.bat" (or run install-all.ps1). The script asks which IDE to target (Antigravity / VS Code / Cursor / All) and mounts supported plugins; incompatible ones are skipped:',
    install_submode_custom_title: 'Install Specific Plugin',
    install_submode_custom_desc: 'Navigate to your desired plugin (e.g. antigravity-toolbox/), and double-click "install-extension.bat" to mount it individually:',
    install_submode_custom_code: '<plugin-folder>/install-extension.bat',
    
    install_common_step3_title: 'Reload the IDE you just installed into',
    install_common_step3_desc: 'Antigravity and Cursor: Ctrl + Shift + P → Developer: Reload Window. VS Code: fully quit and reopen so extensions.json is not overwritten on exit.',
    
    install_ai_step1_title: 'Copy AI Guided Install Prompt',
    install_ai_step1_desc: 'Click the button below to copy the structured installation prompt, embedded with GitHub repository source and conversational workflow instructions:',
    install_ai_prompt_copy_btn: 'Copy AI Installation Prompt',
    install_ai_prompt_copied: 'Prompt copied! Paste it into your current IDE AI Chat.',
    install_ai_step2_title: 'Paste into your current IDE AI Chat',
    install_ai_step2_desc: 'Open AI Chat in Cursor, Antigravity, or VS Code (e.g. Copilot Chat), paste the prompt, and send it.',
    install_ai_step3_title: 'Follow AI Guidance for Automated Setup',
    install_ai_step3_desc: 'The AI Agent will interactively verify your plugin selection and target directory, then automatically clone the repository and mount Junction links in the background:',
    install_ai_flow_q1_badge: 'Step A',
    install_ai_flow_q1_text: 'AI asks: Install 【Full Suite (6 plugins)】 or 【Selective Plugins】?',
    install_ai_flow_q2_badge: 'Step B',
    install_ai_flow_q2_text: 'AI asks: Where to clone/store the repository? (Recommended: D:\\antigravity-plugins)',
    install_ai_flow_q3_badge: 'Step C',
    install_ai_flow_q3_text: 'AI executes: Background Git Clone ➔ Create Junction Links ➔ Guides Reload Window!',
    
    install_feature_junction_title: 'Windows Junction Hot-Reload',
    install_feature_junction_desc: 'Directory Junctions mount into each IDE’s own extensions folder. Zero disk copies, edits hot-reload, and environments stay isolated.',
    install_feature_safe_title: 'Clean & Zero-Trace Uninstall',
    install_feature_safe_desc: 'Double-click "uninstall-all.bat" or "uninstall-extension.bat" in individual folders anytime for instant clean removal.',
    
    install_zip_note_badge: 'No Git Required • Extract & Use',
    install_submode_full_badge: 'Double-click to run script',
    install_submode_custom_badge: 'Run in plugin directory',
    install_ai_note_badge: 'Zero Terminal • AI Conversational',
    install_ai_installer_title: 'Cross-IDE Interactive Installer',
    install_ai_preview_prompt: '“Please help me install Antigravity Plugins from GitHub (https://github.com/TonyLongGu/antigravity-plugins.git).<br><br>Please guide me through the following interactive workflow:<br>1. Confirm which IDE I am using (Antigravity / Cursor / VS Code).<br>2. Ask which plugins to install (all, or a selection). Skip plugins that do not support this IDE and explain why.<br>3. Ask where to clone the repo (recommended: D:\\antigravity-plugins), then mount into that IDE’s extensions folder.<br>4. After install, remind me to reload the window; for VS Code, fully quit and reopen.”',
    git_clone_copied: 'Git Clone command copied!',
    footer_issues: 'Report Issues (Issues)',
    
    section_plugins_tag: 'Ecosystem Suite',
    section_plugins_title: 'Multi-IDE plugins for everyday workflows',
    section_plugins_desc: 'Search and filter by category or IDE. Each card shows real compatibility before you jump to GitHub.',
    
    footer_brand: 'VS Code Plugins',
    footer_desc: 'Open-source extensions born for VS Code, mounting on VS Code, Antigravity, and Cursor for clearer AI pair-programming control.',
    footer_quick_links: 'Quick Navigation',
    footer_resources: 'Ecosystem',
    footer_community: 'Community',
    footer_rights: 'All rights reserved. Released under MIT License.',
    footer_tagline: 'Born for VS Code · also on Antigravity & Cursor',
    footer_disclaimer: 'Disclaimer: This is an independent open-source project. It is not affiliated with Google, Antigravity, Cursor, or Microsoft / VS Code. All trademarks belong to their respective owners.'
  }
};

let currentLang = localStorage.getItem('antigravity_lang') || 'zh-TW';

function t(key) {
  return I18N[currentLang]?.[key] || I18N['zh-TW']?.[key] || key;
}

function setLanguage(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  localStorage.setItem('antigravity_lang', lang);
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = lang === 'zh-TW' ? 'zh-TW' : 'en';
  }
  updateDOMTranslations();
  if (typeof renderPlugins === 'function') {
    renderPlugins();
  }
  if (typeof initVideoShowcase === 'function') {
    initVideoShowcase(true);
  }
  if (typeof SubtitleManager !== 'undefined' && typeof currentActiveVideoId !== 'undefined') {
    SubtitleManager.load(currentActiveVideoId, lang);
  }
}

function toggleLanguage() {
  setLanguage(currentLang === 'zh-TW' ? 'en' : 'zh-TW');
}

function updateDOMTranslations() {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = currentLang === 'zh-TW' ? 'zh-TW' : 'en';
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    el.innerHTML = t(key);
  });

  document.title = t('page_title');

  const langBtn = document.getElementById('btn-lang-toggle');
  if (langBtn) {
    langBtn.textContent = currentLang === 'zh-TW' ? 'EN' : '繁中';
  }

  const playBtn = document.getElementById('ctrl-play-btn');
  if (playBtn) playBtn.setAttribute('title', t('ctrl_play_title'));

  const muteBtn = document.getElementById('ctrl-mute-btn');
  if (muteBtn) muteBtn.setAttribute('title', t('ctrl_mute_title'));

  const ccBtn = document.getElementById('ctrl-cc-btn');
  if (ccBtn) {
    ccBtn.setAttribute('title', t('ctrl_cc_title'));
  }

  const fsBtn = document.getElementById('ctrl-fullscreen-btn');
  if (fsBtn) fsBtn.setAttribute('title', t('ctrl_fullscreen_title'));

  const dateEl = document.getElementById('hero-last-updated-date');
  if (dateEl) {
    let dateStr = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.lastUpdated) ? SITE_CONFIG.lastUpdated : '';
    if (!dateStr && typeof document !== 'undefined' && document.lastModified) {
      const d = new Date(document.lastModified);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dateStr = `${y}-${m}-${day} ${hh}:${mm}`;
      }
    }
    dateEl.textContent = dateStr || '2026-09-04 21:00';
  }
}
