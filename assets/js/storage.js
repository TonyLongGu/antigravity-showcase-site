/**
 * Antigravity Plugins Showcase - 安全儲存層 (Safe Storage)
 *
 * 為什麼需要這一層？
 *   localStorage 在「無痕模式」、「第三方儲存封鎖」、「企業政策」或「配額已滿」時
 *   會直接 throw（而非回傳 null）。裸呼叫將中斷整個腳本的初始化流程，
 *   導致播放器與多語系一起失效（白畫面級別的故障）。
 *
 * 本層以 try/catch + 記憶體備援完整包裝，對外介面與 localStorage 相容：
 *   讀取 SafeStorage.get(key, defaultValue)
 *   寫入 SafeStorage.set(key, value)
 *   移除 SafeStorage.remove(key)
 */
const SafeStorage = (function () {
  const memoryFallback = {};
  let isAvailable = false;

  // 一次性探測：確認瀏覽器真的允許寫入，而非等到使用者操作時才爆炸
  try {
    const probeKey = '__antigravity_storage_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    isAvailable = true;
  } catch (err) {
    isAvailable = false;
    console.warn('[SafeStorage] localStorage 無法使用，已切換為記憶體備援（設定不會跨頁保留）:', err && err.message);
  }

  return {
    isAvailable,

    get(key, defaultValue = null) {
      try {
        if (isAvailable) {
          const value = window.localStorage.getItem(key);
          return value === null ? defaultValue : value;
        }
      } catch (err) {
        console.warn(`[SafeStorage] 讀取失敗 (${key})，改用記憶體備援:`, err && err.message);
      }
      return Object.prototype.hasOwnProperty.call(memoryFallback, key) ? memoryFallback[key] : defaultValue;
    },

    set(key, value) {
      const text = String(value);
      memoryFallback[key] = text;
      try {
        if (isAvailable) window.localStorage.setItem(key, text);
      } catch (err) {
        console.warn(`[SafeStorage] 寫入失敗 (${key})，僅保留於記憶體:`, err && err.message);
      }
    },

    remove(key) {
      delete memoryFallback[key];
      try {
        if (isAvailable) window.localStorage.removeItem(key);
      } catch (err) {
        console.warn(`[SafeStorage] 移除失敗 (${key}):`, err && err.message);
      }
    }
  };
})();
