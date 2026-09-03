/**
 * Antigravity Plugins Showcase - Detailed Plugin Database
 * All plugins map to the unified GitHub repository subfolders.
 */
const MAIN_REPO_URL = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG.githubUrl : 'https://github.com/TonyLongGu/antigravity-plugins';

// 預設/精選教學影片 (支援隨時為各套件擴充專屬影片)
const FEATURED_TUTORIAL_VIDEO = {
  title: 'Antigravity IDE 擴充套件設計理念與實戰指南',
  url: 'https://youtu.be/HSYWa4WkBe0',
  embedUrl: 'https://www.youtube.com/embed/HSYWa4WkBe0'
};

const PLUGINS_DATA = [
  {
    id: 'antigravity-ai-context-inspector',
    category: 'sidebar',
    version: '1.1.1',
    icon: 'assets/icons/inspector.svg?v=2',
    themeClass: 'icon-theme-purple',
    repoUrl: `${MAIN_REPO_URL}/tree/main/antigravity-ai-context-inspector`,
    cloneCmd: `git clone ${MAIN_REPO_URL}.git`,
    installCmd: 'cd antigravity-ai-context-inspector && .\\install-extension.bat',
    videoSrc: 'assets/videos/ai-context-inspector.mp4',
    videoUrl: 'https://youtu.be/LbbEhPD-LE0',
    videoEmbedUrl: 'https://www.youtube.com/embed/LbbEhPD-LE0',
    name: {
      'zh-TW': 'AI 上下文檢視器 (AI Context Inspector)',
      'en': 'AI Context Inspector'
    },
    shortDesc: {
      'zh-TW': '即時檢視每次對話 AI 載入之 Rules、Skills、MCP API 與工作區綁定狀態，支援即時配置掃描與對話快照歷史還原。',
      'en': 'Inspect active Rules, Skills, MCP APIs, and Workspace bindings injected into AI context with real-time scanning and conversation snapshot restore.'
    },
    tags: ['Webview', 'Rules & Skills', 'Brain Snapshot', 'Sidebar'],
    features: {
      'zh-TW': [
        '雙模式切換：當前環境配置掃描 vs 歷史對話快照還原',
        '精準解析 transcript.jsonl，100% 還原該次對話注入的完整記憶',
        '一鍵跳轉開啟：點擊項目直達對應的 .md 規範或技能檔案',
        '即時過濾搜尋與一鍵複製整份生效上下文為 Markdown 格式'
      ],
      'en': [
        'Dual Mode: Active Environment Scan vs Historic Conversation Snapshot Restore',
        'Accurately parses transcript.jsonl to reconstruct exact injected memory context',
        '1-Click jump to open referenced .md rule and skill files directly in editor',
        'Live search filtering and 1-click Markdown context export to clipboard'
      ]
    },
    commands: [
      { id: 'antigravity.aiContext.refresh', name: '重新整理 AI 上下文 (Refresh Context)' },
      { id: 'antigravity.aiContext.focusView', name: '聚焦 AI 上下文檢視器 (Focus View)' }
    ],
    configurations: []
  },
  {
    id: 'antigravity-mcp-manager',
    category: 'sidebar',
    version: '1.1.1',
    icon: 'assets/icons/mcp.svg?v=2',
    themeClass: 'icon-theme-cyan',
    repoUrl: `${MAIN_REPO_URL}/tree/main/antigravity-mcp-manager`,
    cloneCmd: `git clone ${MAIN_REPO_URL}.git`,
    installCmd: 'cd antigravity-mcp-manager && .\\install-extension.bat',
    videoSrc: 'assets/videos/mcp-manager.mp4',
    videoUrl: 'https://youtu.be/zJDDg9SsjQI',
    videoEmbedUrl: 'https://www.youtube.com/embed/zJDDg9SsjQI',
    name: {
      'zh-TW': 'Antigravity MCP 管理儀表板 (MCP Manager)',
      'en': 'Antigravity MCP Manager Dashboard'
    },
    shortDesc: {
      'zh-TW': '原生 MCP 伺服器視覺化管理、單項/批次開關控制、CLI 進程探針與 HTTP/SSE 即時連線測速側邊欄。',
      'en': 'Native sidebar for visual MCP server management, batch toggle controls, CLI process probing, and HTTP/SSE latency testing.'
    },
    tags: ['Webview', 'MCP Control', 'Probe Ping', 'Status Bar'],
    features: {
      'zh-TW': [
        '無縫嵌入 IDE 左側活動列，專注管理 ~/.gemini/config/mcp_config.json',
        'CLI 進程探針（支援 JSON-RPC ping 與 Windows 進程樹安全回收）與遠端測速',
        '底部狀態列常駐顯示即時啟用計數（如 ⚡ MCP: 1/9）',
        '支援配置自動備份（.bak）與外部檔案變更即時熱監聽（File Watcher）'
      ],
      'en': [
        'Native Activity Bar integration for managing ~/.gemini/config/mcp_config.json',
        'CLI Process Probe with JSON-RPC ping, process tree recycling, and SSE latency tests',
        'Status bar live counter indicator (e.g. ⚡ MCP: 1/9)',
        'Automatic config backups (.bak) and real-time external file change watcher'
      ]
    },
    commands: [
      { id: 'antigravity.mcp.refresh', name: '重新載入 MCP 設定 (Reload MCP Config)' },
      { id: 'antigravity.mcp.focusView', name: '聚焦 MCP 側邊欄面板 (Focus View)' }
    ],
    configurations: []
  },
  {
    id: 'antigravity-quick-access',
    category: 'explorer',
    version: '1.2.0',
    icon: 'assets/icons/quick-access.svg?v=2',
    themeClass: 'icon-theme-emerald',
    repoUrl: `${MAIN_REPO_URL}/tree/main/antigravity-quick-access`,
    cloneCmd: `git clone ${MAIN_REPO_URL}.git`,
    installCmd: 'cd antigravity-quick-access && .\\install-extension.bat',
    videoSrc: 'assets/videos/quick-access.mp4',
    videoUrl: 'https://youtu.be/7sCUQ5e8VEE',
    videoEmbedUrl: 'https://www.youtube.com/embed/7sCUQ5e8VEE',
    name: {
      'zh-TW': '常用捷徑與暫存清單 (Quick Access)',
      'en': 'Quick Access & Scratchpad'
    },
    shortDesc: {
      'zh-TW': '檔案總管專屬快速存取與暫存視窗：支援滑鼠拖曳引用至 Chat 對話框、多選批次操作與雙擊快速開啟。',
      'en': 'Dedicated Explorer quick access & scratchpad view: drag-and-drop to Chat inputs, multi-select batch actions, and tree browsing.'
    },
    tags: ['Explorer View', 'Drag & Drop', 'Chat Mention', 'Multi-Select'],
    features: {
      'zh-TW': [
        '檔案總管獨立視圖：雙分組管理（常規釘選 Pinned 與 臨時暫存 Scratchpad）',
        '滑鼠拖曳支援：直接拖入 Chat 對話框自動轉化為 @檔案 或絕對路徑引用',
        '多選與批次操作：支援 Ctrl / Shift 複選，一鍵批次切換釘選或移除',
        '資料夾原地展開：直接展開子層級目錄，無須在深層目錄反覆翻找'
      ],
      'en': [
        'Explorer native tree view: Dual grouping (Pinned items & temporary Scratchpad)',
        'Drag & Drop integration: drag files into Chat prompt box for instant @file references',
        'Multi-Select & batch actions: Ctrl / Shift selection for batch toggle and removal',
        'In-place folder expansion: explore sub-folders without scrolling the main tree'
      ]
    },
    commands: [
      { id: 'antigravity.quickAccess.add', name: '加入暫存清單 (Add to Scratchpad)' },
      { id: 'antigravity.quickAccess.addPinned', name: '加入常規釘選 (Add to Pinned)' },
      { id: 'antigravity.quickAccess.addActive', name: '加入目前開啟檔案 (Add Active File)' },
      { id: 'antigravity.quickAccess.clearScratchpad', name: '清空臨時暫存 (Clear Scratchpad)' },
      { id: 'antigravity.quickAccess.togglePin', name: '切換 釘選 / 臨時 (Toggle Pin)' },
      { id: 'antigravity.quickAccess.remove', name: '從清單移除 (Remove Item)' }
    ],
    configurations: []
  },
  {
    id: 'antigravity-quota-status',
    category: 'status',
    version: '1.0.1',
    icon: 'assets/icons/quota-status.svg?v=2',
    themeClass: 'icon-theme-amber',
    repoUrl: `${MAIN_REPO_URL}/tree/main/antigravity-quota-status`,
    cloneCmd: `git clone ${MAIN_REPO_URL}.git`,
    installCmd: 'cd antigravity-quota-status && .\\install-extension.bat',
    videoSrc: 'assets/videos/quota-status.mp4',
    videoUrl: 'https://youtu.be/NLgUHA1G-Kw',
    videoEmbedUrl: 'https://www.youtube.com/embed/NLgUHA1G-Kw',
    name: {
      'zh-TW': 'AI 模型額度狀態監控 (Quota Status)',
      'en': 'AI Model Quota Status Monitor'
    },
    shortDesc: {
      'zh-TW': '狀態列極致簡約純文字監控：常駐顯示 Gemini 與 Claude 模型每週與 5 小時剩餘額度、重置倒數與消耗偏差值。',
      'en': 'Ultra-compact plain-text status bar monitor: tracks weekly and 5-hour quota, reset countdowns, and consumption deviation algorithms.'
    },
    tags: ['Status Bar', 'Quota Algorithm', 'Countdown', 'QuickPick'],
    features: {
      'zh-TW': [
        '極致乾淨狀態列：預設極簡雙欄 (59%, 53% | 7%, 100%)，零 Emoji、零干擾',
        '獨家消耗偏差值演算：以 168 小時勻速模型計算「建議今日餘額」與正負偏差值',
        '豐富 Tooltip 懸浮提示：完整列出日時分重置倒數、模型分類與檢查時間',
        '點擊 QuickPick 彈出選單：快速切換顯示格式、自訂背景色彩與自動刷新間隔'
      ],
      'en': [
        'Ultra-clean status bar: Compact dual-column (59%, 53% | 7%, 100%) with zero noise',
        'Unique Deviation Algorithm: Calculates theoretical safe allowance and deficit/surplus',
        'Rich Hover Tooltip: Lists precise reset countdowns (D/H/M) and detailed model tiers',
        'Interactive QuickPick Menu: Fast format toggle, background colors, and refresh timers'
      ]
    },
    commands: [
      { id: 'aiQuota.refresh', name: '重新整理 AI 模型額度 (Refresh Quotas)' },
      { id: 'aiQuota.showMenu', name: '開啟 AI 模型額度選單 (Show Menu)' },
      { id: 'aiQuota.toggleDisplayMode', name: '切換狀態列顯示模式 (Toggle Display Mode)' },
      { id: 'aiQuota.setBackgroundColor', name: '設定狀態列背景樣式 (Set Background Color)' },
      { id: 'aiQuota.setRefreshInterval', name: '設定背景檢查間隔 (Set Refresh Interval)' }
    ],
    configurations: [
      {
        key: 'aiQuota.displayMode',
        type: 'string',
        default: 'compact',
        desc: {
          'zh-TW': '狀態列文字顯示格式 (compact: 極簡雙欄, standard: 標準模式)',
          'en': 'Status bar format (compact or standard)'
        }
      },
      {
        key: 'aiQuota.backgroundColor',
        type: 'string',
        default: 'default',
        desc: {
          'zh-TW': '狀態列項目背景色彩 (default / warning / error)',
          'en': 'Status bar item background style'
        }
      },
      {
        key: 'aiQuota.refreshIntervalMinutes',
        type: 'number',
        default: '5',
        desc: {
          'zh-TW': '背景自動刷新額度之間隔分鐘數 (設為 0 則關閉自動刷新)',
          'en': 'Background refresh interval in minutes (0 to disable)'
        }
      }
    ]
  },
  {
    id: 'antigravity-script-runner',
    category: 'script',
    version: '1.2.0',
    icon: 'assets/icons/script-runner.svg?v=2',
    themeClass: 'icon-theme-lime',
    repoUrl: `${MAIN_REPO_URL}/tree/main/antigravity-script-runner`,
    cloneCmd: `git clone ${MAIN_REPO_URL}.git`,
    installCmd: 'cd antigravity-script-runner && .\\install-extension.bat',
    videoSrc: 'assets/videos/script-runner.mp4',
    videoUrl: 'https://youtu.be/ibyt48Tulu4',
    videoEmbedUrl: 'https://www.youtube.com/embed/ibyt48Tulu4',
    name: {
      'zh-TW': '腳本右鍵執行工具 (Script Runner)',
      'en': 'Context Script Runner'
    },
    shortDesc: {
      'zh-TW': '檔案總管與編輯器右鍵選單直達：一鍵以專屬終端機或管理員提權視窗執行 .py、.ps1、.bat、.cmd 腳本。',
      'en': 'Context menu & editor play button runner: 1-click execution for .py, .ps1, .bat, and .cmd with terminal or Admin UAC elevation.'
    },
    tags: ['Context Menu', 'PowerShell Bypass', 'UAC Admin', 'Python/Batch'],
    features: {
      'zh-TW': [
        '支援三大多元格式：Python (.py)、PowerShell (.ps1)、批次檔 (.bat / .cmd)',
        '雙入口操作：檔案總管右鍵選單 ＋ 程式碼編輯器右上角專屬 ▶ 播放按鈕',
        '安全權限繞過：PowerShell 腳本自動附帶 -ExecutionPolicy Bypass 執行',
        '管理員提權選項：可切換以 Windows UAC 系統管理員獨立視窗執行並保持開啟'
      ],
      'en': [
        'Supports 3 major script types: Python (.py), PowerShell (.ps1), Batch (.bat/.cmd)',
        'Dual Entrypoints: Explorer right-click context menu + Editor top-right ▶ play button',
        'Automatic execution policy bypass: seamlessly runs .ps1 scripts without terminal errors',
        'UAC Elevation Support: configurable Administrator window mode with auto-keep-open'
      ]
    },
    commands: [
      { id: 'scriptRunner.runPy', name: '執行 Python 腳本 (Run Python)' },
      { id: 'scriptRunner.runPs1', name: '執行 PowerShell 腳本 (Run PowerShell)' },
      { id: 'scriptRunner.runBat', name: '執行批次檔 (Run Batch Script)' }
    ],
    configurations: [
      {
        key: 'scriptRunner.runAsAdmin',
        type: 'boolean',
        default: 'true',
        desc: {
          'zh-TW': '是否預設以系統管理員身分 (Administrator) 提權獨立視窗執行',
          'en': 'Whether to run scripts as Administrator in elevated window'
        }
      },
      {
        key: 'scriptRunner.keepWindowOpen',
        type: 'boolean',
        default: 'true',
        desc: {
          'zh-TW': '以管理員身分執行時，是否在腳本執行完畢後保持視窗以供檢視輸出',
          'en': 'Keep window open after execution finishes to review logs'
        }
      }
    ]
  },
  {
    id: 'antigravity-toolbox',
    category: 'script',
    version: '1.3.1',
    icon: 'assets/icons/toolbox.svg?v=2',
    themeClass: 'icon-theme-indigo',
    repoUrl: `${MAIN_REPO_URL}/tree/main/antigravity-toolbox`,
    cloneCmd: `git clone ${MAIN_REPO_URL}.git`,
    installCmd: 'cd antigravity-toolbox && .\\install-extension.bat',
    videoSrc: 'assets/videos/toolbox.mp4',
    videoUrl: 'https://youtu.be/OSNrBl1BBCo',
    videoEmbedUrl: 'https://www.youtube.com/embed/OSNrBl1BBCo',
    name: {
      'zh-TW': 'Antigravity 控制中心 (Toolbox)',
      'en': 'Antigravity Control Center (Toolbox)'
    },
    shortDesc: {
      'zh-TW': '側邊欄多功能控制中心：多專案工作區同名修正、專案腳本執行器、全域設定直達捷徑與 Brain 歷史快取清理。',
      'en': 'Sidebar control center: workspace duplicate name fixer, project script runner, global config shortcuts, and Brain cache cleaner.'
    },
    tags: ['Sidebar Panel', 'Workspace Fixer', 'Brain Cleaner', 'Global Config'],
    features: {
      'zh-TW': [
        '多專案工作區管理：智慧偵測 .code-workspace 同名專案，一鍵自動修復名稱衝突',
        '專案腳本執行器：右鍵快速加入腳本，並隨工作區專案排序動態聯動排列',
        '全域自訂目錄直達：一鍵開啟 ~/.gemini/config 根目錄、Rules、Skills 與 Plugins',
        'Brain 對話記憶清理：動態調整時間週期（2~4個月），安全釋放對話快取容量'
      ],
      'en': [
        'Multi-root Workspace Manager: auto-detects name collisions and fixes them in 1-click',
        'Project Script Runner: add scripts from Explorer with workspace-linked dynamic sorting',
        'Global Config Shortcuts: instant navigation to ~/.gemini/config, Rules, Skills & Plugins',
        'Brain Cache Cleaner: dynamic age slider (2-4 months) for safe storage reclamation'
      ]
    },
    commands: [
      { id: 'antigravity.toolbox.refresh', name: '重新整理工作區狀態 (Refresh Workspace)' },
      { id: 'antigravity.toolbox.fixWorkspace', name: '自動修正工作區同名專案名稱 (Fix Workspace Names)' },
      { id: 'antigravity.toolbox.resetWorkspace', name: '重設工作區為預設名稱 (Reset Workspace Names)' },
      { id: 'antigravity.toolbox.openSettings', name: '開啟 settings.json (Open Settings)' },
      { id: 'antigravity.toolbox.addScriptToRunner', name: '加入至專案腳本執行器 (Add to Runner)' },
      { id: 'antigravity.toolbox.focusView', name: '聚焦控制中心側邊欄 (Focus View)' }
    ],
    configurations: []
  }
];
 
// 影片教學播放清單（排在第一位的「設計理念」+ 各大套件實戰教學）
const TUTORIAL_VIDEOS = [
  {
    id: 'antigravity-design-philosophy',
    name: {
      'zh-TW': '設計理念 (Design Philosophy)',
      'en': 'Design Philosophy'
    },
    shortDesc: {
      'zh-TW': '深入解析 Antigravity 原生擴充套件架構思維：極致簡約、原生無縫融合與高效率 AI 協同開發實戰哲學。',
      'en': 'In-depth breakdown of Antigravity native extensions philosophy: minimal footprint, seamless IDE integration, and AI-driven workflows.'
    },
    icon: 'assets/icons/philosophy.svg?v=2',
    videoSrc: 'assets/videos/design-philosophy.mp4',
    videoUrl: 'https://youtu.be/HSYWa4WkBe0',
    videoEmbedUrl: 'https://www.youtube.com/embed/HSYWa4WkBe0'
  },
  ...PLUGINS_DATA
];

