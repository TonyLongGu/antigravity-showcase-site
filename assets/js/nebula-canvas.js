/**
 * Antigravity Nebula Canvas - Interactive Particle Constellation Engine
 */
(function() {
  const canvas = document.getElementById('nebula-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  // 粒子模式＝風格鍵。實際值於下方 MODE_SPECS 定義後，依 data-theme 校正。
  let mode = 'antigravity';
  /* 滑鼠狀態：x／y＝座標；radius＝互動半徑（三種風格共用，setMode 會重設成 160）。
     4.12 移除只寫不讀的 vx／vy（原本是「上次事件 → 這次事件」的位移，4.11 起已無任何讀取者）。 */
  let mouse = { x: -1000, y: -1000, radius: 160 };
  /* 餘燼的底部熱源。刻意宣告在 resize() 之前：resize() 會在檔尾定義前就先跑一次
     （靠 refreshEmberSources 的函式宣告提升），這裡先初始化才不會踩 TDZ。 */
  let emberSources = [];

  const PARTICLE_COUNT = 75;
  /* Ash has no connecting lines. A higher count keeps the field present.
      Cursor 風格是銳利三角形平塗（單色、無光暈），顆數直接決定密度：
      4.3 由 400 減半為 200、4.4 再減半為 100、4.6 再 −10% 為 90（使用者三次要求）。
      稀疏感靠「色相家族」的多樣性與尺寸曲線撐住，不再靠顆數。
      90 只是 1440×900 的基準值，實際顆數由 emberCount() 隨視窗面積縮放。 */
  const EMBER_COUNT = 90;
  /* Code glyphs have no connecting lines either; the count carries the texture. */
  const CODE_COUNT = 92;
  const CONNECT_DISTANCE = 130;
  const MOUSE_CONNECT_DISTANCE = 160;

  /* 高解析度螢幕必須做 DPR 縮放：原本 canvas.width = innerWidth，等於整個畫布被瀏覽器
     放大 DPR 倍，1–8px 的粒子永遠是糊的。上限夾在 2，兼顧清晰度與填充成本。 */
  let dpr = 1;

  /* 餘燼的視窗縮放係數：顆數、羽流寬度、餘燼尺寸三者共用同一個值。
     以 1440×900 為基準（=1）隨面積線性縮放，並夾在 0.5–1.15：
     小螢幕不至於稀到看不見，大螢幕也不會無限膨脹（4K 面積是基準的 6.4 倍）。 */
  const EMBER_AREA_REF = 1440 * 900;
  const EMBER_SCALE_MIN = 0.5;
  const EMBER_SCALE_MAX = 1.15;
  let emberScale = 1;
  /* 初始 spawn() 之前不能讓 resize() 碰 MODE_SPECS（const 會踩 TDZ），故立旗標。 */
  let ready = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    emberScale = Math.max(EMBER_SCALE_MIN,
      Math.min(EMBER_SCALE_MAX, (width * height) / EMBER_AREA_REF));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    // 之後所有繪製都用 CSS 像素座標，由這個變換換算成裝置像素
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    refreshEmberSources();
    // 縮放到顆數真的變了才重配，否則每次拖曳視窗都重打散會閃
    if (ready) syncParticleCount();
  }

  window.addEventListener('resize', resize);
  resize();

  /* 滑鼠輸入＝最初版（61a86e6）。4.8 依使用者「比照最原本」整段回退：
     只取座標 —— 不做 dt 正規化、不做 0.7/0.3 平滑、不做每幀阻尼，也不走 pointer events（觸控不做互動）。
     4.12：原本還會把逐事件位移存成 mouse.vx／vy，但 4.11 之後已無任何讀取者（4.8–4.10 的順勢帶是唯一用戶），
     留著只會是「沒有阻尼、也不會歸零」的陷阱，故移除。 */
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 1.8 + 0.8;
      this.baseAlpha = Math.random() * 0.5 + 0.25;
      this.alpha = this.baseAlpha;
      this.color = Math.random() > 0.4 ? '#00f2fe' : '#7f00ff';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // 滑鼠互動＝推開（斥力）：下面兩行把粒子往「游標 − 粒子」的反方向位移
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius && dist > 0.5) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 1.5;
        this.y -= (dy / dist) * force * 1.5;
        this.alpha = Math.min(1, this.baseAlpha + force * 0.5);
      } else {
        this.alpha = this.baseAlpha;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  /* ---------------------------------------------------------------------
     Cursor 風格 —— 火焰灰燼
     熱源在畫面下緣之外，餘燼沿羽流上升：剛離火源最熱（白黃、大、快），
     越往上越冷（橘 → 暗紅 → 灰）、越慢越小越淡，在抵達畫面上緣前淡出熄滅。
     繪製＝銳利三角形平塗（剪紙感）：幾何沿用最初版的三角形路徑，顏色吃所屬家族的冷卻色階，
     不用漸層、不用 shadowBlur、也不加外圈光暈；自轉照舊——滑鼠只平移粒子
     （4.11 起只剩**純徑向推開**；順勢帶／側向剪切／上抬已於 4.11 隨互動改回 HEAD 而移除）並在靠近時提亮，絕不改變它的角度。
     --------------------------------------------------------------------- */

  /* 色相家族（4.4）：每顆出生抽一個家族、終身固定，家族內再抽一個明度變體 → 9 張 24 階色表。
     權重原照 c1b3f8f 的 emberColor()（已查證：紅 40%／橘 34%／藍 26%）；
     4.8 依使用者「藍色調出現機率少一些」調成 **紅 42%／橘 42%／藍 16%**——
     只動比例，色階（stops）、明度變體、飽和度旋鈕全部不動。藍是冷灰藍、在暖色場裡最跳，
     砍它最直接；最初版（61a86e6）本來就是 20%，所以 16% 不算離譜，只是更少。
     每個家族都保留「亮 → 暗」的降溫走向，所以火的邏輯還在，只是色相由粒子自己決定。 */
  const EMBER_FAMILIES = [
    {   // 紅：亮橙紅 → 紅 → 暗紅收尾（不再一律轉冷灰）
      stops: [
        { at: 0.00, rgb: [255, 198, 152] },
        { at: 0.22, rgb: [248, 128, 74] },
        { at: 0.55, rgb: [196, 52, 28] },
        { at: 1.00, rgb: [92, 20, 14] }
      ]
    },
    {   // 橘／琥珀：白黃 → 亮橘 → 暗棕（4.2／4.3 的主力色階，原樣保留）
      stops: [
        { at: 0.00, rgb: [255, 240, 206] },
        { at: 0.16, rgb: [255, 182, 82] },
        { at: 0.36, rgb: [250, 126, 36] },
        { at: 0.68, rgb: [210, 76, 24] },
        { at: 1.00, rgb: [148, 82, 58] }
      ]
    },
    {   // 藍／灰藍：亮藍白 → 藍 → 暗藍（低飽和，照最初版的 dusty blue-gray）
      stops: [
        { at: 0.00, rgb: [224, 240, 255] },
        { at: 0.20, rgb: [146, 196, 246] },
        { at: 0.52, rgb: [74, 116, 184] },
        { at: 1.00, rgb: [46, 54, 88] }
      ]
    }
  ];
  const EMBER_FAMILY_CUM = [42, 84, 100];        // 累積權重：紅 42%／橘 42%／藍 16%（4.8 由紅 40／橘 34／藍 26 調整）
  const EMBER_FAMILY_LIGHT = [0.82, 1.0, 1.18];  // 家族內明度變體，避免同家族每顆一模一樣
  const EMBER_RAMP_STEPS = 24;

  /* 4.6：彩度旋鈕（**要調豔／調淡只改這一個數字**）。
     以 HSV 的 S 做倍率（色相與明度 V 原樣保留）→ 色相家族與「亮→暗」的冷卻梯度都不會跑掉，
     而且會連 EMBER_FAMILY_LIGHT 的明度變體一起校正（乘 RGB 的 1.18 變體本來會比較不飽和）。
     只影響「建表」階段（9 張 24 階＝216 色），執行期照舊查預建字串表、零成本。
     注意亮端的 V 已接近 1，S 的絕對提升有限（火心只會微微偏琥珀）：1.25 是「一些些」的量級。 */
  const EMBER_SAT_GAIN = 1.25;

  /* 對已定案的 RGB 做一次 HSV 飽和度倍率（hue／V 不動）。 */
  function bumpSaturation(rgb) {
    if (EMBER_SAT_GAIN === 1) return rgb;
    const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    if (mx === mn) return rgb;              // 純灰不動
    const d = mx - mn;
    let h;
    if (mx === r) h = 60 * (((g - b) / d) % 6);
    else if (mx === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
    if (h < 0) h += 360;
    const s = Math.min(1, (d / mx) * EMBER_SAT_GAIN);
    const c = mx * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = mx - c;
    let nr = 0, ng = 0, nb = 0;
    if (h < 60) { nr = c; ng = x; }
    else if (h < 120) { nr = x; ng = c; }
    else if (h < 180) { ng = c; nb = x; }
    else if (h < 240) { ng = x; nb = c; }
    else if (h < 300) { nr = x; nb = c; }
    else { nr = c; nb = x; }
    return [Math.round((nr + m) * 255), Math.round((ng + m) * 255), Math.round((nb + m) * 255)];
  }

  /* 把家族色階插值成 24 階（RGB 內插；不用 HSL 色輪才不會繞過黃綠），最後過一次彩度旋鈕。 */
  function buildEmberRamp(stops, lightScale) {
    const ramp = [];
    for (let i = 0; i < EMBER_RAMP_STEPS; i++) {
      const at = i / (EMBER_RAMP_STEPS - 1);
      let a = stops[0];
      let b = stops[stops.length - 1];
      for (let j = 0; j < stops.length - 1; j++) {
        if (at >= stops[j].at && at <= stops[j + 1].at) {
          a = stops[j];
          b = stops[j + 1];
          break;
        }
      }
      const t = (at - a.at) / Math.max(b.at - a.at, 0.0001);
      ramp.push(bumpSaturation([
        Math.max(0, Math.min(255, Math.round((a.rgb[0] + (b.rgb[0] - a.rgb[0]) * t) * lightScale))),
        Math.max(0, Math.min(255, Math.round((a.rgb[1] + (b.rgb[1] - a.rgb[1]) * t) * lightScale))),
        Math.max(0, Math.min(255, Math.round((a.rgb[2] + (b.rgb[2] - a.rgb[2]) * t) * lightScale)))
      ]));
    }
    return ramp;
  }

  function toCssRgb(rgb) {
    return 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
  }

  /* 平塗用色＝[家族][明度變體][階]：RGB 數字表是來源，CSS 字串表才是繪製用的
     （4.8 取消「被游標烙暗」的即時混色後，繪製一律直接填字串 —— 熱路徑仍零字串、零數學）。
     剪紙感＝單色平塗，所以這裡不做漸層、也不進 sprite。 */
  const EMBER_RAMP_RGB = EMBER_FAMILIES.map((f) =>
    EMBER_FAMILY_LIGHT.map((ls) => buildEmberRamp(f.stops, ls)));
  const EMBER_RAMP_SETS = EMBER_RAMP_RGB.map((set) => set.map((ramp) => ramp.map(toCssRgb)));

  /* 近似常態（三個均勻分布相加）：範圍 ±1、σ≈0.33。
     讓羽流底部有集中度，而不是整排平均散開。 */
  function gauss() {
    return (Math.random() + Math.random() + Math.random()) / 1.5 - 1;
  }

  /* 實際顆數＝基準 100 × 視窗縮放（手機 390×844 會被夾到下限 0.5 → 50 顆）。
     固定顆數在小視窗等於等比例變密：300 顆塞進 390×844（面積只有基準的 1/4）就是 4 倍密度，
     實測手機截圖底部糊成一整條亮帶。 */
  function emberCount() {
    return Math.round(EMBER_COUNT * emberScale);
  }

  /* 餘燼尺寸只做「部分」縮放：用 emberScale 的 0.35 次方（手機 0.78 倍，而非面積等比的 0.5 倍）。
     理由有二：一是 9px 半徑的 sprite 在 1440 寬只佔 1.25%、在 390 寬卻佔 4.6%，不縮會變成大光球；
     二是實測手機用平方根（0.59 倍）會過稀，覆蓋率只剩桌機一半。指數取 0.35 時覆蓋率與桌機相當。 */
  function emberSizeScale() {
    return Math.pow(emberScale, 0.35);
  }

  /* 底部熱源：數量隨視窗寬度增減，位置沿底部錯開，避免整排糊成一道火牆。
     實測 1440 寬只開 3 個會變成三根細香、彼此之間大片空白，故加密並加寬底部的 σ。
     羽流寬度也吃 emberScale：固定 70–240px 的 σ 在 390 寬手機幾乎等於整個畫面，會併成一條水平亮帶。 */
  function refreshEmberSources() {
    const count = Math.max(4, Math.min(8, Math.round(width / 260)));
    emberSources = [];
    for (let i = 0; i < count; i++) {
      const slot = (i + 0.5) / count;
      emberSources.push({
        x: width * (slot + (Math.random() - 0.5) * (0.7 / count)),
        spread: (70 + Math.random() * 170) * emberScale
      });
    }
  }

  /* 生命曲線參數：一切由 life（0＝剛離火源、1＝熄滅）驅動 ——
     上升速度、冷卻色階、淡入淡出都吃同一個值，所以只需調這裡。 */
  const EMBER_FADE_IN = 0.10;      // 前 10% 淡入（大多在畫面外完成，不會憑空冒出）
  const EMBER_FADE_OUT = 0.78;     // 4.6 由 0.66 延後到 78% 才開始淡出（上方中段才留得住），100% 時完全熄滅
  const EMBER_DEATH_DEPTH = 0.05;  // 熄滅高度＝畫面上緣再往下 5%（淡出完成點）

  /* 4.5：整體亮度旋鈕（**要調亮／調暗只改這一個數字**）。
     乘在 alpha 鏈末端，整條漸層等比縮放 → 峰值與中間調一起降，火光的層次不會被壓成一片平。
     1.0＝4.4 原值；0.9＝峰值亮度約 −10%（4.5 依使用者要求「最大亮度降一點點」而定）。
     註：亮度的另一個來源是色階（EMBER_FAMILIES 的亮端與 EMBER_FAMILY_LIGHT），改那裡動的是「顏色」
     而不是「透明度」，會連帶改變色相分布，調亮度請優先改這裡。 */
  const EMBER_BRIGHT_SCALE = 0.9;

  /* 上升曲線：rise = baseRise × (START + GAIN × life)。
     4.4 要求「出生慢一半、越上升越快」：START 由 0.55 砍到 0.28。
     **GAIN 由不變式反推＝2 × (1 − START)**，所以曲線在 [0,1] 的積分恆為 1
     （START + GAIN/2 = 1）→ `lifespan = span / baseRise` 永遠成立：餘燼剛好在壽命結束時
     走到熄滅高度。出生 0.28× → 上端 1.72×（加速梯度 6.1×，舊版只有 2.6×）。 */
  const EMBER_RISE_START = 0.28;
  const EMBER_RISE_GAIN = 2 * (1 - EMBER_RISE_START);

  /* 滑鼠互動（4.11）：使用者「我想做到 git 最後一版那樣的互動效果好了」→ 逐項照抄 HEAD（7f9f3d3）
     的 EmberParticle.update()，取代 4.8–4.10 的「慣性推開」模型：
     ① 半徑改回**共用** `mouse.radius`（160）——不再自成常數（HEAD 的 cursor 模式就是用共用值）
     ② 推力＝**每幀直接位移** `1.5 × force`：`this.x -= (dx/dist) * force * 1.5`
        → 沒有速度累積、沒有 0.988 滑行、沒有順勢帶／側向剪切／上抬（那四個是 61a86e6 的東西）
     ③ 靠近提亮 `+0.22 × force`，再用 `×0.08` 低通逼近（HEAD 的 drawAlpha 平滑）
     ＝粒子只是「禮貌地讓開」，游標一離開就停，不會被帶著跑。 */
  const EMBER_MOUSE_PUSH = 1.5;         // HEAD：this.x -= (dx / dist) * force * 1.5
  const EMBER_NEAR_BRIGHT = 0.22;       // HEAD：brightTarget = brightness + force * 0.22
  /* 提亮後的上限：HEAD 是 EMBER_BRIGHT_CAP = 0.82，但那是作用在 HEAD 的 brightness 尺度上；
     本版 alpha 尺度最亮可到 0.9，硬套 0.82 會讓貼身粒子反而變暗（＝復活 4.4 的烙暗），
     故沿用本版自己的 0.95。除此之外所有數值都照 HEAD。 */
  const EMBER_NEAR_CAP = 0.95;
  const EMBER_NEAR_EASE = 0.08;         // HEAD：drawAlpha += (target - drawAlpha) * 0.08

  class EmberParticle {
    constructor() {
      this.reset(true);
    }

    /* warmStart＝載入瞬間直接散佈在生命週期上的隨機位置。
       否則 100 顆會全部擠在底部一起往上衝（開場會看到一整條亮帶）。 */
    reset(warmStart) {
      const source = emberSources.length
        ? emberSources[Math.floor(Math.random() * emberSources.length)]
        : { x: Math.random() * width, spread: 60 };

      this.originX = source.x;
      /* 初始（＝畫面下緣最大）尺寸。4.6：(2.2 + rand×6.8) → (2.0 + rand×6.2)；
         4.7 再降一些些 → (1.8 + rand×5.7)（平均 5.1→4.65、最大 8.2→7.5）。 */
      this.baseRadius = (1.8 + Math.random() * 5.7) * emberSizeScale();
      // 出生時的上升速度（px/幀）；壽命由此反推，所以快的走得快、活得短
      this.baseRise = 1.6 + Math.random() * 2.0;
      this.swayAmp = 0.18 + Math.random() * 0.5;
      this.swaySpeed = 0.008 + Math.random() * 0.03;
      this.swayPhase = Math.random() * Math.PI * 2;
      /* 自轉：剪紙片是剛體，翻起來才靈動，不然會像一群釘住的碎屑。
         速率沿用最初版（±0.007–0.025 rad/幀）。滑鼠只會把粒子推開，不影響這個角度。 */
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() < 0.5 ? -1 : 1) * (0.007 + Math.random() * 0.018);
      /* 滑鼠互動的狀態：near＝離游標多近（0–1，經 EMBER_NEAR_EASE 低通；draw() 用來提亮）。
         4.11 起沒有 pvx／pvy——HEAD 是每幀直接位移，不累積速度。 */
      this.near = 0;
      /* 色相家族：出生抽一次、終身固定（照最初版 emberColor() 的語意），
         家族內再抽一個明度變體 → 整片有紅、有橘、有藍灰，不會同色。 */
      const roll = Math.random() * 100;
      this.family = roll < EMBER_FAMILY_CUM[0] ? 0 : (roll < EMBER_FAMILY_CUM[1] ? 1 : 2);
      this.light = Math.floor(Math.random() * EMBER_FAMILY_LIGHT.length);
      // 持久側傾（風）：幅度小，讓路徑不是對稱的波浪
      this.drift = (Math.random() < 0.5 ? -1 : 1) * (0.02 + Math.random() * 0.1);
      // 羽流擴散係數：離熱源越遠越寬（指數發散，繪製前再夾住）
      this.spread = 0.0014 + Math.random() * 0.0026;
      this.flickerPhase = Math.random() * Math.PI * 2;
      this.flickerSpeed = 0.01 + Math.random() * 0.045;
      this.riseWobblePhase = Math.random() * Math.PI * 2;
      this.riseWobbleSpeed = 0.01 + Math.random() * 0.03;
      this.bright = 0.55 + Math.random() * 0.4;
      // 個體色溫偏移：有的偏黃有的偏紅，整片才不會同色
      this.warmth = 0.88 + Math.random() * 0.24;

      this.deathY = height * EMBER_DEATH_DEPTH;
      const birthX = source.x + gauss() * source.spread;
      // 出生點貼齊畫面下緣（大部分在畫面外一點），火源本身不入鏡
      const spawnY = height + 4 + Math.random() * 44;
      this.span = Math.max(spawnY - this.deathY, 1);
      // rise 曲線 START + GAIN×life 的積分恆為 1（START + GAIN/2 = 1，由 GAIN 反推保證），
      // 故壽命＝span / baseRise 時，餘燼剛好在壽命結束的那一刻走到熄滅高度。
      this.lifespan = this.span / this.baseRise;

      this.life = warmStart ? Math.random() : 0;
      this.age = this.life * this.lifespan;
      // 暖啟動：直接放到「走了這麼久之後應該在的位置」，x 也依同一個擴散式推回去
      this.x = this.originX + (birthX - this.originX) * Math.exp(this.spread * this.age);
      this.y = spawnY - this.span * (EMBER_RISE_START * this.life +
        (EMBER_RISE_GAIN / 2) * this.life * this.life);
      this.computeAlpha();
    }

    /* 亮度＝淡入 × 淡出 × 個體基準 × 閃爍 × 整體旋鈕。
       4.5 把整體旋鈕 EMBER_BRIGHT_SCALE（0.9）放在最後 → 峰值與中間調等比下降。
       4.8：這裡不再吃互動狀態 —— 烙暗已移除，「靠近游標的提亮」改在 draw() 之後加成，
       讓 computeAlpha() 只反映生命曲線。 */
    computeAlpha() {
      let fade = 1;
      if (this.life < EMBER_FADE_IN) fade = this.life / EMBER_FADE_IN;
      if (this.life > EMBER_FADE_OUT) {
        // 4.6：指數由 0.6 收到 0.45（尾巴更飽）。上緣若只剩 alpha 0.1 就會像空帶，
        // 而 0.85 那種更陡的尾巴會讓淡出看起來像「突然熄掉」。
        fade = Math.min(fade, Math.pow((1 - this.life) / (1 - EMBER_FADE_OUT), 0.45));
      }
      const flicker = 0.72 + 0.28 * (0.5 + 0.5 * Math.sin(this.flickerPhase));
      this.alpha = Math.min(1, fade * flicker * this.bright) * EMBER_BRIGHT_SCALE;
    }

    /* 越靠下越大（景深）。4.6：0.16 + 1.09×depth^1.55（上下 7.8×）→ 0.28 + 0.97×depth^1.25（4.5×）；
       4.7 使用者要「隨著上升不要太快縮小」→ 0.38 + 0.87×depth^1.05（**3.3×**）。
       底部仍固定 1.25×（(0.38+0.87)＝1.25）→ 初始尺寸只由 baseRadius 決定，兩件事互不干擾。
       註：再往下壓對比會趨近「整片等大」，景深感就沒了（2.8× 是下限，別再低）。 */
    radiusAt(y) {
      const depth = Math.max(0, Math.min(1, y / Math.max(height, 1)));
      return this.baseRadius * (0.38 + 0.87 * Math.pow(depth, 1.05));
    }

    update() {
      this.age += 1;
      this.life = Math.min(1, this.age / this.lifespan);
      this.flickerPhase += this.flickerSpeed;
      this.riseWobblePhase += this.riseWobbleSpeed;
      this.swayPhase += this.swaySpeed;
      this.angle += this.spin;               // 純自轉：滑鼠互動不再影響角度

      /* 浮力：熱氣柱把剛離火源的餘燼慢慢帶起來，越往上越快（4.4 起 0.28 → 1.72 倍）。
         這同時是密度梯度：底部慢＝停留久＝顆數集中（火源亮帶），
         上方快＝稀疏掠過（灰燼飄散），並讓「越往上越快」的加速感看得出來。 */
      const rise = this.baseRise * (EMBER_RISE_START + EMBER_RISE_GAIN * this.life) *
        (1 + 0.14 * Math.sin(this.riseWobblePhase));
      this.y -= rise;

      /* 羽流：離熱源越遠越寬，但側向一律夾在「上升速度的一半」之內 ——
         舊版頂端側向可達 1.68 px/幀（比垂直快 3 倍以上，看起來是橫著飛出畫面）
         就是少了這道夾。垂直永遠主導，才是火的樣子。 */
      const push = (this.x - this.originX) * this.spread;
      const limit = rise * 0.5;
      this.x += Math.max(-limit, Math.min(limit, push));
      // 低頻蛇行 ＋ 持久側傾（越下面越明顯，頂端不再加速側移）
      this.x += Math.sin(this.swayPhase) * this.swayAmp * 0.35 +
        this.drift * (0.5 + 0.5 * (1 - this.life));

      /* 滑鼠互動＝HEAD（7f9f3d3）的 EmberParticle.update()，逐項照抄：
         dx／dy 取「游標 − 粒子」→ 減掉法向分量＝把粒子推離游標，**每幀直接位移**（無速度累積、無滑行）。
         dist > 0.5 的守門照 HEAD；游標不在畫面時座標是 −1000，自然不會作用。
         提亮目標＝force，再以 EMBER_NEAR_EASE 低通逼近（HEAD 的 drawAlpha 平滑）。 */
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let nearTarget = 0;
      if (dist < mouse.radius && dist > 0.5) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * EMBER_MOUSE_PUSH;
        this.y -= (dy / dist) * force * EMBER_MOUSE_PUSH;
        nearTarget = force;
      }
      this.near += (nearTarget - this.near) * EMBER_NEAR_EASE;

      this.computeAlpha();

      // 壽命結束，或被吹得提前越過熄滅高度／跑出畫面，就回收重生
      if (this.life >= 1 || this.y < this.deathY - 40 ||
          this.x < -100 || this.x > width + 100) {
        this.reset(false);
      }
    }

    /* 畫一顆銳利三角形平塗的「剪紙片」：不帶漸層、不帶陰影、也不疊光暈，
       邊緣就是瀏覽器反鋸齒的那 1px（與最初版的 path fill 完全相同）。
       只吃自身角度（自轉）；不做任何沿滑鼠方向的縮放或轉正。 */
    triangle(x, y, r, angle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.9, r * 0.62);
      ctx.lineTo(-r * 0.9, r * 0.62);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    draw() {
      const depth = Math.max(0, Math.min(1, this.y / Math.max(height, 1)));
      // 同一個閃爍相位同時推動亮度與大小：亮的時候也大一點，才像火光
      const pulse = 0.72 + 0.28 * (0.5 + 0.5 * Math.sin(this.flickerPhase));
      const radius = this.radiusAt(this.y) * pulse;
      // 色階查表：u 由生命驅動、warmth 做個體微調；家族與明度在 reset() 抽定後終身不變
      let u = this.life / this.warmth;
      u = Math.max(0, Math.min(1, u));
      const step = Math.round(u * (EMBER_RAMP_STEPS - 1));
      // 深度亮度差也收窄（4.6：0.72+0.28d → 0.85+0.15d），上方 alpha 由 0.72× 提到 0.85×
      let alpha = this.alpha * (0.85 + 0.15 * depth);

      /* 靠近游標＝提亮（HEAD：target = base + force×0.22、上限 EMBER_BRIGHT_CAP，低通 0.08 由 update() 做好），
         不是 4.4 的烙暗暗紅。提亮量也吃 EMBER_BRIGHT_SCALE，4.5 的整體亮度旋鈕才不會被這一項繞過。
         顏色永遠走預建字串表（熱路徑零字串）。 */
      if (this.near > 0) {
        alpha = Math.min(EMBER_NEAR_CAP,
          alpha + this.near * EMBER_NEAR_BRIGHT * EMBER_BRIGHT_SCALE);
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = EMBER_RAMP_SETS[this.family][this.light][step];
      this.triangle(this.x, this.y, radius, this.angle);
    }
  }

  /* ---------------------------------------------------------------------
     VS Code — 程式碼字符模式
     以極低透明度的等寬字元漂浮，取代星空（Antigravity 風格）的連線與餘燼（Cursor 風格）的上升感；
     游標掠過時把附近的字微微照亮，像編輯器照亮游標所在的程式碼。
     --------------------------------------------------------------------- */
  const CODE_GLYPHS = [
    'const', 'let', 'fn', 'async', 'await', 'import', 'export', 'type', 'class',
    '=>', '===', '!==', '&&', '||', '?.', '??', '::', '++', '--', '**',
    '{ }', '( )', '[ ]', '</>', '#', '@', '~', ';', '...', '0x1f', '//'
  ];

  /* Dark+ 語法色，但刻意不放灰色：灰字符會讓整個畫面顯得灰平。
     藍為主體，綠與橘只當點綴。 */
  function codeColor() {
    const roll = Math.random();
    if (roll < 0.4) return '#6aaee6';  // 關鍵字藍
    if (roll < 0.7) return '#84c3ff';  // 亮藍
    if (roll < 0.84) return '#a5e0ff'; // 淺藍
    if (roll < 0.94) return '#7fae6a'; // 字串綠
    return '#dda088';                  // 字串橘
  }

  class CodeParticle {
    constructor() {
      const size = 11 + Math.random() * 7;
      this.size = size;
      // 先把字型字串組好，避免每幀重新拼接。
      this.font = '600 ' + size.toFixed(1) + 'px "JetBrains Mono", Consolas, Monaco, monospace';
      this.glyph = CODE_GLYPHS[Math.floor(Math.random() * CODE_GLYPHS.length)];
      this.color = codeColor();
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      // 緩慢朝左上飄移，像程式碼往上捲動。
      this.vx = -(0.06 + Math.random() * 0.22);
      this.vy = -(0.1 + Math.random() * 0.34);
      this.baseAlpha = 0.12 + Math.random() * 0.22;
      this.alpha = this.baseAlpha;
      this.bobPhase = Math.random() * Math.PI * 2;
      this.bobSpeed = 0.004 + Math.random() * 0.01;
    }

    // 從底部重新進場並換一個字元，讓畫面不重複。
    recycle() {
      this.glyph = CODE_GLYPHS[Math.floor(Math.random() * CODE_GLYPHS.length)];
      this.color = codeColor();
      this.x = Math.random() * width;
      this.y = height + this.size * 2;
    }

    update() {
      this.bobPhase += this.bobSpeed;
      this.x += this.vx;
      this.y += this.vy + Math.sin(this.bobPhase) * 0.12;

      if (this.y < -this.size * 2) this.recycle();
      if (this.x < -this.size * 3) this.x = width + this.size;

      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let target = this.baseAlpha;
      if (dist < mouse.radius && dist > 0.5) {
        const force = (mouse.radius - dist) / mouse.radius;
        target = Math.min(0.74, this.baseAlpha + force * 0.5);
        this.x -= (dx / dist) * force * 0.5;
        this.y -= (dy / dist) * force * 0.5;
      }
      this.alpha += (target - this.alpha) * 0.09;
    }

    draw() {
      ctx.font = this.font;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fillText(this.glyph, this.x, this.y);
    }
  }

  /* 風格 → 粒子模式註冊表。鍵＝風格鍵（與 theme.js 的 THEMES、data-theme 屬性同名）。
     粒子類別名稱刻意保留視覺描述：Particle（星空點）／EmberParticle（餘燼）／CodeParticle（程式碼字元）。
     新增風格只要在這裡補一筆（粒子類別 / 數量 / 是否畫連線 / 合成模式）。
     count 可以填數字，也可以填回傳數字的函式（需隨視窗大小變動時，例如 cursor 的餘燼）。
     blend：三個風格都用 'source-over'。餘燼原本用 'lighter' 疊加，改成銳利三角形平塗（剪紙感）
     之後，相加提亮會讓重疊的三角形糊成一團白 → 一律一般合成，重疊處只是單純的「疊紙」。
     4.8 移除 dampMouse（滑鼠慣性阻尼）——那是 4.3–4.7 為了「陣風」加的；回到最初版就沒有它。
     注意：必須放在類別定義之後，否則會踩到 class 的 TDZ。 */
  const MODE_SPECS = {
    antigravity: { Ctor: Particle, count: PARTICLE_COUNT, lines: true, blend: 'source-over' },
    vscode: { Ctor: CodeParticle, count: CODE_COUNT, lines: false, blend: 'source-over' },
    cursor: { Ctor: EmberParticle, count: emberCount, lines: false, blend: 'source-over' }
  };

  function specFor(name) {
    return MODE_SPECS[name] || MODE_SPECS.antigravity;
  }

  function countFor(spec) {
    return typeof spec.count === 'function' ? spec.count() : spec.count;
  }

  function spawn() {
    particles = [];
    const spec = specFor(mode);
    const count = countFor(spec);
    for (let i = 0; i < count; i++) {
      particles.push(new spec.Ctor());
    }
  }

  /* 視窗尺寸改變後若目標顆數跟著變了（跨過縮放門檻）就重配一次，
     否則把視窗縮小後會沿用上一個尺寸算出來的密度。 */
  function syncParticleCount() {
    if (countFor(specFor(mode)) !== particles.length) spawn();
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECT_DISTANCE) {
          const alpha = (1 - dist / CONNECT_DISTANCE) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#4facfe';
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Connect to mouse
      const mdx = mouse.x - particles[i].x;
      const mdy = mouse.y - particles[i].y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

      if (mDist < MOUSE_CONNECT_DISTANCE) {
        const alpha = (1 - mDist / MOUSE_CONNECT_DISTANCE) * 0.45;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = '#00f2fe';
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
  }

  let isPaused = false;
  let animationFrameId = null;

  /* 尊重系統的「減少動態」：canvas 不受 CSS 影響，只能在 JS 這裡處理。
     作法是把動畫降級成靜態一幀（不是清空），背景仍有粒子、只是不動。 */
  const reduceMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  let reduceMotion = !!(reduceMotionQuery && reduceMotionQuery.matches);

  function renderFrame() {
    ctx.clearRect(0, 0, width, height);

    const spec = specFor(mode);
    /* 4.8：這裡原本還有「阻尼 mouse.vx／vy（×0.82）」與「每幀算 mouse.speed（陣風用）」兩段；
       4.12 起連 mouse.vx／vy 本身都移除（4.11 之後已無任何讀取者，見檔頭滑鼠輸入處的說明）。 */

    ctx.globalCompositeOperation = spec.blend;
    for (let p of particles) {
      p.update();
      p.draw();
    }
    if (spec.lines) drawLines();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  function animate() {
    if (isPaused) return;

    renderFrame();

    // 減少動態：畫完這一幀就停（要更新時由 setMode／媒體查詢變更再重畫一次）
    if (reduceMotion) {
      animationFrameId = null;
      return;
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  if (reduceMotionQuery) {
    const onReduceMotionChange = (e) => {
      reduceMotion = e.matches;
      if (reduceMotion) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        // 影片全螢幕等暫停狀態下不補畫，維持 pause 的語意
        if (!isPaused) renderFrame();
      } else if (!isPaused && !document.hidden) {
        animate();
      }
    };
    if (reduceMotionQuery.addEventListener) {
      reduceMotionQuery.addEventListener('change', onReduceMotionChange);
    } else if (reduceMotionQuery.addListener) {
      // 舊版 Safari／Edge 只有 addListener
      reduceMotionQuery.addListener(onReduceMotionChange);
    }
  }

  function pause() {
    if (isPaused) return;
    isPaused = true;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function resume() {
    if (!isPaused) return;
    isPaused = false;
    if (!document.hidden) {
      animate();
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    } else {
      if (!isPaused) animate();
    }
  });

  window.NebulaEngine = {
    pause,
    resume,
    setMode(next) {
      const resolved = MODE_SPECS[next] ? next : 'antigravity';
      if (resolved === mode) return;
      mode = resolved;
      /* 互動半徑是共用可變狀態：切風格時一律重設成 160（HEAD 也是這樣做）。
         沒有這行的話，餘燼（4.11 起改用共用 radius）的半徑就變成「靠全檔沒人改它」的隱性耦合。 */
      mouse.radius = 160;
      // 熱源位置隨視窗寬度決定，切風格時重新配置
      refreshEmberSources();
      spawn();
      ctx.clearRect(0, 0, width, height);
      // 減少動態模式下沒有 RAF 在跑，這裡必須自己補畫一幀，否則會停在空白畫面
      if (reduceMotion) renderFrame();
    }
  };

  /* 依載入時的 data-theme 決定起始模式。
     head 的 bootstrap 已先把屬性套上，這裡只要對照註冊表，避免一開始就畫錯模式。 */
  const initialTheme = document.documentElement.getAttribute('data-theme');
  if (MODE_SPECS[initialTheme]) mode = initialTheme;

  spawn();
  ready = true;   // 之後的 resize 才能安全地比對 MODE_SPECS 顆數
  animate();
})();

