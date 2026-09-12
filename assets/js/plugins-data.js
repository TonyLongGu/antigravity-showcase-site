/**
 * Antigravity Plugins Showcase - Detailed Plugin Database
 * All plugins map to the unified GitHub repository subfolders.
 */
const MAIN_REPO_URL = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG.githubUrl : 'https://github.com/TonyLongGu/antigravity-plugins';

// 預設/精選教學影片 (支援隨時為各套件擴充專屬影片)
const FEATURED_TUTORIAL_VIDEO = {
  title: 'Antigravity IDE 擴充套件設計理念與實戰指南',
  videoSrc: 'assets/videos/design-philosophy.mp4'
};

const PLUGINS_DATA = [
  {
    id: 'antigravity-ai-context-inspector',
    category: 'sidebar',
    version: '1.1.7',
    icon: 'assets/icons/inspector.svg?v=2',
    themeClass: 'icon-theme-purple',
    repoUrl: `${MAIN_REPO_URL}/tree/main/antigravity-ai-context-inspector`,
    cloneCmd: `git clone ${MAIN_REPO_URL}.git`,
    installCmd: 'cd antigravity-ai-context-inspector && .\\install-extension.bat',
    videoSrc: 'assets/videos/ai-context-inspector.mp4',
    name: {
      'zh-TW': 'AI 上下文檢視器 (AI Context Inspector)',
      'en': 'AI Context Inspector'
    },
    shortDesc: {
      'zh-TW': '原生側邊欄即時檢視 AI 生效上下文：精準掌握 Rules、Skills 與 MCP 工具綁定，支援即時配置掃描與歷史記憶還原。',
      'en': 'Native sidebar for real-time AI context inspection: scan active Rules, Skills, and MCP tools with historic snapshot restore and jump-to-source.'
    },
    tags: ['Webview', 'Rules & Skills', 'Brain Snapshot', 'Sidebar'],
    features: {
      'zh-TW': [
        '雙模式記憶掃描：當前環境配置即時掃描 vs 歷史對話快照還原，精準解析 transcript.jsonl 注入記憶',
        '歷史任務切換復盤：支援下拉切換歷史對話任務與復盤，完整對比各階段 Rules 與 Skills 規範生效差異',
        '一鍵直達與摘要複製：點擊直達開啟對應 .md 技能檔案，頂部支援一鍵將生效上下文複製為 Markdown 格式'
      ],
      'en': [
        'Dual Mode Memory Scanning: Live workspace config scan vs historic snapshot restore from transcript.jsonl logs',
        'Historical Task Switching: Dropdown selector for historic conversation replay and multi-stage active rule comparison',
        '1-Click Navigation & Export: Click to open referenced .md rule files directly, with 1-click Markdown context export'
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
    version: '1.1.5',
    icon: 'assets/icons/mcp.svg?v=2',
    themeClass: 'icon-theme-cyan',
    repoUrl: `${MAIN_REPO_URL}/tree/main/antigravity-mcp-manager`,
    cloneCmd: `git clone ${MAIN_REPO_URL}.git`,
    installCmd: 'cd antigravity-mcp-manager && .\\install-extension.bat',
    videoSrc: 'assets/videos/mcp-manager.mp4',
    name: {
      'zh-TW': 'Antigravity MCP 管理儀表板 (MCP Manager)',
      'en': 'Antigravity MCP Manager Dashboard'
    },
    shortDesc: {
      'zh-TW': '原生側邊欄全域 MCP 伺服器儀表板：提供視覺化單項與批次開關、CLI 進程探針測速、狀態列常駐指示與熱監聽備份。',
      'en': 'Native sidebar dashboard for global MCP server management: visual batch toggles, CLI process probes, status bar live counter, and auto-backups.'
    },
    tags: ['Webview', 'MCP Control', 'Probe Ping', 'Status Bar'],
    features: {
      'zh-TW': [
        '全域伺服器視覺管理：無縫嵌入左側活動列，專注維護 ~/.gemini/config 配置，支援視覺化單項與批次開關',
        '進程探針與延遲測速：內建 CLI 進程探針（支援 JSON-RPC ping 與進程樹回收）以及 HTTP/SSE 測速',
        '狀態指示與熱重載監聽：底部狀態列常駐顯示啟用計數（如 ⚡ MCP: 1/9），支援配置自動備份與檔案熱監聽'
      ],
      'en': [
        'Global Server Management: Embedded into Activity Bar to manage ~/.gemini/config with visual single/batch toggles',
        'Process Probe & Latency Test: CLI probe supporting JSON-RPC ping and process tree recycling, plus HTTP/SSE speed tests',
        'Status Bar Counter & Live Watcher: Real-time status bar count (⚡ MCP: 1/9) with automatic .bak backup and file watcher'
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
    version: '1.2.5',
    icon: 'assets/icons/quick-access.svg?v=2',
    themeClass: 'icon-theme-emerald',
    repoUrl: `${MAIN_REPO_URL}/tree/main/antigravity-quick-access`,
    cloneCmd: `git clone ${MAIN_REPO_URL}.git`,
    installCmd: 'cd antigravity-quick-access && .\\install-extension.bat',
    videoSrc: 'assets/videos/quick-access.mp4',
    name: {
      'zh-TW': '常用捷徑與暫存清單 (Quick Access)',
      'en': 'Quick Access & Scratchpad'
    },
    shortDesc: {
      'zh-TW': '檔案總管專屬快速存取視窗：支援檔案與資料夾雙分組暫存、滑鼠拖曳引用至 Chat 對話框、多選批次與原地層級展開。',
      'en': 'Dedicated Explorer quick access & scratchpad view: dual-group pinning, drag-and-drop Chat mentions, multi-select, and in-place tree expansion.'
    },
    tags: ['Explorer View', 'Drag & Drop', 'Chat Mention', 'Multi-Select'],
    features: {
      'zh-TW': [
        '雙分組獨立暫存視圖：常駐檔案總管側邊欄，提供常規釘選 (Pinned) 與臨時暫存 (Scratchpad) 雙軌管理',
        '滑鼠拖曳對話框引用：支援單選或多選檔案直接拖入 Antigravity Chat 對話框，自動轉化為 @檔案 引用',
        '多選批次與原地目錄展開：支援 Ctrl/Shift 複選批次切換釘選、資料夾原地展開子層級並獨立釘選內部檔案'
      ],
      'en': [
        'Dual-Group Tree View: Resident Explorer sidebar panel providing Pinned items and temporary Scratchpad workspaces',
        'Drag & Drop Chat Mentions: Drag single or multi-selected files into Antigravity Chat box for instant @file references',
        'Multi-Select & In-Place Expansion: Ctrl/Shift batch actions, in-place directory expansion, and independent child item pinning'
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
    version: '1.0.4',
    icon: 'assets/icons/quota-status.svg?v=2',
    themeClass: 'icon-theme-amber',
    repoUrl: `${MAIN_REPO_URL}/tree/main/antigravity-quota-status`,
    cloneCmd: `git clone ${MAIN_REPO_URL}.git`,
    installCmd: 'cd antigravity-quota-status && .\\install-extension.bat',
    videoSrc: 'assets/videos/quota-status.mp4',
    name: {
      'zh-TW': 'AI 模型額度狀態監控 (Quota Status)',
      'en': 'AI Model Quota Status Monitor'
    },
    shortDesc: {
      'zh-TW': '狀態列極簡純文字 AI 配額監控：常駐顯示 Gemini 與 Claude 每週與 5 小時額度，獨家勻速消耗偏差值演算與倒數。',
      'en': 'Ultra-compact plain-text status bar monitor: tracks weekly and 5-hour AI quotas with unique linear consumption deviation and countdowns.'
    },
    tags: ['Status Bar', 'Quota Algorithm', 'Countdown', 'QuickPick'],
    features: {
      'zh-TW': [
        '極致乾淨純文字狀態列：預設極簡雙欄 (59%, 53% | 7%, 100%)，零 Emoji、零干擾，原生無縫融合底部',
        '獨家消耗偏差值演算：以 168 小時勻速消耗模型動態計算「建議今日餘額」，即時呈現進度結餘或超支偏差數值',
        '詳細懸浮提示與快捷選單：懸停即覽日時分重置倒數，點擊 QuickPick 彈出選單切換顯示模式與自訂警示底色'
      ],
      'en': [
        'Ultra-Clean Plain Text Bar: Compact dual-column (59%, 53% | 7%, 100%) with zero Emoji and noise, seamlessly embedded',
        'Linear Consumption Deviation: Dynamically calculates daily safe allowance and surplus/deficit deviations based on 168h models',
        'Rich Tooltip & QuickPick Menu: Precise D/H/M reset countdowns on hover, and QuickPick menu for format toggles and alert colors'
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
    version: '1.6.1',
    icon: 'assets/icons/script-runner.svg?v=2',
    themeClass: 'icon-theme-lime',
    repoUrl: `${MAIN_REPO_URL}/tree/main/antigravity-script-runner`,
    cloneCmd: `git clone ${MAIN_REPO_URL}.git`,
    installCmd: 'cd antigravity-script-runner && .\\install-extension.bat',
    videoSrc: 'assets/videos/script-runner.mp4',
    name: {
      'zh-TW': '腳本右鍵執行工具 (Script Runner)',
      'en': 'Context Script Runner'
    },
    shortDesc: {
      'zh-TW': '檔案總管與編輯器右鍵直達：一鍵執行 Python、PowerShell 與批次檔（支援管理員提權），並內建圖片、聲音與影片資料夾高效能檢視工具。',
      'en': 'Context menu & editor 1-click runner for Python, PowerShell, and Batch (with Admin UAC), plus high-performance folder Image, Audio, and Video viewers.'
    },
    tags: ['Context Menu', 'Media Viewer', 'PowerShell Bypass', 'UAC Admin'],
    features: {
      'zh-TW': [
        '多語言腳本執行：檔案總管右鍵與編輯器右上角 ▶ 一鍵執行 Python、PowerShell（自動 Bypass）與批次檔，支援 UAC 提權',
        '資料夾圖片檢視工具：4.5x 右鍵抓手滾動、游標錨點無損縮放 (Cursor-Anchored Zoom)、全域指針鎖定與右鍵/Esc 極速退出',
        '資料夾聲音與影片檢視工具：懸停預覽試聽、Web Audio API 動態霓虹頻譜、高性能解耦 Seek 尋道播放器（杜絕解碼死鎖）'
      ],
      'en': [
        'Multi-Language Script Runner: Explorer context menu & Editor ▶ button for Python, PowerShell (auto Bypass), and Batch with UAC Admin elevation',
        'Folder Image Viewer: 4.5x right-click hand scrolling, cursor-anchored zoom lightbox, global pointer capture, and instant right-click/Esc exit',
        'Folder Audio & Video Viewers: Hover preview, Web Audio API dynamic neon spectrum visualizer, and high-performance decoupled seek player'
      ]
    },
    commands: [
      { id: 'scriptRunner.viewFolderImages', name: '檢視圖片 (View Images)' },
      { id: 'scriptRunner.viewFolderAudios', name: '檢視聲音 (View Audio)' },
      { id: 'scriptRunner.viewFolderVideos', name: '檢視影片 (View Videos)' },
      { id: 'scriptRunner.runPy', name: '執行 Python 腳本 (Run Python)' },
      { id: 'scriptRunner.runPs1', name: '執行 PowerShell 腳本 (Run PowerShell)' },
      { id: 'scriptRunner.runPs1Admin', name: '執行 PowerShell 腳本 (系統管理員) (Run PowerShell Admin)' },
      { id: 'scriptRunner.runBat', name: '執行批次檔 (Run Batch Script)' },
      { id: 'scriptRunner.runBatAdmin', name: '執行批次檔 (系統管理員) (Run Batch File Admin)' }
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
    version: '1.3.5',
    icon: 'assets/icons/toolbox.svg?v=2',
    themeClass: 'icon-theme-indigo',
    repoUrl: `${MAIN_REPO_URL}/tree/main/antigravity-toolbox`,
    cloneCmd: `git clone ${MAIN_REPO_URL}.git`,
    installCmd: 'cd antigravity-toolbox && .\\install-extension.bat',
    videoSrc: 'assets/videos/toolbox.mp4',
    name: {
      'zh-TW': 'Antigravity 控制中心 (Toolbox)',
      'en': 'Antigravity Control Center (Toolbox)'
    },
    shortDesc: {
      'zh-TW': '側邊欄多功能控制中心：提供工作區同名專案修正、專案腳本聯動排序執行器、全域自訂設定直達捷徑與 Brain 快取清理。',
      'en': 'Sidebar multi-tool control center: workspace duplicate name fixer, linked project script runner, global config shortcuts, and Brain cache cleaner.'
    },
    tags: ['Sidebar Panel', 'Workspace Fixer', 'Brain Cleaner', 'Global Config'],
    features: {
      'zh-TW': [
        '多專案工作區與同名修正：智慧標記 .code-workspace 同名衝突，一鍵自動補齊父層路徑前綴維持命名一致性',
        '專案腳本聯動排序執行器：檔案總管右鍵快速加入腳本，隨工作區專案排序動態聯動次序，支援一般與管理員提權執行',
        '全域目錄直達與記憶庫清理：一鍵直達 ~/.gemini 自訂目錄與過濾開關，提供動態時間滑桿安全釋放對話快取'
      ],
      'en': [
        'Multi-Project Workspace Fixer: Auto-detects .code-workspace name collisions and applies parent folder prefixes in 1-click',
        'Project Script Dynamic Runner: Right-click add scripts with workspace-linked dynamic sorting, supporting normal and Admin execution',
        'Global Shortcuts & Brain Cleaner: 1-Click access to ~/.gemini configs, Explorer filter toggles, and dynamic Brain cache cleanup'
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
    videoSrc: 'assets/videos/design-philosophy.mp4'
  },
  ...PLUGINS_DATA
];

