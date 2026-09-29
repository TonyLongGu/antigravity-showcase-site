/**
 * 字幕資料產生器：assets/subtitles/*.vtt  →  assets/js/subtitles-data.js
 *
 * 為什麼要預先編譯，而不是執行期 fetch()？
 *   1. 本機雙擊 index.html（file:// 協定）時，fetch() 會被 CORS 阻擋，
 *      字幕完全失效且只會 console.warn，使用者看到 CC 燈亮卻沒有字幕。
 *   2. 每次初始化播放器都要多一次網路往返，且 404 是靜默失敗。
 *   3. 檔名與影片 ID 的對應關係原本靠 `id.replace(/^antigravity-/, '')` 推導，
 *      資料缺漏無法在開發階段被發現。
 *
 * 改為預先編譯後：file:// 與 HTTP 皆可正常播放字幕、零額外請求，
 * 且缺漏／重疊／格式錯誤的 cue 會在產生階段直接列出。
 *
 * 使用方式（.vtt 仍是唯一的人工編輯來源）：
 *   node tools/build-subtitles.js
 *
 * 路徑一律由 __dirname 推導，換電腦、換磁碟代號或搬移專案位置皆可直接執行。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SUBTITLE_DIR = path.join(PROJECT_ROOT, 'assets', 'subtitles');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'assets', 'js', 'subtitles-data.js');

// 專案既有檔案皆為 CRLF，產生物維持一致以免 Diff 全面翻紅
const EOL = '\r\n';

/**
 * 解析 WebVTT 時間碼（HH:MM:SS.mmm 或 MM:SS.mmm）
 * @returns {number} 秒數；無法解析時回傳 NaN
 */
function timeToSeconds(timeStr) {
  if (!timeStr) return NaN;
  const parts = String(timeStr).trim().split(':');
  if (parts.length < 2) return NaN;

  let hours = 0;
  let mins = 0;
  let secs = 0;
  if (parts.length === 3) {
    hours = parseFloat(parts[0]);
    mins = parseFloat(parts[1]);
    secs = parseFloat(String(parts[2]).replace(',', '.'));
  } else {
    mins = parseFloat(parts[0]);
    secs = parseFloat(String(parts[1]).replace(',', '.'));
  }
  if ([hours, mins, secs].some((n) => Number.isNaN(n))) return NaN;
  return hours * 3600 + mins * 60 + secs;
}

/**
 * 將 WebVTT 文字解析為 cue 陣列
 * @param {string} text
 * @param {string} label 用於警告訊息的來源標籤
 * @returns {{cues: Array<{start:number,end:number,text:string}>, warnings: string[]}}
 */
function parseVTT(text, label) {
  const cues = [];
  const warnings = [];
  if (!text) return { cues, warnings };

  // 去除可能的 BOM，統一換行為 \n
  const lines = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').split('\n');
  let i = 0;

  // 跳過 WEBVTT 標頭等非時間軸資訊
  while (i < lines.length && !lines[i].includes('-->')) i++;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line.includes('-->')) {
      const parts = line.split('-->');
      const start = timeToSeconds(parts[0].trim().split(/\s+/)[0]);
      const end = timeToSeconds(parts[1].trim().split(/\s+/)[0]);

      i++;
      const cueText = [];
      while (i < lines.length && lines[i].trim() !== '') {
        cueText.push(lines[i].trim());
        i++;
      }

      const joined = cueText.join(' ');
      if (Number.isNaN(start) || Number.isNaN(end)) {
        warnings.push(`${label}: 時間碼無法解析，已略過 -> "${line}"`);
      } else if (start >= end) {
        warnings.push(`${label}: 起訖時間顛倒 (${start} >= ${end})，已略過 -> "${joined.slice(0, 24)}"`);
      } else if (!joined) {
        warnings.push(`${label}: 空白字幕，已略過 (${start} ~ ${end})`);
      } else {
        // 播放器以 textContent 呈現：`<` 會原樣露出（疑似標記）；`&` 僅在實體參照 (&amp;) 時才需注意
        if (/</.test(joined) || /&[A-Za-z#][A-Za-z0-9]*;/.test(joined)) {
          warnings.push(`${label}: 內含疑似標記或 HTML 實體，將以純文字原樣顯示 -> "${joined.slice(0, 24)}"`);
        }
        cues.push({ start: round3(start), end: round3(end), text: joined });
      }
    }
    i++;
  }

  return { cues, warnings };
}

/** 秒數保留毫秒精度（VTT 最小單位即毫秒） */
function round3(value) {
  return Math.round(value * 1000) / 1000;
}

/** 檢查 cue 是否依時間排序、有無重疊 */
function validateOrder(cues, label, warnings) {
  for (let i = 1; i < cues.length; i++) {
    const prev = cues[i - 1];
    const curr = cues[i];
    if (curr.start < prev.start) {
      warnings.push(`${label}: 第 ${i + 1} 條 cue 未依時間排序 (${prev.start} -> ${curr.start})`);
    } else if (curr.start < prev.end) {
      warnings.push(`${label}: 第 ${i + 1} 條 cue 與前一條重疊 (${prev.end} > ${curr.start})`);
    }
  }
}

function main() {
  if (!fs.existsSync(SUBTITLE_DIR)) {
    console.error(`✗ 找不到字幕來源目錄：${SUBTITLE_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SUBTITLE_DIR).filter((f) => f.toLowerCase().endsWith('.vtt')).sort();
  if (files.length === 0) {
    console.error(`✗ 字幕來源目錄內沒有任何 .vtt 檔案：${SUBTITLE_DIR}`);
    process.exit(1);
  }

  const tracks = {}; // { [baseName]: { [lang]: cues[] } }
  const warnings = [];
  const summary = [];

  files.forEach((file) => {
    const match = file.match(/^(.+)\.([A-Za-z-]+)\.vtt$/);
    if (!match) {
      warnings.push(`檔案命名不符 "{主題}.{語系}.vtt" 規則，已略過：${file}`);
      return;
    }
    const baseName = match[1];
    const lang = match[2] === 'en' ? 'en' : 'zh-TW'; // 與播放器的語系鍵值對齊

    const text = fs.readFileSync(path.join(SUBTITLE_DIR, file), 'utf8');
    const parsed = parseVTT(text, file);
    warnings.push(...parsed.warnings);
    validateOrder(parsed.cues, file, warnings);

    if (parsed.cues.length === 0) {
      warnings.push(`${file}: 未解析出任何 cue，已略過`);
      return;
    }

    if (!tracks[baseName]) tracks[baseName] = {};
    if (tracks[baseName][lang]) {
      warnings.push(`${file}: 語系 ${lang} 重複定義，後者已略過`);
      return;
    }
    tracks[baseName][lang] = parsed.cues;
    summary.push({ file, baseName, lang, count: parsed.cues.length });
  });

  const lines = [];
  lines.push('/**');
  lines.push(' * Antigravity Plugins Showcase - 字幕資料檔');
  lines.push(' *');
  lines.push(' * ⚠ 本檔由工具自動產生，請勿手動編輯。');
  lines.push(' *   修改字幕請編輯 assets/subtitles/*.vtt，再執行：node tools/build-subtitles.js');
  lines.push(' *');
  lines.push(' * 資料結構：SUBTITLE_TRACKS[主題][語系] = [{ start, end, text }, ...]（時間單位：秒）');
  lines.push(' * 主題鍵值即字幕檔主檔名，例如 design-philosophy.zh-TW.vtt');
  lines.push(' *   -> SUBTITLE_TRACKS[\'design-philosophy\'][\'zh-TW\']');
  lines.push(' *');
  lines.push(` * 產生時間：${new Date().toISOString()}`);
  lines.push(` * 來源檔數：${summary.length}（${Object.keys(tracks).length} 個主題）`);
  lines.push(' */');
  lines.push('const SUBTITLE_TRACKS = {');

  Object.keys(tracks).sort().forEach((baseName) => {
    lines.push(`  ${JSON.stringify(baseName)}: {`);
    Object.keys(tracks[baseName]).sort().forEach((lang) => {
      lines.push(`    ${JSON.stringify(lang)}: [`);
      tracks[baseName][lang].forEach((cue) => {
        lines.push(`      { start: ${cue.start}, end: ${cue.end}, text: ${JSON.stringify(cue.text)} },`);
      });
      lines.push('    ],');
    });
    lines.push('  },');
  });

  lines.push('};');
  lines.push('');

  fs.writeFileSync(OUTPUT_FILE, lines.join(EOL), 'utf8');

  summary.sort((a, b) => (a.baseName + a.lang).localeCompare(b.baseName + b.lang));
  console.log('\n字幕資料產生完成');
  console.log(`  輸出：${path.relative(PROJECT_ROOT, OUTPUT_FILE)}`);
  summary.forEach((s) => {
    console.log(`  ✓ ${s.file.padEnd(30)} → ${s.baseName}[${s.lang}] 共 ${s.count} 條`);
  });

  if (warnings.length > 0) {
    console.log(`\n警告 ${warnings.length} 筆：`);
    warnings.forEach((w) => console.log(`  ! ${w}`));
  } else {
    console.log('\n無警告，所有 cue 格式與排序皆正常。');
  }
}

main();
