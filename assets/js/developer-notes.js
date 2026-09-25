/**
 * ============================================================================
 * 開發者筆記與架構心法 (Developer Notes & Architecture Philosophy)
 * ============================================================================
 * 【獨立維護文件說明】：
 * 此檔案為獨立的文章內容資料檔。日後若要修改或補充文章，
 * 直接在下方 `zh-TW`（繁中）或 `en`（英文）的 `content` 引號內編輯 Markdown 即可。
 * 網頁會自動解析標題 (#, ##, ###)、列表 (- 或 1.)、粗體 (**) 與代碼 (`)。
 * 無需改動 index.html 主結構！
 */

const DEVELOPER_NOTES_ARTICLE = {
  'zh-TW': {
    tag: '開發者筆記',
    badge: '架構心法與最佳實踐',
    readingTime: '4 分鐘閱讀',
    lastUpdated: '2026-09-25',
    title: '跨 Agent 代理架構最佳實踐：Rules、Skills 與 AI 專注力管理',
    subtitle: '解構多 IDE 規範碎片化痛點，以「教導替代限制」守護 Context Window，打造極致專注的 AI 協同開發環境。',
    content: `
### 跨 IDE 整合與通用規範、AI 專注力保護與 Token 瘦身術

不同 IDE 對於 Rules 與 Skills 的配置各持一家。為了徹底消除跨工具規則碎片化的痛點，我們開發了本套工具進行整合管理與動態應用（詳見本工具：**控制中心 / 多專案工作區、開關專案時同步全域 Skills 工具**）。

在實際的 AI 協同開發中，過多的 Rules、Skills 與 MCP 工具會嚴重分散 AI 的專注力，引發上下文漂移並消耗大量 Token。因此「不使用就應動態關閉」是維持推論精準度的核心原則：

- **在首專案內建立 \`AGENTS.md\` 作為全域規範**：不做繁瑣的條件式規範（避免不同 Harness 專屬規則各自為政），內容保持通則與精要。不論是 Antigravity、Cursor、VS Code、Codex、Cline 都能讀取。
- **具體需求改採 Skills 格式書寫（與其限制，不如教導怎麼做）**：將操作流程與專業技能放置於專案資料夾中的 \`.agents/skills\` 目錄內，使 Agent 可以檢索讀取，必要時可將引用通則書寫至 \`AGENTS.md\`。特殊低頻或私有流程，改放置在該專案的自訂目錄中，守護寶貴的 Context 空間。
- **在 IDE 中建立多專案工作區，隨需啟閉**：不同類型、任務的 Skills 建立為獨立專案置入 IDE 工作區，不使用時將其關閉，例如應用本工具「控制中心 / 多專案工作區」，可以全自動建立/移除 Windows Junction 連接。

---

### 記憶解耦與持久化：使用 Supermemory MCP 管理碎片記憶

長期協同開發中累積的零散偏好、暫時性決策或專案背景，若全部硬編碼塞進 Rules 或常態 Prompt，會嚴重侵占寶貴的 Context Window：

- **痛點**：常駐 Context 過於肥大會引發注意力漂移、推論延遲拉長與大量 Token 浪費；而完全不記錄又會導致跨會話失憶。
- **解法：引入 Supermemory MCP 管理碎片記憶**：
  - **平時零佔用，按需檢索（On-Demand Retrieval）**：將跨對話、跨專案的零碎記憶與經驗沉澱託管至 Supermemory，不污染常駐上下文。
  - **語意搜尋與動態喚醒**：當 AI 遇到相關任務需要背景知識或特定習慣時，再透過 MCP 接口動態檢索相關碎片記憶。
  - **落實守護專注力**：實現「平時零負擔、查閱有依據」的 AI 專注力保護閉環。

---

### IDE、AI Agent 選擇策略

令人玩味的比喻：AI Agent 御三家 —— Antigravity、VS Code、Cursor

![AI Agent 御三家 —— Antigravity、VS Code、Cursor](assets/images/pokemon_ide_classroom_homework_dusk_closeup.png)

本工具開發起初由 Antigravity 入門（高性價比），而後因工作需要引入 Cursor（更強的推理模型），再尋求更彈性的應用策略 VS Code（Cline、Codex），逐一收服不同屬性的 AI Agent，以此攻略各種類型的任務：

- **Cursor + Claude**：單純代碼開發
- **Cursor + Codex**：代碼開發 + 圖文
- **Antigravity**：單純文書工作
- **Antigravity + Codex**：圖文創作
- **VS Code（Cline + Codex）**：影音 + 3D 創作
`
  },

  'en': {
    tag: 'Developer Notes',
    badge: 'Architecture & Best Practices',
    readingTime: '4 min read',
    lastUpdated: '2026-09-25',
    title: 'Cross-Agent Architecture Best Practices: Rules, Skills & AI Focus',
    subtitle: 'Deconstructing cross-IDE rule fragmentation: Guide rather than restrict, defend the context window, and build an ultra-focused AI workspace.',
    content: `
### Cross-IDE Interoperability, AI Focus Protection & Token Economy

Rule and skill configurations differ significantly across various IDEs. To permanently eliminate cross-tool rule fragmentation, we engineered this suite for centralized orchestration and dynamic sync (see: **Control Center / Multi-Project Workspaces & Global Skills Sync**).

In real-world AI-assisted development, an excess of Rules, Skills, and MCP tools severely disperses AI attention, triggers context drift, and consumes massive token quotas. Adhering to the principle of "dynamically disabling inactive assets" is fundamental to maintaining peak reasoning precision:

- **Root-level \`AGENTS.md\` as Universal Baseline**: Avoid convoluted conditional harness rules (preventing fragmented rules across disparate tools). Keep instructions high-level, concise, and universal. Antigravity, Cursor, VS Code, Codex, and Cline all read it seamlessly.
- **Author Specific Needs as Skills (Guide Rather Than Restrict)**: Place procedural workflows and specialized capabilities inside \`.agents/skills\` within the project folder for on-demand retrieval by the agent, referencing universal conventions in \`AGENTS.md\` when necessary. Keep niche, low-frequency, or private workflows in custom project subdirectories to shield valuable Context space.
- **On-Demand Multi-Project Workspaces in IDE**: Organize distinct types and domain-specific skills into dedicated projects within your IDE workspace, activating or closing them as needed. With our "Control Center / Multi-Project Workspaces", Windows Junctions are created and detached fully automatically.

---

### Memory Decoupling & Persistence: Managing Fragmented Memory with Supermemory MCP

Scattered user preferences, temporary decisions, and project backstories accumulated across long-term collaborations will heavily congest the context window if hardcoded into Rules or static prompts:

- **Pain Point**: Bloated persistent context induces attention drift, stretches inference latency, and wastes token budgets, while abandoning records leads to cross-session amnesia.
- **Solution: Manage Fragmented Memories via Supermemory MCP**:
  - **Zero Idle Footprint with On-Demand Retrieval**: Offload fragmented memories and historical insights across conversations and projects to Supermemory, keeping persistent context pristine.
  - **Semantic Search & Dynamic Activation**: Dynamically query relevant memory snippets through MCP interfaces only when specific background context is needed.
  - **Guarding AI Focus**: Achieve a self-sustaining loop of "zero idle overhead, factual recall when needed."

---

### IDE & AI Agent Selection Strategy

An intriguing analogy: The "Big Three" AI Agents —— Antigravity, VS Code, and Cursor

![AI Agent "Big Three" —— Antigravity, VS Code, Cursor](assets/images/pokemon_ide_classroom_homework_dusk_closeup.png)

Our toolchain development began with Antigravity (high cost-performance ratio). Later, driven by project demands, we introduced Cursor (stronger reasoning models), and further explored flexible strategies with VS Code (Cline, Codex) — mastering distinct AI Agents one by one to conquer varied workloads:

- **Cursor + Claude**: Pure code development
- **Cursor + Codex**: Code development + text/graphics
- **Antigravity**: Pure documentation & writing
- **Antigravity + Codex**: Graphic & text creation
- **VS Code (Cline + Codex)**: Video & 3D creation
`
  }
};

if (typeof module !== 'undefined') {
  module.exports = DEVELOPER_NOTES_ARTICLE;
}
