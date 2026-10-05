/**
 * Antigravity Plugins Showcase - Category Filtering Engine
 */

/* 搜尋框與 Ctrl+K／「/」快捷鍵已移除，只保留分類篩選。 */
let activeCategory = 'all';

function initFilters() {
  const tabBtns = document.querySelectorAll('.tab-btn');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      renderPlugins();
    });
  });
}

function renderIdeBadges(plugin) {
  const ides = Array.isArray(plugin.ides) ? plugin.ides : IDE_ALL;
  const badges = ides.map((ideId) => {
    const meta = IDE_META[ideId];
    const label = meta ? meta.short : ideId;
    return `<span class="ide-badge ide-${ideId}">${label}</span>`;
  }).join('');

  return `<div class="plugin-ide-row" aria-label="Supported IDEs">${badges}</div>`;
}

function renderIdeNote(plugin) {
  const note = plugin.ideNote && (plugin.ideNote[currentLang] || plugin.ideNote['zh-TW']);
  if (!note) return '';
  return `<p class="plugin-ide-note">${note}</p>`;
}

function renderPlugins() {
  const grid = document.getElementById('plugins-grid');
  if (!grid) return;

  const filtered = PLUGINS_DATA.filter(
    plugin => activeCategory === 'all' || plugin.category === activeCategory
  );

  // 保險用的空狀態：搜尋移除後，只有分類標籤與資料對不上時才會走到這裡。
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="section-title">${t('empty_filter_title')}</h3>
        <p class="section-desc">${t('empty_filter_desc')}</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(plugin => {
    const name = plugin.name[currentLang] || plugin.name['zh-TW'];
    const desc = plugin.shortDesc[currentLang] || plugin.shortDesc['zh-TW'];
    const features = plugin.features[currentLang] || plugin.features['zh-TW'];

    return `
      <article class="plugin-card" data-plugin-id="${plugin.id}">
        <div>
          <div class="card-top">
            <div class="card-icon-wrapper ${plugin.themeClass || 'icon-theme-cyan'}">
              <img src="${plugin.icon}" alt="${name}" />
            </div>
            <div class="card-badges">
              <span class="badge badge-type">${plugin.tags[0] || 'Plugin'}</span>
              <span class="badge badge-version">v${plugin.version}</span>
            </div>
          </div>
          
          <h3 class="plugin-name">${name}</h3>
          <div class="plugin-id">${plugin.id}</div>
          ${renderIdeBadges(plugin)}
          <p class="plugin-desc">${desc}</p>
          ${renderIdeNote(plugin)}
          
          <ul class="feature-list">
            ${features.slice(0, 3).map(feat => `<li class="feature-item">${feat}</li>`).join('')}
          </ul>
        </div>
        
        <div class="card-actions">
          <a href="${plugin.repoUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-github" title="${t('btn_card_github_title') || 'GitHub Repository'}">
            <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            <span>${t('btn_github_repo')}</span>
          </a>
        </div>
      </article>
    `;
  }).join('');
}
