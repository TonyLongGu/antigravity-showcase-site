# Antigravity IDE Plugins 展示網站 (GitHub Pages)

本目錄為 Google Antigravity IDE 專屬原生擴充套件生態系展示網站（亦完整支援 Cursor 與 VS Code 安裝），可直接透過 **GitHub Pages** 託管上線。

---

## 🚀 GitHub Pages 一鍵發布步驟

1. 確保最新程式碼已 Push 至 GitHub 倉庫：[`https://github.com/TonyLongGu/antigravity-showcase-site`](https://github.com/TonyLongGu/antigravity-showcase-site)。
2. 進入該 GitHub 倉庫設定頁面：[**Settings -> Pages**](https://github.com/TonyLongGu/antigravity-showcase-site/settings/pages)。
3. 在 **Build and deployment** 區塊：
   - **Source** 選擇 `Deploy from a branch`
   - **Branch** 選擇 `main` 分支，資料夾下拉選單選擇 **`/ (root)`**（根目錄）
   - 點擊 **Save**
4. 等待 1~2 分鐘 GitHub 自動建置完成，即可在頂部看見上線網址：
   👉 **`https://tonylonggu.github.io/antigravity-showcase-site/`**

---

## 💻 本機預覽方式

直接以瀏覽器雙擊開啟 [`index.html`](./index.html) 或執行 [`preview-site.bat`](./preview-site.bat) 預覽。

---

## 🎬 影片與字幕維護

**影片**：放置於 `assets/videos/`，並於 [`assets/js/plugins-data.js`](./assets/js/plugins-data.js) 的 `TUTORIAL_VIDEOS` / `PLUGINS_DATA` 指定 `videoSrc`。

**字幕**：`assets/subtitles/{主題}.{語系}.vtt` 是唯一的人工編輯來源（語系支援 `zh-TW` 與 `en`）。
編輯完成後**必須**執行產生器，把字幕編譯進 `assets/js/subtitles-data.js`：

```bash
node tools/build-subtitles.js
```

產生器會列出每個主題的 cue 條數，並警告時間碼錯誤、起訖顛倒、順序錯亂、重疊或疑似標記的內容。
之所以採「預先編譯」而非執行期 `fetch`：直接雙擊開啟 `index.html`（`file://` 協定）時 `fetch` 會被 CORS 阻擋，字幕會完全失效。

