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
    readingTime: '3 分鐘閱讀',
    lastUpdated: '2026-09-21',
    title: '跨 Agent 代理架構最佳實踐：Rules、Skills 與 AI 專注力管理',
    subtitle: '解構多 IDE 規範碎片化痛點，以「教導替代限制」守護 Context Window，打造極致專注的 AI 協同開發環境。',
    content: `
### 跨 IDE 整合與通用規範：以教導取代限制

現代 IDE 具有檔案總管、內容區與 AI Agent 對話區，是非常理想的工作配置。然而，不同 IDE 對於 Rules 與 Skills 的配置各持一家，延伸模組（如 Codex、Cline）的配置規範也大不相同。為了徹底消除跨工具規則碎片化的痛點，我們開發了本套工具進行整合管理與動態應用（詳見本工具：**控制中心 / 多專案工作區、開關專案時同步全域 Skills 工具**）。

為了提升跨 Agent 代理架構的通用性與穩定度：
- **以首專案 \`AGENTS.md\` 作為全域規範**：不做繁瑣的條件式規範（避免不同 Harness 專屬規則各持一家很繁雜），內容保持通則與精要。不論是 Google Antigravity、Cursor 還是 VS Code 都能直接讀取。
- **具體需求改採 Skills 格式書寫（與其限制，不如教導怎麼做）**：將操作流程與專業技能放置於專案資料夾中的 \`.agents/skills\` 目錄內，需要時才由 Agent 按需檢索讀取，必要時可將引用通則書寫至 \`AGENTS.md\`。
- **NTFS Junction 跨工具映射**：針對仰賴全域路徑讀取 Skills 的 IDE 延伸模組（如 Codex、Cline），使用本工具「控制中心 / 多專案工作區」，可以全自動建立 Windows Junction 連接點映射到相對專案目錄供其使用。

---

### AI 專注力保護與 Token 瘦身術

在實際的 AI 協同開發中，過多的 Rules、Skills 與 MCP 工具會嚴重分散 AI 的專注力，引發上下文漂移並消耗大量 Token。因此「不使用就應動態關閉」是維持推論精準度的核心原則：

1. **在首專案內建立 \`AGENTS.md\` 作為全域底線**：Antigravity、Cursor、VS Code、Codex、Cline 都讀得到，內容保持精簡通則（規範語言、底線安全與溝通原則即可）。
2. **在 IDE 中建立多專案工作區，隨需啟閉**：每個專案各自放置相對應的 Skills。不使用該專案時將其關閉，控制中心會同步解除全域 Junction 映射，避免無關專案干擾當前任務。
3. **雙軌存放策略（避免非必要自動檢索）**：
   - **高頻通用 Skills**：放置於 \`.agents/skills\`（例如：下載安裝 ComfyUI 工作流 Skill）。
   - **特殊低頻或私有流程**：不是一定要給 Agent 隨時閱讀的內容（例如特殊任務工作流的 Skill），改放置在該專案的自訂目錄中，不給 AI 在初始化時預先檢索的機會，守護寶貴的 Context 空間。
`
  },

  'en': {
    tag: 'Developer Notes',
    badge: 'Architecture & Best Practices',
    readingTime: '3 min read',
    lastUpdated: '2026-09-21',
    title: 'Cross-Agent Architecture Best Practices: Rules, Skills & AI Focus',
    subtitle: 'Deconstructing cross-IDE rule fragmentation: Guide rather than restrict, defend the context window, and build an ultra-focused AI workspace.',
    content: `
### Cross-IDE Integration & Universal Standards: Guide Rather Than Restrict

Modern IDEs unite a file explorer, editor canvas, and AI agent chat—providing an ideal configuration for modern development. However, rule and skill management differs significantly across IDEs, and extensions such as Codex and Cline each demand separate specifications. To permanently solve this rule fragmentation, we built this suite to provide centralized management and dynamic sync (see: **Antigravity Toolbox / Workspace Manager & Global Skills Sync**).

To maximize architectural interoperability and reliability across AI agents:
- **Root-level \`AGENTS.md\` as the Single Source of Truth**: Avoid convoluted conditional harness rules. Keep instructions concise, universal, and high-level. Antigravity, Cursor, and VS Code read it natively.
- **Workflow-oriented Skills (Guide Rather Than Restrict)**: Author detailed workflows as Skills located inside \`.agents/skills\`. Rather than over-restricting LLMs through rigid negative constraints, proactively teach them procedural execution on demand, referencing universal rules in \`AGENTS.md\` only when necessary.
- **NTFS Junction Mapping for Global Extensions**: For extensions that depend on global paths (such as Codex and Cline), the Antigravity Toolbox automatically creates NTFS Junctions mapped to active project workspace paths.

---

### AI Focus Protection & Token Economy

In everyday AI-native development, bloating the context window with inactive Rules, Skills, and MCP servers severely disperses model attention, causes instruction drift, and drains token quotas. Dynamic isolation when inactive is essential:

1. **Lean Universal Rules**: Establish \`AGENTS.md\` in the root project (covering language standards, safety baselines, and communication principles). Antigravity, Cursor, VS Code, Codex, and Cline all consume it cleanly.
2. **On-Demand Project Workspaces**: Organize projects with dedicated skills in multi-root workspaces. Closing an inactive project automatically detaches its global skill junctions, wiping out irrelevant noise.
3. **Dual-Track Storage (Prevent Involuntary Indexing)**:
   - **Frequent Reusable Skills**: Place standard utilities in \`.agents/skills\` (e.g. ComfyUI workflow installers).
   - **Specialized / Low-Frequency Workflows**: Store niche workflows in custom project directories outside the skill root, preventing the agent from eagerly indexing them into the prompt and conserving precious context tokens.
`
  }
};

if (typeof module !== 'undefined') {
  module.exports = DEVELOPER_NOTES_ARTICLE;
}
