/* ==========================================================================
   互助島導覽（v16）：身分路線 × 站卡 × 上一站／下一站 × 協作線 × 手機半高抽屜
   - 不計分、不計時、不會答錯；只記「已逛 N／8 站」。
   - 畫面沿用 #side-drawer 的 #drawer-explore；底部固定列用 #tour-bottom-bar。
   - island3d.js 是 module、最後才執行，WebGL 失敗或 file:// 時不存在 → 一律先判斷 window.ISLAND_3D。
   ========================================================================== */
window.TOUR = (function () {
  let currentView = null;   // 'home' | 'stop' | 'done' | null
  let currentStopId = null;
  let currentSeq = [];
  let greeted = false;
  const mqMobile = window.matchMedia('(max-width: 820px)');

  const C = () => window.TOUR_CONTENT;
  const I = () => window.ISLAND_3D;
  const fundOf = (id) => (window.FUNDS_DATA || []).find(f => f.id === id);
  const stopNo = (id) => C().order.indexOf(id) + 1;

  function visitedList() {
    return (window.STORAGE.getTour().visited || []).filter(id => C().order.includes(id));
  }

  function getPersonaKey() {
    const key = window.STORAGE.getTour().persona;
    return C().personas[key] ? key : 'all';
  }

  function getPersona(key = getPersonaKey()) {
    return C().personas[key] || C().personas.all;
  }

  function getRoute(key = getPersonaKey()) {
    return getPersona(key).route.filter(id => fundOf(id));
  }

  function imgTag(key, alt, cls) {
    const url = window.ASSETS_MANIFEST && window.ASSETS_MANIFEST.getImageUrl(key);
    return url ? `<img class="${cls}" src="${url}" alt="${alt}" loading="lazy" />` : '';
  }

  /* ---------------- 抽屜、底部列、半高抽屜與 3D 鏡頭偏移 ---------------- */
  function showDrawer(title, sub, html) {
    window.APP.showExploreDrawer(title, sub, html, { tour: true });
  }

  function setTourBar(html) {
    const bar = document.getElementById('tour-bottom-bar');
    if (!bar) return;
    bar.innerHTML = html || '';
    bar.classList.toggle('hidden', !html);
  }

  function syncExpandBtn() {
    const drawer = document.getElementById('side-drawer');
    const btn = document.getElementById('btn-expand-drawer');
    if (!drawer || !btn) return;
    const full = drawer.classList.contains('tour-sheet-full');
    btn.textContent = full ? '⤡' : '⤢';
    btn.setAttribute('aria-label', full ? '縮小，露出島嶼' : '展開成全螢幕');
    btn.title = full ? '縮小，露出島嶼' : '展開成全螢幕';
  }

  // 每換一個導覽畫面都先回到半高（看得到島上飛到哪一站），往下捲才自動展開
  let userCollapsed = false;
  function applySheet(on) {
    const drawer = document.getElementById('side-drawer');
    if (!drawer) return;
    drawer.classList.toggle('tour-sheet', Boolean(on));
    drawer.classList.remove('tour-sheet-full');
    userCollapsed = false;
    syncExpandBtn();
    requestAnimationFrame(updateViewInset);
  }

  // 手機：往下捲內容時自動展開成全螢幕，讀起來比較不擠（使用者自己按 ⤡ 縮小後，這一頁就不再自動展開）
  function onBodyScroll(e) {
    const drawer = document.getElementById('side-drawer');
    if (!drawer || !mqMobile.matches || userCollapsed) return;
    if (!drawer.classList.contains('tour-sheet') || drawer.classList.contains('tour-sheet-full')) return;
    if (e.currentTarget.scrollTop > 60) {
      drawer.classList.add('tour-sheet-full');
      syncExpandBtn();
      requestAnimationFrame(updateViewInset);
    }
  }

  // 讓 3D 島上「目前這站」落在抽屜沒蓋住的地方（手機：上方；桌機：左側）
  function updateViewInset() {
    const isl = I();
    if (!isl || !isl.setViewInset) return;
    const drawer = document.getElementById('side-drawer');
    const active = drawer && !drawer.classList.contains('hidden') && drawer.classList.contains('tour-sheet');
    if (!active) { isl.setViewInset(null); return; }
    // 用 CSS 位置算（抽屜滑入動畫會讓 getBoundingClientRect 暫時不準）
    if (mqMobile.matches) {
      if (drawer.classList.contains('tour-sheet-full')) { isl.setViewInset(null); return; }
      const top = parseFloat(getComputedStyle(drawer).top) || 0;
      isl.setViewInset({ bottom: Math.max(0, window.innerHeight - top), right: 0 });
    } else {
      isl.setViewInset({ bottom: 0, right: drawer.offsetWidth + 14 });
    }
  }

  function toggleExpand() {
    const drawer = document.getElementById('side-drawer');
    if (!drawer) return;
    const nowFull = drawer.classList.toggle('tour-sheet-full');
    if (!nowFull) userCollapsed = true;
    syncExpandBtn();
    requestAnimationFrame(updateViewInset);
  }

  /* ---------------- 3D 島同步：站號名牌、已逛、目前這站、協作線 ---------------- */
  function syncIsland() {
    const isl = I();
    if (!isl) return;
    isl.syncTour && isl.syncTour({ order: C().order, visited: visitedList() });
    isl.setActiveStop && isl.setActiveStop(currentView === 'stop' ? currentStopId : null);
    if (isl.setTourLinks) {
      if (currentView === 'stop' && currentStopId) {
        const s = C().stops[currentStopId];
        const pairs = (s && s.pairs ? s.pairs : []).filter(p => fundOf(p.to)).map(p => [currentStopId, p.to]);
        isl.setTourLinks(pairs);
      } else {
        isl.setTourLinks(null);
      }
    }
  }

  function onIslandReady() {
    const key = getPersonaKey();
    const isl = I();
    if (isl && isl.setStageFilter) isl.setStageFilter(key, key === 'all' ? null : getRoute(key));
    syncIsland();
  }

  /* ---------------- 共用片段 ---------------- */
  function section(title, items, kind) {
    if (!items || !items.length) return '';
    return `
      <section class="tour-sec tour-sec-${kind}">
        <h4>${title}</h4>
        <ul>${items.map(t => `<li>${t}</li>`).join('')}</ul>
      </section>`;
  }

  function renderHero(f) {
    return `
      <div class="tour-hero">
        <span class="tour-hero-ico">${f.icon}</span>
        <div class="tour-hero-txt">
          <small>${stopNo(f.id)} 號站</small>
          <h3>${f.name}</h3>
        </div>
      </div>`;
  }

  function renderPlans(p) {
    if (!p || !p.rows || !p.rows.length) return '';
    return `
      <section class="tour-sec tour-sec-plans">
        <h4>${p.title || '📋 方案一次看'}</h4>
        <div class="tour-plan-list">
          ${p.rows.map(r => `
            <div class="tour-plan-row">
              <div class="tour-plan-head"><strong>${r.name}</strong><span>${r.fee}</span></div>
              <p>${r.line}</p>
            </div>`).join('')}
        </div>
        ${p.note ? `<p class="tour-plan-note">※ ${p.note}</p>` : ''}
      </section>`;
  }

  function renderQuotes(s) {
    const quotes = s.quotes || (s.quote ? [s.quote] : []);
    return quotes.map(q => `<blockquote class="tour-quote">「${q.text}」<cite>── ${q.source}</cite></blockquote>`).join('');
  }

  function renderStory(st) {
    const img = imgTag(st.imgKey, st.who, 'tour-story-img');
    return `
      <div class="tour-story">
        <div class="tour-story-head">
          ${img ? `<span class="tour-story-av">${img}</span>` : ''}
          <div><strong>${st.title}</strong><small>${st.who}</small></div>
        </div>
        <p class="tour-story-line"><b>發生什麼：</b>${st.happened}</p>
        <p class="tour-story-line tour-story-result"><b>結果：</b>${st.result}</p>
        ${st.tip ? `<p class="tour-story-tip">💡 ${st.tip}</p>` : ''}
      </div>`;
  }

  const DISCLAIMER = '<p class="tour-disclaimer">本頁依中華民國儲蓄互助協會各項互助基金簡介整理，詳細內容以協會公告、條款及各社證書為準。</p>';

  function renderStop(f, s, personaKey) {
    const p = getPersona(personaKey);
    const note = personaKey !== 'all' && s.personaNotes ? s.personaNotes[personaKey] : '';
    const pairs = (s.pairs || []).map(pr => {
      const pf = fundOf(pr.to);
      if (!pf) return '';
      return `
        <button type="button" class="tour-pair-btn" style="--fund-color:${pf.color}" data-tour-go="${pf.id}">
          <strong>${pf.icon} ${stopNo(pf.id)} 號站｜${pf.shortName} →</strong>
          <span>${pr.why}</span>
        </button>`;
    }).join('');
    return `
      <article class="tour-stop" style="--fund-color:${f.color}">
        ${renderHero(f)}
        <p class="tour-oneliner">${s.oneLiner}</p>
        ${note ? `<p class="tour-persona-note">${p.icon} ${note}</p>` : ''}
        <div class="tour-keynums">
          ${(s.keyNumbers || []).map(k => `<div class="tour-keynum"><small>${k.label}</small><strong>${k.value}</strong></div>`).join('')}
        </div>
        ${renderPlans(s.plans)}
        ${section('👍 適合誰', s.suits, 'suits')}
        ${section(s.notForTitle || '🚫 不適合誰', s.notFor, 'notfor')}
        ${section('⚠️ 要注意', s.cautions, 'caution')}
        ${(s.stories || []).length ? `<section class="tour-sec tour-sec-story"><h4>🎭 狀況劇</h4>${s.stories.map(renderStory).join('')}</section>` : ''}
        ${pairs ? `<section class="tour-sec tour-sec-pairs"><h4>🔗 可以搭配</h4><div class="tour-pairs">${pairs}</div></section>` : ''}
        <details class="tour-terms">
          <summary>📄 看完整條款與簡章原文</summary>
          ${renderQuotes(s)}
          ${window.HANDBOOK.renderFundDoc(f, { showHead: false })}
        </details>
        ${DISCLAIMER}
      </article>`;
  }

  function renderFallback(f) {
    return `
      <article class="tour-stop" style="--fund-color:${f.color}">
        ${renderHero(f)}
        <p class="tour-wip">🚧 這一站的白話導覽（適合誰、要注意、狀況劇）還在製作，先看條款整理：</p>
        ${window.HANDBOOK.renderFundDoc(f, { showHead: false })}
        ${DISCLAIMER}
      </article>`;
  }

  // 路線名稱已經寫在抽屜標題下方，這裡只放進度與「清單」，手機 360px 也排得下
  function renderBar(seq, idx) {
    const hasPrev = idx > 0;
    const hasNext = idx < seq.length - 1;
    return `
      <div class="tour-nav">
        <button type="button" class="tour-nav-btn" data-tour-prev ${hasPrev ? '' : 'disabled'}>← 上一站</button>
        <button type="button" class="tour-nav-mid" data-tour-home title="回導覽首頁" aria-label="第 ${idx + 1} 站，共 ${seq.length} 站；回導覽清單">
          <strong>${idx + 1}／${seq.length}</strong>
          <small>📋 清單</small>
        </button>
        <button type="button" class="tour-nav-btn tour-nav-next" data-tour-next>${hasNext ? '下一站 →' : '🏁 逛完了'}</button>
      </div>`;
  }

  /* ---------------- 三個畫面：首頁、站卡、逛完 ---------------- */
  function openHome() {
    window.SOUND && window.SOUND.ensureBgm();
    if (!greeted) {
      greeted = true;
      window.SOUND && window.SOUND.playVoice('taigi_welcome');
    }
    const personaKey = getPersonaKey();
    const persona = getPersona(personaKey);
    const route = getRoute(personaKey);
    const visited = visitedList();
    const first = fundOf(route[0]);
    const mascot = imgTag('mascot_host', '互助小管家', 'tour-welcome-img');

    const html = `
      <div class="tour-home">
        <div class="tour-welcome">
          <span class="tour-welcome-av">${mascot || '🧭'}</span>
          <div>
            <strong>小管家帶你逛互助島</strong>
            <p>島上有號碼的 8 個地標，就是 8 個互助基金。不考試、不計時，看完就知道適合誰、要注意什麼。</p>
          </div>
        </div>

        <h4 class="tour-h">① 先選你是誰</h4>
        <div class="tour-persona-grid">
          ${C().personaOrder.map(k => {
            const p = C().personas[k];
            const av = imgTag(p.imgKey, p.label, 'tour-persona-img');
            return `
              <button type="button" class="tour-persona-btn ${k === personaKey ? 'active' : ''}" data-persona="${k}" aria-pressed="${k === personaKey}">
                <span class="tour-persona-av">${av || p.icon}</span>
                <span class="tour-persona-txt"><strong>${p.icon} ${p.label}</strong><small>${p.short}</small></span>
              </button>`;
          }).join('')}
        </div>

        <div class="tour-route-box">
          <strong class="tour-route-title">${persona.icon} ${persona.label}路線・${route.length} 站</strong>
          <p>${persona.intro}</p>
          <ol class="tour-route-steps">
            ${route.map(id => { const f = fundOf(id); return `<li>${f.icon} ${f.shortName}${visited.includes(id) ? ' <span class="tour-done-mark">✅</span>' : ''}</li>`; }).join('')}
          </ol>
          <button type="button" class="btn-primary btn-full tour-start-btn" data-tour-start>② 從第 1 站開始：${first.icon} ${first.shortName} →</button>
        </div>

        <h4 class="tour-h">🔍 想查什麼？點一下</h4>
        ${renderChips()}

        <h4 class="tour-h">或直接挑一站看</h4>
        <div class="tour-stop-list">
          ${C().order.map(id => {
            const f = fundOf(id);
            const v = visited.includes(id);
            return `
              <button type="button" class="tour-stop-row ${v ? 'visited' : ''}" style="--fund-color:${f.color}" data-tour-go="${id}">
                <span class="tour-stop-pill">${stopNo(id)}</span>
                <span class="tour-stop-label">${f.icon} ${f.shortName}</span>
                <span class="tour-stop-state">${v ? '✅ 已逛' : '看介紹 →'}</span>
              </button>`;
          }).join('')}
        </div>

        ${visited.length ? '<button type="button" class="btn-secondary btn-full tour-challenge-btn" data-tour-routecard>🖼️ 我的路線卡（可傳 LINE）</button>' : ''}
        <button type="button" class="btn-secondary btn-full tour-challenge-btn" data-open-challenge>🎮 挑戰區：5 個小遊戲</button>
        ${DISCLAIMER}
      </div>`;

    currentView = 'home';
    currentStopId = null;
    currentSeq = route;
    showDrawer('🧭 互助島導覽', `已逛 ${visited.length}／${C().order.length} 站・不考試、不計時`, html);
    setTourBar('');
    applySheet(true);
    syncIsland();
  }

  function openStop(id) {
    const f = fundOf(id);
    if (!f) return;
    window.SOUND && window.SOUND.ensureBgm();
    const personaKey = getPersonaKey();
    const persona = getPersona(personaKey);
    const route = getRoute(personaKey);
    const inRoute = route.includes(id);
    const seq = inRoute ? route : C().order.slice();
    const idx = seq.indexOf(id);
    const { isNew } = window.STORAGE.markVisited(id);
    const s = C().stops[id];

    currentView = 'stop';
    currentStopId = id;
    currentSeq = seq;
    const sub = inRoute && personaKey !== 'all'
      ? `${persona.icon} ${persona.label}路線・第 ${idx + 1}／${seq.length} 站`
      : `全部 8 站・第 ${idx + 1}／${seq.length} 站`;
    showDrawer(`${f.icon} ${stopNo(id)} 號站｜${f.shortName}`, sub, s ? renderStop(f, s, personaKey) : renderFallback(f));
    setTourBar(renderBar(seq, idx));
    applySheet(true);

    const isl = I();
    // 導覽鏡頭拉遠一點：手機上方只剩約四成畫面，要看得到這站和旁邊幾站
    isl && isl.focusById && isl.focusById(id, null, { distance: mqMobile.matches ? 2.1 : 1.5 });
    syncIsland();
    if (isNew && isl && isl.pulseBooth) isl.pulseBooth(id, true);
    window.APP.syncIslandAndHud();
  }

  function openDone() {
    const personaKey = getPersonaKey();
    const p = getPersona(personaKey);
    const route = getRoute(personaKey);
    const visited = visitedList();
    const allDone = C().order.every(id => visited.includes(id));
    const html = `
      <div class="tour-done">
        <div class="tour-done-badge">🎉</div>
        <h3>${p.icon} ${p.label}路線逛完了！</h3>
        <p>這條路線的 ${route.length} 站都看過了。${allDone ? '全島 8 站也都逛完了，你已經是互助島導覽達人！' : `全島 8 站已經逛了 ${visited.length} 站。`}</p>
        <div class="tour-done-actions">
          <button type="button" class="btn-accent btn-full" data-tour-routecard>🖼️ 做我的路線卡（可傳 LINE）</button>
          <button type="button" class="btn-primary btn-full" data-tour-home>🧭 換一條路線／看其他站</button>
          <button type="button" class="btn-secondary btn-full" data-open-challenge>🎮 到挑戰區考考自己</button>
          <button type="button" class="btn-secondary btn-full" data-tour-close>🏝️ 回島上逛逛</button>
        </div>
        ${DISCLAIMER}
      </div>`;
    currentView = 'done';
    currentStopId = null;
    showDrawer('🎉 路線完成', `${p.icon} ${p.label}・${route.length} 站`, html);
    setTourBar('');
    applySheet(true);
    syncIsland();
    const isl = I();
    if (isl) {
      isl.focusById && isl.focusById('hub');
      setTimeout(() => {
        isl.triggerFireworks && isl.triggerFireworks('hub', allDone);
        window.SOUND && window.SOUND.confetti();
      }, 380);
    }
  }

  /* ---------------- 查基金：關鍵字找出在哪幾站 ---------------- */
  const esc = (s) => (window.HANDBOOK && window.HANDBOOK.escapeHtml ? window.HANDBOOK.escapeHtml(s) : String(s ?? ''));
  const normalize = (s) => String(s ?? '').replace(/\s+/g, '').toLowerCase();

  // 一站的所有句子：先放白話導覽，再放原本的條款整理（片段優先取導覽的句子）
  function collectSentences(id) {
    const out = [];
    const s = C().stops[id];
    if (s) {
      out.push(s.oneLiner);
      (s.keyNumbers || []).forEach(k => out.push(`${k.label}：${k.value}`));
      (s.plans && s.plans.rows ? s.plans.rows : []).forEach(r => out.push(`${r.name}（${r.fee}）${r.line}`));
      [s.suits, s.notFor, s.cautions].forEach(list => (list || []).forEach(t => out.push(t)));
      (s.stories || []).forEach(st => out.push(st.title, st.happened, st.result, st.tip));
      (s.pairs || []).forEach(p => out.push(p.why));
      Object.values(s.personaNotes || {}).forEach(t => out.push(t));
    }
    const f = fundOf(id);
    if (f) {
      out.push(f.name, f.summary, f.ageRule, f.period, f.deadline, ...(f.highlights || []));
      (f.plansTable && f.plansTable.rows ? f.plansTable.rows : []).forEach(r => out.push(r.join(' ')));
    }
    return out.filter(Boolean);
  }

  function searchStops(q) {
    const nq = normalize(q);
    if (!nq) return [];
    return C().order.map(id => {
      const hit = collectSentences(id).find(t => normalize(t).includes(nq));
      return hit ? { id, snippet: hit } : null;
    }).filter(Boolean);
  }

  function highlight(snippet, q) {
    const safe = esc(snippet);
    const sq = esc(q.trim());
    const i = sq ? safe.indexOf(sq) : -1;
    if (i < 0) return safe;
    return `${safe.slice(0, i)}<mark>${sq}</mark>${safe.slice(i + sq.length)}`;
  }

  function renderChips(active = '') {
    return `<div class="tour-chip-row">${(C().searchChips || []).map(c => `
      <button type="button" class="tour-chip ${normalize(c) === normalize(active) ? 'active' : ''}" data-tour-search="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
  }

  function openSearch(q = '') {
    window.SOUND && window.SOUND.ensureBgm();
    const query = String(q || '').trim().slice(0, 30);
    const results = query ? searchStops(query) : [];
    const list = !query
      ? '<p class="tour-empty">點上面的關鍵字，或自己打字找。</p>'
      : results.length
        ? `<h4 class="tour-h">「${esc(query)}」出現在這 ${results.length} 站</h4>
           <div class="tour-result-list">
             ${results.map(r => {
               const f = fundOf(r.id);
               return `
                 <button type="button" class="tour-result-row" style="--fund-color:${f.color}" data-tour-go="${r.id}">
                   <strong><span class="tour-stop-pill">${stopNo(r.id)}</span>${f.icon} ${f.shortName} →</strong>
                   <span>${highlight(r.snippet, query)}</span>
                 </button>`;
             }).join('')}
           </div>`
        : `<p class="tour-empty">找不到「${esc(query)}」，換個詞試試，或點上面的關鍵字。</p>`;
    const html = `
      <div class="tour-search">
        <div class="tour-search-box">
          <input type="search" id="tour-search-input" class="search-input" maxlength="30" placeholder="打字找：例如 住院、骨折、70 歲" value="${esc(query)}" />
          <button type="button" class="btn-primary" data-tour-search-go>找</button>
        </div>
        ${renderChips(query)}
        ${list}
        <div class="tour-search-more">
          <button type="button" class="btn-secondary btn-full" data-tour-handbook>📖 看 8 大基金完整條款（圖鑑）</button>
          <button type="button" class="btn-secondary btn-full" data-tour-home>🧭 回導覽首頁</button>
        </div>
        ${DISCLAIMER}
      </div>`;
    currentView = 'search';
    currentStopId = null;
    showDrawer('🔍 查基金', '點關鍵字，看看在哪幾站', html);
    setTourBar('');
    applySheet(true);
    syncIsland();
  }

  /* ---------------- 我的互助島路線卡（可傳 LINE） ---------------- */
  function getRouteCardData() {
    const personaKey = getPersonaKey();
    return {
      persona: getPersona(personaKey),
      route: getRoute(personaKey),
      visited: visitedList(),
      total: C().order.length,
      stops: C().stops,
      funds: window.FUNDS_DATA || [],
      stopNo
    };
  }

  function openRouteCard() {
    const nick = document.getElementById('route-card-nickname');
    if (nick) nick.value = window.STORAGE.load().nickname;
    window.SHARE_CARD && window.SHARE_CARD.renderRoute(getRouteCardData());
    document.getElementById('modal-route-card')?.classList.remove('hidden');
  }

  function next() {
    const idx = currentSeq.indexOf(currentStopId);
    if (idx >= 0 && idx < currentSeq.length - 1) openStop(currentSeq[idx + 1]);
    else openDone();
  }

  function prev() {
    const idx = currentSeq.indexOf(currentStopId);
    if (idx > 0) openStop(currentSeq[idx - 1]);
  }

  function start() {
    const route = getRoute();
    if (route.length) openStop(route[0]);
  }

  // 由 APP.setStageFilterUI 呼叫（身分按鈕、島景彈窗、桌機底部按鈕都走這裡）
  function setPersona(key) {
    const k = C().personas[key] ? key : 'all';
    window.STORAGE.setPersona(k);
    const isl = I();
    if (isl && isl.setStageFilter) isl.setStageFilter(k, k === 'all' ? null : getRoute(k));
    if (currentView === 'home') openHome();
    else if (currentView === 'stop' && currentStopId) openStop(currentStopId);
    return getPersona(k);
  }

  // 離開導覽畫面（關抽屜、開遊戲、開挑戰區清單）時清掉導覽狀態
  function reset() {
    currentView = null;
    currentStopId = null;
    setTourBar('');
    const drawer = document.getElementById('side-drawer');
    drawer && drawer.classList.remove('tour-sheet', 'tour-sheet-full');
    const isl = I();
    if (isl) {
      isl.setActiveStop && isl.setActiveStop(null);
      isl.setTourLinks && isl.setTourLinks(null);
      isl.setViewInset && isl.setViewInset(null);
    }
  }

  function getProgress() {
    return { visited: visitedList().length, total: C().order.length };
  }

  // 角色圖載入完成後重畫目前的導覽畫面（逛完畫面不重畫，免得重放煙火）
  function refresh() {
    if (currentView === 'home') openHome();
    else if (currentView === 'stop' && currentStopId) openStop(currentStopId);
  }

  /* ---------------- 事件（委派，只綁一次） ---------------- */
  function handleClick(e) {
    const t = e.target.closest('[data-persona],[data-tour-start],[data-tour-go],[data-tour-prev],[data-tour-next],[data-tour-home],[data-tour-game],[data-open-challenge],[data-tour-close],[data-tour-search],[data-tour-search-go],[data-tour-handbook],[data-tour-routecard]');
    if (!t || t.disabled) return;
    window.SOUND && window.SOUND.click();
    if (t.dataset.tourSearch) { openSearch(t.dataset.tourSearch); return; }
    if (t.hasAttribute('data-tour-search-go')) { openSearch(document.getElementById('tour-search-input')?.value || ''); return; }
    if (t.hasAttribute('data-tour-handbook')) { window.HANDBOOK.open('all'); return; }
    if (t.hasAttribute('data-tour-routecard')) { openRouteCard(); return; }
    if (t.dataset.persona) { window.APP.setStageFilterUI(t.dataset.persona); return; }
    if (t.hasAttribute('data-tour-start')) { start(); return; }
    if (t.dataset.tourGo) { openStop(t.dataset.tourGo); return; }
    if (t.hasAttribute('data-tour-prev')) { prev(); return; }
    if (t.hasAttribute('data-tour-next')) { next(); return; }
    if (t.hasAttribute('data-tour-home')) { openHome(); return; }
    if (t.dataset.tourGame) {
      const gid = t.dataset.tourGame;
      reset();
      I() && I().focusById && I().focusById(gid);
      window.APP.openBooth(gid);
      return;
    }
    if (t.hasAttribute('data-open-challenge')) { reset(); window.APP.openBoothsList(); return; }
    if (t.hasAttribute('data-tour-close')) { window.APP.goLobby(); }
  }

  function init() {
    const body = document.getElementById('explore-body');
    body?.addEventListener('click', handleClick);
    body?.addEventListener('scroll', onBodyScroll, { passive: true });
    // 搜尋框：按 Enter 就找；手機點進輸入框時抽屜自動展開，鍵盤才不會蓋住
    body?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target && e.target.id === 'tour-search-input') {
        e.preventDefault();
        openSearch(e.target.value);
      }
    });
    body?.addEventListener('focusin', (e) => {
      if (e.target && e.target.id === 'tour-search-input' && mqMobile.matches) {
        const drawer = document.getElementById('side-drawer');
        if (drawer && drawer.classList.contains('tour-sheet') && !drawer.classList.contains('tour-sheet-full')) {
          drawer.classList.add('tour-sheet-full');
          syncExpandBtn();
          requestAnimationFrame(updateViewInset);
        }
      }
    });

    // 路線卡彈窗：改暱稱就重畫；分享 LINE／存 PNG
    const nick = document.getElementById('route-card-nickname');
    nick?.addEventListener('change', () => {
      window.STORAGE.setNickname(nick.value);
      window.SHARE_CARD.renderRoute(getRouteCardData());
    });
    document.getElementById('btn-route-share')?.addEventListener('click', async () => {
      window.SOUND && window.SOUND.click();
      if (nick) window.STORAGE.setNickname(nick.value);
      const res = await window.SHARE_CARD.shareRoute(getRouteCardData());
      if (res === 'shared' || res === 'shared_link') window.APP.toast('🎉 已開啟分享，選個 LINE 群組傳過去吧！');
      else if (res === 'downloaded') window.APP.toast('📥 路線卡已下載＋網址已複製，貼到 LINE 群組就行！');
    });
    document.getElementById('btn-route-download')?.addEventListener('click', () => {
      window.SOUND && window.SOUND.click();
      if (nick) window.STORAGE.setNickname(nick.value);
      window.SHARE_CARD.downloadRoute(getRouteCardData());
      window.APP.toast('📥 路線卡 PNG 已下載');
    });
    document.getElementById('tour-bottom-bar')?.addEventListener('click', handleClick);
    document.getElementById('btn-expand-drawer')?.addEventListener('click', () => {
      window.SOUND && window.SOUND.click();
      toggleExpand();
    });
    window.addEventListener('resize', () => requestAnimationFrame(updateViewInset));
  }

  window.addEventListener('DOMContentLoaded', init);

  return {
    openHome,
    openStop,
    openDone,
    openSearch,
    openRouteCard,
    next,
    prev,
    start,
    setPersona,
    getPersona,
    getPersonaKey,
    getRoute,
    getProgress,
    refresh,
    syncIsland,
    onIslandReady,
    reset
  };
})();
