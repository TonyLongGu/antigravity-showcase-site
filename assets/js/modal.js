/**
 * Antigravity Plugins Showcase - Plugin Detail Modal Component
 */

let activeModalPlugin = null;
let activeModalTab = 'features';

function initModal() {
  const overlay = document.getElementById('plugin-modal-overlay');
  const closeBtn = document.getElementById('btn-modal-close');

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closePluginModal();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closePluginModal);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
      closePluginModal();
    }
  });
}

function openPluginModal(pluginId) {
  const plugin = PLUGINS_DATA.find(p => p.id === pluginId);
  if (!plugin) return;

  activeModalPlugin = plugin;
  activeModalTab = 'features';

  const overlay = document.getElementById('plugin-modal-overlay');
  const iconEl = document.getElementById('modal-icon');
  const titleEl = document.getElementById('modal-title');
  const subtitleEl = document.getElementById('modal-subtitle');

  if (iconEl) {
    iconEl.className = `modal-icon ${plugin.themeClass || 'icon-theme-cyan'}`;
    iconEl.innerHTML = `<img src="${plugin.icon}" alt="${plugin.id}" />`;
  }
  if (titleEl) titleEl.textContent = plugin.name[currentLang] || plugin.name['zh-TW'];
  if (subtitleEl) subtitleEl.textContent = `${plugin.id} • v${plugin.version}`;

  renderModalTabs();
  renderModalBody();

  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closePluginModal() {
  const overlay = document.getElementById('plugin-modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  activeModalPlugin = null;
}

function switchModalTab(tabKey) {
  activeModalTab = tabKey;
  renderModalTabs();
  renderModalBody();
}

function renderModalTabs() {
  const nav = document.getElementById('modal-nav');
  if (!nav) return;

  const tabs = [
    { key: 'features', label: t('modal_tab_features') },
    { key: 'commands', label: t('modal_tab_commands') },
    { key: 'config', label: t('modal_tab_config') },
    { key: 'install', label: t('modal_tab_install') }
  ];

  nav.innerHTML = tabs.map(tab => `
    <button class="modal-tab-btn ${activeModalTab === tab.key ? 'active' : ''}" onclick="switchModalTab('${tab.key}')">
      ${tab.label}
    </button>
  `).join('');
}

function renderModalBody() {
  const body = document.getElementById('modal-body');
  if (!body || !activeModalPlugin) return;

  const plugin = activeModalPlugin;
  const lang = currentLang;

  if (activeModalTab === 'features') {
    const features = plugin.features[lang] || plugin.features['zh-TW'];
    body.innerHTML = `
      <div class="modal-tab-pane active">
        <p style="font-size: 1.05rem; margin-bottom: 24px; color: var(--text-primary);">
          ${plugin.shortDesc[lang] || plugin.shortDesc['zh-TW']}
        </p>
        <h4 style="margin-bottom: 14px; color: var(--accent-cyan);">${t('modal_tab_features')}</h4>
        <ul class="feature-list" style="gap: 14px;">
          ${features.map(f => `<li class="feature-item" style="font-size: 0.95rem;">${f}</li>`).join('')}
        </ul>
        <div style="margin-top: 28px; display: flex; gap: 8px; flex-wrap: wrap;">
          ${plugin.tags.map(tag => `<span class="badge badge-type">${tag}</span>`).join('')}
        </div>
      </div>
    `;
  } else if (activeModalTab === 'commands') {
    if (plugin.commands.length === 0) {
      body.innerHTML = `<p style="color: var(--text-muted);">無註冊全域命令 (No custom commands registered)</p>`;
      return;
    }
    body.innerHTML = `
      <div class="modal-tab-pane active">
        <table class="tech-table">
          <thead>
            <tr>
              <th>${t('modal_table_cmd_name')}</th>
              <th>${t('modal_table_cmd_id')}</th>
            </tr>
          </thead>
          <tbody>
            ${plugin.commands.map(cmd => `
              <tr>
                <td style="font-weight: 500;">${cmd.name}</td>
                <td><code>${cmd.id}</code></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (activeModalTab === 'config') {
    if (!plugin.configurations || plugin.configurations.length === 0) {
      body.innerHTML = `
        <div class="modal-tab-pane active" style="padding: 24px 0; text-align: center; color: var(--text-muted);">
          <span>⚡ 此套件為即開即用型，無需額外進行 settings.json 複雜設定。</span>
        </div>
      `;
      return;
    }
    body.innerHTML = `
      <div class="modal-tab-pane active">
        <table class="tech-table">
          <thead>
            <tr>
              <th>${t('modal_table_cfg_key')}</th>
              <th>${t('modal_table_cfg_type')}</th>
              <th>${t('modal_table_cfg_default')}</th>
              <th>${t('modal_table_cfg_desc')}</th>
            </tr>
          </thead>
          <tbody>
            ${plugin.configurations.map(cfg => `
              <tr>
                <td><code>${cfg.key}</code></td>
                <td><span class="badge badge-version">${cfg.type}</span></td>
                <td><code>${cfg.default}</code></td>
                <td>${cfg.desc[lang] || cfg.desc['zh-TW']}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (activeModalTab === 'install') {
    const mainRepoUrl = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG.githubUrl : 'https://github.com/TonyLongGu/antigravity-plugins';
    body.innerHTML = `
      <div class="modal-tab-pane active">
        <div style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; background: rgba(0, 242, 254, 0.05); padding: 12px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-glow);">
          <div>
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">GitHub 插件源碼目錄</div>
            <a href="${plugin.repoUrl}" target="_blank" rel="noopener noreferrer" style="font-weight: 600; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 6px;">
              <span>📦</span> ${plugin.repoUrl} <span>↗</span>
            </a>
          </div>
          <a href="${mainRepoUrl}" target="_blank" rel="noopener noreferrer" class="btn-github" style="padding: 6px 14px; font-size: 0.82rem;">
            前往 GitHub Star ⭐
          </a>
        </div>

        <h4 style="margin-bottom: 12px; color: var(--text-primary);">步驟一：Clone 生態套件庫至本地</h4>
        <div class="code-snippet" style="margin-bottom: 16px;">
          <code>${plugin.cloneCmd}</code>
          <button class="btn-copy" onclick="copyToClipboard('${plugin.cloneCmd}', '已複製 Clone 指令！')">${t('btn_copy_cmd')}</button>
        </div>

        <h4 style="margin-bottom: 12px; color: var(--text-primary);">步驟二：執行該插件免編譯安裝腳本</h4>
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 8px;">
          進入目錄後雙擊 <code>install-extension.bat</code>（或在終端機執行下方指令）：
        </p>
        <div class="code-snippet" style="margin-bottom: 20px;">
          <code>${plugin.installCmd}</code>
          <button class="btn-copy" onclick="copyToClipboard('${plugin.installCmd}', '已複製安裝指令！')">${t('btn_copy_cmd')}</button>
        </div>

        <h4 style="margin-bottom: 8px; color: var(--text-primary);">步驟三：重新載入視窗生效</h4>
        <p style="font-size: 0.9rem; color: var(--text-muted);">
          💡 於 Antigravity IDE 按快捷鍵 <kbd>Ctrl + Shift + P</kbd> 執行 <code>Developer: Reload Window</code> 即可完成載入！
        </p>
      </div>
    `;
  }
}
