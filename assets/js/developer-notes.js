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
    readingTime: '6 分鐘閱讀',
    lastUpdated: '2026-11-03',
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

### MCP 工具治理：常駐分層與開關紀律

MCP 是「隨開隨用的能力」，卻也是最容易拖垮 AI 專注力的一層：**每顆 MCP 的 JSON Schema 每一輪都要付 Token**，而**未開啟的 MCP 根本不會出現在 AI 的工具清單**，AI 看不到就想不起來。因此原則是「**預設關閉、要用才開、一次只開一顆**」，並以三層常駐分級控制成本：

- **Tier 0 常駐**：記憶主庫（Supermemory）永遠開啟，腳本預設擋下關閉。
- **Tier 1 任務期**：當前任務真正需要的那顆，用完可留，換任務前再檢查。
- **Tier 2 其他**：其餘全部預設關閉，要用才開。

配套紀律：

- **開關一律走腳本**（如 \`mcp-switch.ps1\`），不手改 JSON——跨宿主（Cline／Antigravity／Copilot／VS Code／Kilo／Cursor）設定格式各異，腳本代為換算並保證只動目標那顆。
- **未開啟先提醒**：任務需要某顆而未開，先提醒並請授權，不繞道硬做；**連不上必明講**（哪顆 ＋ 錯誤 ＋ 怎麼修），不默默略過或假裝完成。
- **接到任務先掃描**：跑唯讀、零成本的掃描腳本，用「指令」發現該開哪顆，而不是靠人記（MCP 一多，靠記憶必漏）。

---

### 記憶分層：AGENTS.md／Skills／Supermemory 三層路由

記憶不是「想到什麼就記什麼」，而是依「**誰需要它、何時需要**」分三層存放，落點由判準決定：

- **\`AGENTS.md\`**：每輪都必須遵守的鐵律——常駐、每輪都付 Token ⇒ 只留通則與精要。
- **Skills**：「怎麼做」的流程、判準、腳本——只有 description 常駐，靠語意觸發叫用。
- **Supermemory**：事實、決策與理由、偏好、環境變更——查得到就好、不必常駐、可改可忘。
- **路由判準**：違反它會出事 ⇒ \`AGENTS.md\`；它是「怎麼做」⇒ skill；其餘 ⇒ Supermemory。
- **記憶是可能過期的假設**：涉外部世界（模型／價格／API／版本／法規）引用前複驗，過期立即更正並註明日期。
- **主動記憶**：動手前主動回想相關的坑與決策；對話中產生重點時主動寫入（先查重、寫後驗證，並在回覆中透明告知，使用者可隨時「忘掉」撤回）。

---

### 行動治理：授權分級與安全紅線

AI 能自主做多少事，不能憑感覺，而要依「**可逆性 × 影響半徑 × 金額 × 對外可見度**」分四級：

- **Open**：可逆、影響僅當前 session／唯讀 ⇒ 事後可說明即可。
- **Standard**：可還原、影響限本 repo／本機 ⇒ 在既有授權範圍內自主。
- **Strict**：不可逆、或影響他人／對外可見／動錢 ⇒ **當場**取得明確授權，逐次、不可預先概括。
- **Locked**：一旦發生無法補救（憑證入版控、明文外流）⇒ **一律禁止**。

三條組合規則：**最嚴者勝**（同一動作命中多級取最嚴）、**不擴張授權**（核准計畫 ≠ 不可逆授權）、**fail closed**（資訊不足時視為未授權，停下來問）。實務紅線：破壞性 git、改規則本體、對外發訊、扣費呼叫皆屬 Strict；金鑰只存環境變數、永不入版控（Locked）；刪除／清理一律走安全流程並留下 append-only 審計。

---

### 技能分層：治理層與能力包

技能本身也分兩層，避免「該常駐的被關、該按需的卻常駐」：

- **治理層技能**（規則、記憶、MCP 開關、刪除安全、健檢、授權治理）：**每輪都要用，永不關閉**。
- **能力包**（遊戲引擎、AI 媒體產線、中文寫作／版式／簡報…）：按任務類型拆成獨立技能包，**隨需啟閉**，由工作區的 Junction 控制。
- **取用路由**：先判斷「這任務要什麼能力」，再判斷「哪個包有」；只要與交付物正相關就建議載入（寧可先載，不要做到一半才發現缺料），但一次最多建議 **2 包／4 支**，且不無差別全開。
- **載入機制**：\`skills\` 工具只把技能**名稱**投影進系統提示，\`description\` 與本文要**叫用後**才進 context ⇒ **「包已開」不等於「技能已載入」**，開工時仍要做一次包內挑選。

---

### IDE、AI Agent 選擇策略

令人玩味的比喻：AI Agent 御三家 —— Antigravity、VS Code、Cursor

本工具開發起初由 Antigravity 入門（高性價比），而後因工作需要引入 Cursor（更強的推理模型），再尋求更彈性的應用策略 VS Code（Cline、Codex），逐一收服不同屬性的 AI Agent，以此攻略各種類型的任務：

- **Cursor + Claude**：單純代碼開發
- **Cursor + Codex**：代碼開發 + 圖文
- **Antigravity**：通用圖文創作
- **Antigravity + Codex**：圖文創作
- **VS Code（Cline, Copilot, Codex, OpenRouter）**：影音 + 3D 創作
`
  },

  'en': {
    tag: 'Developer Notes',
    badge: 'Architecture & Best Practices',
    readingTime: '6 min read',
    lastUpdated: '2026-11-03',
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

### MCP Governance: Resident Tiers & Toggle Discipline

MCP is an "on-demand capability," yet it is also the layer most likely to drag down AI focus: **every MCP's JSON Schema costs tokens on every turn**, and **a disabled MCP never appears in the AI's tool list at all** — if the AI cannot see it, it will never think of it. The principle is therefore "**off by default, on only when needed, one at a time**," with three resident tiers to control cost:

- **Tier 0 (always resident)**: the memory backbone (Supermemory) stays on permanently; scripts block disabling it by default.
- **Tier 1 (task-scoped)**: the one server the current task truly needs; it may stay on, but re-check before switching tasks.
- **Tier 2 (everything else)**: all disabled by default, enabled only when needed.

Supporting discipline:

- **Toggle only via script** (e.g. \`mcp-switch.ps1\`), never by hand-editing JSON — each host (Cline / Antigravity / Copilot / VS Code / Kilo / Cursor) uses a different config format; the script translates and guarantees only the target server is touched.
- **Warn before enabling**: if a task needs a disabled server, surface it and ask for authorization first — never route around it; **if a connection fails, say so explicitly** (which server + error + fix), never silently skip or pretend it worked.
- **Scan on task intake**: run a read-only, zero-cost scan to *discover* which server to enable by command, not by memory (with many MCPs, memory always misses).

---

### Memory Layering: AGENTS.md / Skills / Supermemory

Memory is not "write down whatever comes to mind" — it is stored in three layers by **who needs it and when**:

- **\`AGENTS.md\`**: the iron laws that must hold every turn — always resident, paying tokens each turn ⇒ keep it general and concise.
- **Skills**: the "how-to" workflows, criteria, and scripts — only the description is resident; the rest loads on semantic trigger.
- **Supermemory**: facts, decisions and their rationale, preferences, environment changes — retrievable on demand, not resident, editable and forgettable.
- **Routing rule**: if violating it causes harm ⇒ \`AGENTS.md\`; if it is "how to do it" ⇒ a skill; otherwise ⇒ Supermemory.
- **Memory is a possibly-stale assumption**: for anything about the outside world (models / prices / APIs / versions / regulations), re-verify before citing; correct it immediately and note the date once stale.
- **Proactive memory**: recall relevant pitfalls and decisions before starting work; when key points emerge in conversation, write them proactively (de-duplicate first, verify after writing, and disclose transparently in the reply so the user can retract with "forget").

---

### Action Governance: Authorization Tiers & Safety Lines

How much an AI may do autonomously is not a matter of feel, but of four tiers judged by **reversibility × blast radius × cost × external visibility**:

- **Open**: reversible, affecting only the current session / read-only ⇒ post-hoc explanation suffices.
- **Standard**: reversible, affecting only this repo / machine ⇒ autonomous within the existing authorization scope.
- **Strict**: irreversible, or affecting others / externally visible / spending money ⇒ obtain **explicit** authorization on the spot, one instance at a time, never in advance.
- **Locked**: unrecoverable once it happens (credentials committed, plaintext leaked) ⇒ **always forbidden**.

Three combination rules: **strictest wins** (when an action hits several tiers, take the strictest), **no scope creep** (an approved plan ≠ authorization for irreversible steps), and **fail closed** (when information is insufficient, treat it as unauthorized and stop to ask). Practical red lines: destructive git, editing the rulebook itself, outbound messages, and billable calls are all Strict; keys live only in environment variables and never enter version control (Locked); deletion/cleanup always follows a safe procedure and leaves an append-only audit trail.

---

### Skill Layering: Governance vs Capability Packs

Skills themselves come in two layers, to avoid "shutting down what should be resident and keeping resident what should be on-demand":

- **Governance skills** (rules, memory, MCP toggling, safe deletion, health checks, authorization): **used every turn, never disabled**.
- **Capability packs** (game engines, AI media pipelines, Chinese writing / typesetting / presentations…): split into separate packs by task type, **enabled and disabled on demand**, controlled by the workspace's Junctions.
- **Routing**: first decide "what capability this task needs," then "which pack has it"; load whenever positively related to the deliverable (better to load early than discover a gap mid-way), but suggest at most **2 packs / 4 skills** at a time, never enabling everything indiscriminately.
- **Loading mechanics**: the \`skills\` tool projects only skill **names** into the system prompt; the \`description\` and body load only **after invocation** ⇒ **"pack enabled" does not equal "skill loaded"** — still pick within the pack when starting work.

---

### IDE & AI Agent Selection Strategy

An intriguing analogy: The "Big Three" AI Agents —— Antigravity, VS Code, and Cursor

Our toolchain development began with Antigravity (high cost-performance ratio). Later, driven by project demands, we introduced Cursor (stronger reasoning models), and further explored flexible strategies with VS Code (Cline, Codex) — mastering distinct AI Agents one by one to conquer varied workloads:

- **Cursor + Claude**: Pure code development
- **Cursor + Codex**: Code development + text/graphics
- **Antigravity**: General graphic & text creation
- **Antigravity + Codex**: Graphic & text creation
- **VS Code (Cline, Copilot, Codex, OpenRouter)**: Video & 3D creation
`
  }
};

if (typeof module !== 'undefined') {
  module.exports = DEVELOPER_NOTES_ARTICLE;
}
