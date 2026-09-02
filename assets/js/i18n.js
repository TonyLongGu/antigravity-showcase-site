/**
 * Antigravity Plugins Showcase - i18n Localization Engine
 */
const I18N = {
  'zh-TW': {
    brand_title: 'Antigravity',
    brand_subtitle: '擴充套件生態系',
    nav_home: '首頁',
    nav_explore: '探索插件',
    nav_features: '核心特色',
    nav_video: '影音教學',
    nav_install: '安裝指南',
    nav_github: 'GitHub',
    lang_btn: 'EN',
    
    hero_badge: '專為 Google Antigravity IDE 打造的原生擴充套件生態系',
    hero_title_1: '極致擴展你的',
    hero_title_gradient: 'AI 協同開發體驗',
    hero_subtitle: '無縫整合 Antigravity IDE 側邊欄面板、狀態列即時監控、工作區同名修正與腳本一鍵直達，免編譯 Junction 掛載即刻生效。',
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
    
    btn_github_repo: '前往 GitHub 倉庫 ↗',
    btn_watch_tutorial: '教學影片',
    btn_quick_install: '安裝',
    empty_search_title: '查無符合的擴充套件',
    empty_search_desc: '請嘗試搜尋其他關鍵字或切換分類標籤。',
    
    section_video_tag: '影片教學',
    section_video_title: '精選影音示範與實戰教學',
    section_video_desc: '透過生動詳細的影片解說，快速掌握 Antigravity IDE 擴充套件的最佳實踐與操作技巧。',
    video_playlist_prompt: '點擊切換各主題與插件教學影片：',
    
    nav_author: '關於作者',
    section_author_tag: '開發者簡介',
    section_author_title: '關於擴充套件作者',
    author_name: '劉庭豪',
    author_alias: 'TonyLongGu',
    author_badge: '獨立開發者 / 工具創作者',
    author_bio: '專注於 3D 動畫綁定工具開發、自動化腳本管線與 Google Antigravity IDE 原生擴充生態系構建，致力於讓 AI 與開發者的協同流程達到極致流暢。',
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
    btn_download_zip_action: '📦 下載全套插件包 (.zip)',
    
    install_submode_title: '執行安裝腳本（一鍵全安裝 或 單獨安裝）',
    install_submode_full_title: '一鍵安裝全部插件',
    install_submode_full_desc: '雙擊專案根目錄下的「雙擊一鍵安裝.bat」，腳本將自動以目前解壓目錄為路徑基底，一次性批次為 6 大擴充套件建立免編譯掛載：',
    install_submode_custom_title: '單獨安裝特定插件',
    install_submode_custom_desc: '進入欲啟用的插件目錄（例如 antigravity-toolbox/），雙擊該目錄下的「install-extension.bat」即可單獨啟用：',
    install_common_step3_title: '重新載入 Antigravity IDE 視窗',
    install_common_step3_desc: '重新啟動 IDE，或是在 IDE 中按快捷鍵 Ctrl + Shift + P，輸入並執行 Developer: Reload Window 即可立即在側邊欄與狀態列看到全新擴充功能！',
    
    install_ai_step1_title: '複製 AI 智能安裝提示詞',
    install_ai_step1_desc: '點擊下方按鈕複製結構化安裝 Prompt，提示詞內建 GitHub 倉庫來源與全流程對話引導：',
    install_ai_prompt_copy_btn: '📋 複製 AI 智能安裝提示詞',
    install_ai_prompt_copied: '已複製提示詞！請直接貼到 Antigravity IDE 的 AI Chat 對話框',
    install_ai_step2_title: '貼入 Antigravity AI Chat 對話框',
    install_ai_step2_desc: '在 Antigravity IDE 任意視窗打開 AI Chat 對話框，貼上剛剛複製的提示詞並發送。',
    install_ai_step3_title: '跟隨 AI 引導並全自動安裝',
    install_ai_step3_desc: 'AI Agent 將主動向您確認安裝項目與本機目錄，隨後全自動完成 Git Clone 與軟連結掛載：',
    install_ai_flow_q1_badge: '步驟 A',
    install_ai_flow_q1_text: 'AI 主動詢問：安裝【全套 6 大插件】還是【自選特定套件】？',
    install_ai_flow_q2_badge: '步驟 B',
    install_ai_flow_q2_text: 'AI 主動詢問：希望將專案安裝在本機哪個資料夾？（預設建議 D:\\antigravity-plugins）',
    install_ai_flow_q3_badge: '步驟 C',
    install_ai_flow_q3_text: 'AI 自動執行：背景 Clone 倉庫 ➔ 建立 Junction 軟連結 ➔ 引導重載視窗即刻生效！',
    
    install_feature_junction_title: 'Windows Junction 免編譯技術',
    install_feature_junction_desc: '以原生目錄連接點掛載至 Antigravity 擴充目錄，零磁碟重複空間，修改代碼即時熱生效。',
    install_feature_safe_title: '無痕卸載安全無殘留',
    install_feature_safe_desc: '隨時雙擊「雙擊一鍵解除安裝.bat」或個別目錄下的「uninstall-extension.bat」秒級乾淨卸載。',
    
    section_plugins_tag: '探索插件',
    section_plugins_title: '全方位 Antigravity IDE 擴充套件',
    section_plugins_desc: '即時搜尋、分類過濾，探索各項專屬功能並一鍵前往 GitHub 倉庫。',
    
    footer_desc: 'Google Antigravity IDE 專屬原生擴充套件生態系，賦予 AI 輔助編程前所未有的掌控力與流暢度。',
    footer_quick_links: '快速導航',
    footer_resources: '生態資源',
    footer_community: '開源社群',
    footer_rights: '版權所有。以 MIT 授權條款開源發布。',
    footer_disclaimer: '免責聲明：本專案為獨立開源社群專案，旨在擴展 Antigravity IDE 開發體驗，與 Google 或 Antigravity 官方無關。所有產品名稱與商標均屬其各自所有者所有。'
  },
  
  'en': {
    brand_title: 'Antigravity',
    brand_subtitle: 'PLUGINS ECOSYSTEM',
    nav_home: 'Home',
    nav_explore: 'Explore Plugins',
    nav_features: 'Features',
    nav_video: 'Video Tutorials',
    nav_author: 'About Creator',
    nav_install: 'Installation',
    nav_github: 'GitHub',
    lang_btn: '繁中',
    
    hero_badge: 'Native Extension Ecosystem for Google Antigravity IDE',
    hero_title_1: 'Supercharge Your',
    hero_title_gradient: 'AI Pair Programming Flow',
    hero_subtitle: 'Seamlessly integrate Antigravity IDE sidebar webviews, real-time status bar quota metrics, workspace fixers, and 1-click script execution via hot-reloaded Junction mounts.',
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
    
    btn_github_repo: 'View on GitHub ↗',
    btn_watch_tutorial: 'Video Guide',
    btn_quick_install: 'Install',
    empty_search_title: 'No Matching Plugins Found',
    empty_search_desc: 'Try searching with different keywords or switch categories.',
    
    section_video_tag: 'Video Guides',
    section_video_title: 'Featured Video Walkthroughs',
    section_video_desc: 'Master Antigravity IDE native extensions with step-by-step video tutorials and real-world workflows.',
    video_playlist_prompt: 'Click to switch tutorial video topics & plugins:',
    
    section_author_tag: 'Developer Profile',
    section_author_title: 'About the Creator',
    author_name: 'Ting-Hao Liu',
    author_alias: 'TonyLongGu',
    author_badge: 'Creator & Tool Developer',
    author_bio: 'Focused on 3D animation rigging tools, pipeline automation, and native Google Antigravity IDE ecosystem extensions, dedicated to supercharging AI-assisted pair programming flows.',
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
    btn_download_zip_action: '📦 Download Suite (.zip)',
    
    install_submode_title: 'Run Installation Script (All or Specific)',
    install_submode_full_title: 'Install All Plugins',
    install_submode_full_desc: 'Double-click "雙擊一鍵安裝.bat" in the root directory. The script automatically mounts all 6 extensions hot-reloaded with zero manual path input:',
    install_submode_custom_title: 'Install Specific Plugin',
    install_submode_custom_desc: 'Navigate to your desired plugin (e.g. antigravity-toolbox/), and double-click "install-extension.bat" to mount it individually:',
    
    install_common_step3_title: 'Reload Antigravity IDE Window',
    install_common_step3_desc: 'Restart the IDE, or press Ctrl + Shift + P in IDE and run "Developer: Reload Window", and all new extensions will appear immediately in your sidebar and status bar!',
    
    install_ai_step1_title: 'Copy AI Guided Install Prompt',
    install_ai_step1_desc: 'Click the button below to copy the structured installation prompt, embedded with GitHub repository source and conversational workflow instructions:',
    install_ai_prompt_copy_btn: '📋 Copy AI Installation Prompt',
    install_ai_prompt_copied: 'Prompt copied! Paste it directly into Antigravity IDE AI Chat.',
    install_ai_step2_title: 'Paste into Antigravity AI Chat',
    install_ai_step2_desc: 'Open AI Chat in any Antigravity IDE workspace, paste the copied prompt and send it.',
    install_ai_step3_title: 'Follow AI Guidance for Automated Setup',
    install_ai_step3_desc: 'The AI Agent will interactively verify your plugin selection and target directory, then automatically clone the repository and mount Junction links in the background:',
    install_ai_flow_q1_badge: 'Step A',
    install_ai_flow_q1_text: 'AI asks: Install 【Full Suite (6 plugins)】 or 【Selective Plugins】?',
    install_ai_flow_q2_badge: 'Step B',
    install_ai_flow_q2_text: 'AI asks: Where to clone/store the repository? (Recommended: D:\\antigravity-plugins)',
    install_ai_flow_q3_badge: 'Step C',
    install_ai_flow_q3_text: 'AI executes: Background Git Clone ➔ Create Junction Links ➔ Guides Reload Window!',
    
    install_feature_junction_title: 'Windows Junction Hot-Reload',
    install_feature_junction_desc: 'Directly mounted to Antigravity extension directory via Directory Junction. Zero disk redundancy, edits hot-reload immediately.',
    install_feature_safe_title: 'Clean & Zero-Trace Uninstall',
    section_plugins_tag: 'Ecosystem Suite',
    section_plugins_title: 'Antigravity IDE Extension Suite',
    section_plugins_desc: 'Instant search and filtering. Explore tailored features and head straight to GitHub repositories.',
    
    footer_desc: 'Native extension suite for Google Antigravity IDE, bringing unmatched clarity and control to your AI-assisted workflow.',
    footer_quick_links: 'Quick Navigation',
    footer_resources: 'Ecosystem',
    footer_community: 'Community',
    footer_rights: 'All rights reserved. Released under MIT License.',
    footer_disclaimer: 'Disclaimer: This is an independent open-source project created to enhance the Antigravity IDE development experience. It is not affiliated with, endorsed by, or sponsored by Google or Antigravity. All trademarks belong to their respective owners.'
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
  updateDOMTranslations();
  if (typeof renderPlugins === 'function') {
    renderPlugins();
  }
  if (typeof initVideoShowcase === 'function') {
    initVideoShowcase();
  }
}

function toggleLanguage() {
  setLanguage(currentLang === 'zh-TW' ? 'en' : 'zh-TW');
}

function updateDOMTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });

  const langBtn = document.getElementById('btn-lang-toggle');
  if (langBtn) {
    langBtn.textContent = currentLang === 'zh-TW' ? 'EN' : '繁中';
  }
}
