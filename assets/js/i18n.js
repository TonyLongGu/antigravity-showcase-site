/**
 * Antigravity Plugins Showcase - i18n Localization Engine
 */
const I18N = {
  'zh-TW': {
    brand_title: 'Antigravity',
    brand_subtitle: '擴充套件生態系',
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
    
    btn_view_detail: '查看手冊與設定',
    btn_github_repo: '前往 GitHub 倉庫 ↗',
    btn_watch_tutorial: '教學影片',
    btn_quick_install: '安裝',
    empty_search_title: '查無符合的擴充套件',
    empty_search_desc: '請嘗試搜尋其他關鍵字或切換分類標籤。',
    
    section_video_tag: '影片教學',
    section_video_title: '精選影音示範與實戰教學',
    section_video_desc: '透過生動詳細的影片解說，快速掌握 Antigravity IDE 擴充套件的最佳實踐與操作技巧規定。',
    
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
    section_install_desc: '支援「下載 ZIP 點擊安裝」與「Git Clone + AI Agent 自動化協同」雙路徑，自由選擇一鍵全安裝或個別插件自選啟用。',
    
    install_tab_zip: '方式一：下載 ZIP 壓縮包',
    install_tab_zip_sub: '免 Git • 本機雙擊即用',
    install_tab_git: '方式二：Git Clone + AI Agent',
    install_tab_git_sub: '智慧協同 • 極速同步更新',
    
    install_zip_step1_title: '下載全套套件包並解壓縮',
    install_zip_step1_desc: '點擊下方按鈕下載最新版全套套件 ZIP，並解壓縮至本機任意目錄（例如 D:\\antigravity-plugins）：',
    btn_download_zip_action: '📦 下載全套插件包 (.zip)',
    
    install_submode_title: '執行安裝腳本（一鍵全安裝 或 單獨安裝）',
    install_submode_full_title: '一鍵安裝全部插件',
    install_submode_full_desc: '雙擊專案根目錄下的「雙擊一鍵安裝.bat」，腳本將自動以目前解壓目錄為路徑基底，一次性批次為 6 大擴充套件建立免編譯掛載：',
    install_submode_custom_title: '單獨安裝特定插件',
    install_common_step3_title: '重新載入 Antigravity IDE 視窗',
    install_common_step3_desc: '重新啟動 IDE，或是在 IDE 中按快捷鍵 Ctrl + Shift + P，輸入並執行 Developer: Reload Window 即可立即在側邊欄與狀態列看到全新擴充功能！',
    
    install_git_step1_title: 'Clone 專案倉庫至本地',
    install_git_step1_desc: '在終端機（PowerShell / Git Bash）執行以下指令，並在 Antigravity IDE 中開啟該專案資料夾：',
    install_git_step2_title: '在 Antigravity Chat 吩咐 AI Agent 幫您安裝',
    install_git_step2_desc: '在 Antigravity IDE 的 AI Chat 對話框輸入以下 Prompt 提示詞，AI Agent 將自動解析目錄並為您執行安裝腳本：',
    ai_prompt_1_label: '一鍵安裝全部插件',
    ai_prompt_1_text: '請幫我一鍵安裝本倉庫的所有 Antigravity 擴充套件',
    ai_prompt_2_label: '單獨安裝特定插件',
    ai_prompt_2_text: '請幫我安裝 plugins/antigravity-toolbox 控制中心擴充套件',
    ai_prompt_copy_btn: '複製 Prompt',
    ai_prompt_copied: '已複製提示詞！可直接貼到 Antigravity Chat 吩咐 AI',
    
    install_git_step3_title: '步驟 3：重載視窗與隨時同步更新',
    install_git_step3_desc: '按 Ctrl + Shift + P 執行 Developer: Reload Window 即可生效。日後本生態庫更新時，只需在終端機執行 git pull 即可隨時享受最新功能！',
    
    install_feature_junction_title: 'Windows Junction 免編譯技術',
    install_feature_junction_desc: '以原生目錄連接點掛載至 Antigravity 擴充目錄，零磁碟重複空間，修改代碼即時熱生效。',
    install_feature_safe_title: '無痕卸載安全無殘留',
    install_feature_safe_desc: '隨時雙擊「雙擊一鍵解除安裝.bat」或個別目錄下的「uninstall-extension.bat」秒級乾淨卸載。',
    
    modal_tab_features: '🌟 核心特色',
    modal_tab_commands: '⚡ 命令清單',
    modal_tab_config: '⚙️ 設定參數',
    modal_tab_install: '🚀 安裝指南',
    modal_table_cmd_name: '命令名稱',
    modal_table_cmd_id: '命令識別碼 (ID)',
    modal_table_cfg_key: '設定項目 Key',
    modal_table_cfg_type: '型別',
    modal_table_cfg_default: '預設值',
    modal_table_cfg_desc: '功能說明',
    
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
    
    btn_view_detail: 'View Docs & Config',
    btn_github_repo: 'View on GitHub ↗',
    btn_watch_tutorial: 'Video Guide',
    btn_quick_install: 'Install',
    empty_search_title: 'No Matching Plugins Found',
    empty_search_desc: 'Try searching with different keywords or switch categories.',
    
    section_video_tag: 'Video Guides',
    section_video_title: 'Featured Video Walkthroughs',
    section_video_desc: 'Master Antigravity IDE native extensions with step-by-step video tutorials and real-world workflows.',
    
    section_author_tag: 'Developer Profile',
    section_author_title: 'About the Creator',
    author_name: 'Ting-Hao Liu (劉庭豪)',
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
    section_install_desc: 'Choose between "Download ZIP 1-Click Install" or "Git Clone + AI Agent Automation". Supports both full-suite batch install and selective individual plugin setups.',
    
    install_tab_zip: 'Method 1: Download ZIP Package',
    install_tab_zip_sub: 'No Git Required • Point & Click',
    install_tab_git: 'Method 2: Git Clone + AI Agent',
    install_tab_git_sub: 'Smart Automation • Fast Sync',
    
    install_zip_step1_title: 'Download Suite Package & Extract',
    install_zip_step1_desc: 'Click the button below to download the latest suite ZIP and extract it to any local directory (e.g. D:\\antigravity-plugins):',
    btn_download_zip_action: '📦 Download Suite (.zip)',
    
    install_submode_title: 'Run Installation Script (All or Specific)',
    install_submode_full_title: 'Install All Plugins',
    install_submode_full_desc: 'Double-click "雙擊一鍵安裝.bat" in the root directory. The script automatically mounts all 6 extensions hot-reloaded with zero manual path input:',
    install_submode_custom_title: 'Install Specific Plugin',
    install_submode_custom_desc: 'Open the "plugins/" directory, navigate to your desired plugin (e.g. plugins/antigravity-toolbox), and double-click "install-extension.bat" to mount it individually:',
    
    install_common_step3_title: 'Reload Antigravity IDE Window',
    install_common_step3_desc: 'Restart the IDE, or press Ctrl + Shift + P in IDE and run "Developer: Reload Window", and all new extensions will appear immediately in your sidebar and status bar!',
    
    install_git_step1_title: 'Clone Repository to Local',
    install_git_step1_desc: 'Run the command below in terminal (PowerShell / Git Bash) and open the project directory in Antigravity IDE:',
    install_git_step2_title: 'Ask AI Agent in Chat to Install',
    install_git_step2_desc: 'Type any of the following prompt commands into Antigravity IDE Chat. The AI Agent will inspect the environment and execute the installation script for you:',
    ai_prompt_1_label: 'Install All Plugins',
    ai_prompt_1_text: 'Please help me install all Antigravity extensions in this repository',
    ai_prompt_2_label: 'Install Specific Plugin',
    ai_prompt_2_text: 'Please help me install the plugins/antigravity-toolbox extension',
    ai_prompt_copy_btn: 'Copy Prompt',
    ai_prompt_copied: 'Prompt copied! Paste it into Antigravity Chat.',
    
    install_feature_junction_title: 'Windows Junction Hot-Reload',
    install_feature_junction_desc: 'Directly mounted to Antigravity extension directory via Directory Junction. Zero disk redundancy, edits hot-reload immediately.',
    install_feature_safe_title: 'Clean & Zero-Trace Uninstall',
    install_feature_safe_desc: 'Double-click "雙擊一鍵解除安裝.bat" or "uninstall-extension.bat" in any plugin folder to remove Junction links cleanly.',
    
    modal_tab_features: '🌟 Key Features',
    modal_tab_commands: '⚡ Commands',
    modal_tab_config: '⚙️ Settings',
    modal_tab_install: '🚀 Installation',
    modal_table_cmd_name: 'Command Name',
    modal_table_cmd_id: 'Command ID',
    modal_table_cfg_key: 'Setting Key',
    modal_table_cfg_type: 'Type',
    modal_table_cfg_default: 'Default',
    modal_table_cfg_desc: 'Description',
    
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
