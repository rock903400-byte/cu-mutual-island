/* ==========================================================================
   8 大互助基金速查圖鑑（支援關鍵字即時篩選、分頁切換、遊戲暫停連動）
   ========================================================================== */
window.HANDBOOK = (function () {
  let activeTab = 'all';
  let searchQuery = '';

  function renderTabs() {
    const wrap = document.getElementById('handbook-tabs');
    if (!wrap) return;
    const tabs = [{ id: 'all', label: '📚 全部 8 大基金' }, ...window.FUNDS_DATA.map(f => ({ id: f.id, label: `${f.icon} ${f.shortName}` }))];
    wrap.innerHTML = tabs.map(t => `
      <button class="hb-tab ${activeTab === t.id ? 'active' : ''}" data-hb-tab="${t.id}">${t.label}</button>
    `).join('');
    wrap.querySelectorAll('.hb-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        window.SOUND.click();
        activeTab = btn.dataset.hbTab;
        renderTabs();
        renderCards();
      });
    });
  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  // 共用的基金條款卡（圖鑑、導覽站「完整條款」都用這一份）
  function renderFundDoc(f, { showHead = true } = {}) {
    if (!f) return '';
    return `
      <article class="fund-doc-card" style="--fund-color:${f.color}">
        ${showHead ? `
          <div class="fund-doc-head">
            <h3>${f.icon} ${f.name}</h3>
            <span class="fund-period-pill">📄 ${f.sourcePdf}</span>
          </div>
        ` : `<span class="fund-period-pill">📄 ${f.sourcePdf}</span>`}
        <p style="margin:0 0 10px;color:#5C4B42;font-size:0.93rem;">${f.summary}</p>
        <div class="fund-kv-grid">
          <div class="fund-kv"><strong>📅 保障期間</strong>${f.period}</div>
          <div class="fund-kv"><strong>⏰ 送件／受理期限</strong>${f.deadline}</div>
          <div class="fund-kv"><strong>🎂 年齡與資格限制</strong>${f.ageRule}</div>
        </div>
        ${f.plansTable ? `
          <div style="overflow-x:auto;">
            <table class="fund-table">
              <thead><tr>${f.plansTable.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
              <tbody>
                ${f.plansTable.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
        <ul class="fund-highlights">
          ${f.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
      </article>
    `;
  }

  // 導覽站的白話內容也一起搜（v16）
  function tourStrings(fundId) {
    const s = window.TOUR_CONTENT && window.TOUR_CONTENT.stops ? window.TOUR_CONTENT.stops[fundId] : null;
    if (!s) return [];
    return [
      s.oneLiner,
      ...(s.suits || []), ...(s.notFor || []), ...(s.keyCautions || []), ...(s.cautions || []),
      ...((s.plans && s.plans.rows) || []).map(r => `${r.name} ${r.fee} ${r.line}`),
      ...(s.stories || []).flatMap(st => [st.title, st.happened, st.result, st.tip])
    ];
  }

  function matchesQuery(fund, q) {
    if (!q) return true;
    const norm = (str) => String(str || '').replace(/\s+/g, '').toLowerCase();
    const blob = norm([
      fund.name, fund.shortName, fund.period, fund.deadline, fund.ageRule, fund.summary,
      ...(fund.highlights || []),
      ...(fund.plansTable?.rows?.flat() || []),
      ...tourStrings(fund.id)
    ].join(' '));
    return blob.includes(norm(q));
  }

  function renderCards() {
    const body = document.getElementById('handbook-body');
    if (!body) return;
    const list = window.FUNDS_DATA.filter(f => {
      if (activeTab !== 'all' && f.id !== activeTab) return false;
      return matchesQuery(f, searchQuery);
    });

    if (list.length === 0) {
      body.innerHTML = `<p style="text-align:center;padding:30px;color:#8B766A;">找不到符合「<strong>${escapeHtml(searchQuery)}</strong>」的條款內容，試試改搜「85歲」「退股」「等待期」「馴獸師」「25」吧！</p>`;
      return;
    }

    body.innerHTML = list.map(f => renderFundDoc(f)).join('');
  }

  function init() {
    const input = document.getElementById('handbook-search');
    if (input) {
      input.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderCards();
      });
    }
    renderTabs();
    renderCards();
  }

  function open(focusFundId = 'all') {
    activeTab = focusFundId;
    searchQuery = '';
    const input = document.getElementById('handbook-search');
    if (input) input.value = '';
    renderTabs();
    renderCards();
    document.getElementById('modal-handbook')?.classList.remove('hidden');
  }

  return { init, open, renderFundDoc, escapeHtml };
})();
