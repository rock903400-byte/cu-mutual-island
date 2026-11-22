/* ==========================================================================
   儲互社互助島 — 全螢幕 3D 微縮世界 × 導覽主線（v16）× 挑戰區小遊戲 × 島嶼進度連動控制器
   ========================================================================== */
window.APP = (function () {
  let currentDiff = 'easy';
  let activeBoothId = null;
  let quoteIdx = 0;
  let pendingFirework = null;
  let fallbackMsg = '';

  const GAME_MODULES = {
    game1: () => window.GAME_SWIPE,
    game2: () => window.GAME_CLINIC,
    game3: () => window.GAME_DETECTIVE,
    game4: () => window.GAME_LIFE85,
    game5: () => window.GAME_CALENDAR
  };

  const FUND_TO_GAME = {
    lp: 'game3', ls: 'game3', group: 'game2', accident: 'game1',
    senior: 'game4', cancer: 'game2', ci: 'game3', officer: 'game5'
  };

  function isPaused() {
    const hb = document.getElementById('modal-handbook');
    const pp = document.getElementById('modal-passport');
    const rs = document.getElementById('modal-result');
    return (hb && !hb.classList.contains('hidden')) ||
           (pp && !pp.classList.contains('hidden')) ||
           (rs && !rs.classList.contains('hidden'));
  }

  function toast(msg) {
    const container = document.getElementById('toast-container');
    if (!container || !msg) return;
    const div = document.createElement('div');
    div.className = 'toast-msg';
    div.textContent = msg;
    container.appendChild(div);
    setTimeout(() => div.remove(), 3100);
  }

  function setBottomBar(html) {
    const bar = document.getElementById('game-bottom-bar');
    if (!bar) return null;
    if (!html) {
      bar.innerHTML = '';
      bar.classList.add('hidden');
      return null;
    }
    bar.innerHTML = html;
    bar.classList.remove('hidden');
    return bar;
  }

  function syncIslandAndHud() {
    const progress = window.STORAGE.getIslandProgress();
    const tour = window.STORAGE.getTour();
    const tourProg = window.TOUR ? window.TOUR.getProgress() : { visited: 0, total: 8 };

    // 底部「🧭 導覽」按鈕：已逛幾站；還沒逛過任何一站時閃動提示
    const tourBadge = document.getElementById('tour-progress-badge');
    if (tourBadge) tourBadge.textContent = `${tourProg.visited}/${tourProg.total}`;
    document.getElementById('btn-tour')?.classList.toggle('dock-pulse', tourProg.visited === 0);

    // 新手引導泡泡：沒逛過、沒關掉、抽屜與片頭都沒開時才出現
    const guide = document.getElementById('newbie-guide-card');
    const drawerOpen = !document.getElementById('side-drawer')?.classList.contains('hidden');
    const introOpen = !document.getElementById('modal-intro-video')?.classList.contains('hidden');
    if (guide) {
      const shouldShow = tourProg.visited === 0 && !tour.guideDismissed && !drawerOpen && !introOpen;
      guide.classList.toggle('hidden', !shouldShow);
    }

    // 3D 島：挑戰區星等與熱氣球、導覽站號與已逛紀錄
    window.ISLAND_3D && window.ISLAND_3D.syncProgress && window.ISLAND_3D.syncProgress(progress);
    window.TOUR && window.TOUR.syncIsland();
    if (fallbackMsg) renderFallbackGrid();
  }

  function closeScenePopover() {
    const pop = document.getElementById('scene-popover');
    const btn = document.getElementById('btn-scene-menu');
    pop?.classList.add('hidden');
    btn?.setAttribute('aria-expanded', 'false');
    btn?.classList.remove('active');
    document.querySelector('.float-top-bar')?.classList.remove('popover-open');
  }

  function closeDrawer(triggerCelebration = false) {
    cleanupActiveBooth();
    activeBoothId = null;
    window.TOUR && window.TOUR.reset();
    document.getElementById('side-drawer')?.classList.add('hidden');
    document.getElementById('drawer-explore')?.classList.add('hidden');
    document.getElementById('drawer-game')?.classList.add('hidden');
    document.getElementById('modal-result')?.classList.add('hidden');
    document.getElementById('float-cam-tools')?.classList.remove('hidden');
    syncIslandAndHud();

    if (triggerCelebration && pendingFirework) {
      const fw = pendingFirework;
      pendingFirework = null;
      if (window.ISLAND_3D) {
        window.ISLAND_3D.focusById && window.ISLAND_3D.focusById(fw.boothId);
        setTimeout(() => {
          window.ISLAND_3D.triggerFireworks && window.ISLAND_3D.triggerFireworks(fw.boothId, fw.isPerfect);
          window.SOUND.confetti();
        }, 380);
      }
    }
  }

  // opts.tour = true：導覽畫面自己管理半高抽屜與底部列；其他畫面一律先清掉導覽狀態
  function showExploreDrawer(title, sub, html, opts = {}) {
    closeScenePopover();
    cleanupActiveBooth();
    activeBoothId = null;
    if (!opts.tour && window.TOUR) window.TOUR.reset();
    document.getElementById('drawer-game')?.classList.add('hidden');
    document.getElementById('drawer-explore')?.classList.remove('hidden');
    document.getElementById('side-drawer')?.classList.remove('hidden');
    document.getElementById('float-cam-tools')?.classList.add('hidden');
    document.getElementById('newbie-guide-card')?.classList.add('hidden');

    document.getElementById('explore-title').textContent = title;
    document.getElementById('explore-sub').textContent = sub;
    const body = document.getElementById('explore-body');
    body.innerHTML = html;
    body.scrollTop = 0;
  }

  function openBoothsList() {
    const state = window.STORAGE.load();
    const prog = window.STORAGE.getIslandProgress(state);
    const mascotImg = window.ASSETS_MANIFEST.getImageUrl('mascot_host');
    const html = `
      <div class="challenge-intro">
        <p>這裡是給幹部訓練、園遊會攤位用的 5 個小遊戲。想先弄懂每個互助基金，請回「🧭 導覽」。</p>
        <div class="challenge-intro-actions">
          <button type="button" class="btn-secondary" data-challenge-tour>🧭 回導覽</button>
          <button type="button" class="btn-secondary" data-challenge-passport>🏅 集章護照・戰績卡（${prog.totalStars}/15 ★）</button>
        </div>
      </div>
      <div class="drawer-diff-bar" role="group" aria-label="選擇遊玩難度">
        <button type="button" class="drawer-diff-btn ${currentDiff === 'easy' ? 'active-easy' : ''}" data-drawer-diff="easy">
          <strong>🌱 輕鬆安心版</strong>
          <small>不限時・5 題・免費提示</small>
        </button>
        <button type="button" class="drawer-diff-btn ${currentDiff === 'hard' ? 'active-hard' : ''}" data-drawer-diff="hard">
          <strong>🔥 幹部魔王版</strong>
          <small>限時精算・收集魔王赤章</small>
        </button>
      </div>
      <div class="mascot-hero-card">
        <div class="mascot-big-img">${mascotImg ? `<img src="${mascotImg}" alt="互助小管家" />` : '🎪'}</div>
        <div>
          <strong style="color:#AD3024;font-size:0.9rem;">互助小管家｜進度 ${prog.totalStars}/15 ★・🔥${prog.hardBadges}/5</strong>
          <p style="margin:4px 0 0;font-size:0.92rem;font-weight:700;">${window.GAME_CONTENT.mascotQuotes[quoteIdx]}</p>
        </div>
      </div>
      <div class="booths-stack">
        ${window.BOOTHS_META.map(b => {
          const rec = state.booths[b.id] || { stars: 0, bestScore: 0, hardStars: 0 };
          const starsStr = '★'.repeat(rec.stars) + '☆'.repeat(3 - rec.stars);
          const hardBadge = (rec.hardStars || 0) >= 2 ? '<span class="hard-mini-pill">🔥 魔王征服</span>' : '';
          return `
            <button class="booth-card" style="--booth-color:${b.color};--booth-soft:${b.soft}" data-open-booth="${b.id}">
              <div class="booth-card-top">
                <div class="booth-icon-badge">${b.icon}</div>
                <div class="booth-meta">
                  <div class="booth-num">${b.num} ${hardBadge}</div>
                  <h3>${b.title}</h3>
                </div>
                <div class="booth-stars">${starsStr}</div>
              </div>
              <p class="booth-desc">${b.desc}</p>
              <div class="booth-tags">${b.tags.map(t => `<span class="booth-tag">#${t}</span>`).join('')}</div>
              <div class="booth-footer">
                <span>最高：<strong>${rec.bestScore.toLocaleString()}</strong> 分</span>
                <span class="booth-play-cta">${rec.stars > 0 ? '再次挑戰 →' : '立即開玩 →'}</span>
              </div>
            </button>
          `;
        }).join('')}
      </div>
      <p style="font-size:0.78rem;color:#6C594D;text-align:center;">
        本遊戲依中華民國儲蓄互助協會各項互助基金簡介製作，詳細內容請以保單條款、批註書及各社證書為準。
      </p>
    `;
    showExploreDrawer(
      '🎮 挑戰區｜5 個小遊戲',
      currentDiff === 'hard'
        ? '🔥 幹部魔王版：計時＋實務精算，達 2★ 拿魔王赤章！'
        : '🌱 輕鬆安心版：不限時、5 題輕量、每題免費附白話提示！',
      html
    );
    document.querySelector('#explore-body [data-challenge-tour]')?.addEventListener('click', () => {
      window.SOUND.click();
      window.TOUR.openHome();
    });
    document.querySelector('#explore-body [data-challenge-passport]')?.addEventListener('click', () => {
      window.SOUND.click();
      openPassport();
    });
    document.querySelectorAll('#explore-body [data-drawer-diff]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.drawerDiff;
        if (target === currentDiff) return;
        window.SOUND.click();
        currentDiff = target;
        document.querySelectorAll('.diff-pill').forEach(b => b.classList.toggle('active', b.dataset.diff === currentDiff));
        toast(currentDiff === 'hard' ? '🔥 已切換為「幹部魔王版」' : '🌱 已切換為「輕鬆安心版」（不限時＋白話提示）');
        openBoothsList();
      });
    });
    document.querySelectorAll('#explore-body [data-open-booth]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.SOUND.click();
        const bid = btn.dataset.openBooth;
        window.ISLAND_3D && window.ISLAND_3D.focusById(bid);
        openBooth(bid);
      });
    });
  }

  // 點 3D 基金地標 → 打開導覽站卡（v16 起由 TOUR 負責）
  function openFundCard(fundId) {
    window.TOUR.openStop(fundId);
  }

  // 點中央「導覽起點」→ 導覽首頁
  function openHubInfo() {
    window.TOUR.openHome();
  }

  function cleanupActiveBooth() {
    if (activeBoothId && GAME_MODULES[activeBoothId]) {
      const mod = GAME_MODULES[activeBoothId]();
      mod && mod.cleanup && mod.cleanup();
    }
    setBottomBar('');
  }

  function getNextBoothId(fromId) {
    const ids = window.BOOTHS_META.map(b => b.id);
    const state = window.STORAGE.load();
    const curIdx = ids.indexOf(fromId);
    // Prefer next unplayed booth after current, then any unplayed, then cyclic next
    for (let step = 1; step <= ids.length; step++) {
      const cand = ids[(curIdx + step) % ids.length];
      if ((state.booths[cand]?.stars || 0) === 0) return cand;
    }
    return ids[(curIdx + 1) % ids.length];
  }

  function openBooth(boothId) {
    const meta = window.BOOTHS_META.find(b => b.id === boothId);
    const mod = GAME_MODULES[boothId] && GAME_MODULES[boothId]();
    if (!meta || !mod) return;

    closeScenePopover();
    cleanupActiveBooth();
    window.TOUR && window.TOUR.reset();
    activeBoothId = boothId;
    window.SOUND.ensureBgm();
    window.SOUND.playVoice(`booth_${boothId}`);

    document.getElementById('drawer-explore')?.classList.add('hidden');
    document.getElementById('drawer-game')?.classList.remove('hidden');
    document.getElementById('side-drawer')?.classList.remove('hidden');
    document.getElementById('float-cam-tools')?.classList.add('hidden');
    document.getElementById('newbie-guide-card')?.classList.add('hidden');
    document.getElementById('modal-result')?.classList.add('hidden');

    document.getElementById('active-game-title').textContent = `${meta.icon} ${meta.shortTitle}`;
    const diffBadge = document.getElementById('active-game-diff');
    diffBadge.textContent = currentDiff === 'hard' ? '🔥 幹部魔王版' : '🌱 輕鬆安心版';
    diffBadge.classList.toggle('hard', currentDiff === 'hard');

    const stage = document.getElementById('game-stage');
    stage.innerHTML = '';
    stage.scrollTop = 0;

    mod.mount(stage, {
      diff: currentDiff,
      isPaused,
      setBottomBar,
      scrollTop: () => { stage.scrollTop = 0; },
      onFinish: (result) => showResult(boothId, result)
    });
  }

  function showResult(boothId, res) {
    setBottomBar('');
    const prevProg = window.STORAGE.getIslandProgress();
    const { newlyUnlocked } = window.STORAGE.recordResult(boothId, {
      stars: res.stars,
      score: res.score,
      diff: currentDiff
    });
    const nextProg = window.STORAGE.getIslandProgress();
    syncIslandAndHud();

    if (res.stars >= 1) {
      pendingFirework = { boothId, isPerfect: res.stars === 3 };
      // Immediate celebration burst on desktop left 3D island!
      window.ISLAND_3D && window.ISLAND_3D.triggerFireworks && window.ISLAND_3D.triggerFireworks(boothId, res.stars === 3);
    }

    window.SOUND.fanfare(res.stars === 3);
    const modal = document.getElementById('modal-result');
    const hardPass = currentDiff === 'hard' && res.stars >= 2;
    document.getElementById('result-stamp-badge').textContent = hardPass
      ? '🔥 魔王赤章制霸！'
      : res.stars >= 2 ? 'STAMPED! 點亮地標' : res.stars === 1 ? 'PASS! 過關集章' : '加油！再試一次';
    document.getElementById('result-stars').textContent = '★'.repeat(res.stars) + '☆'.repeat(3 - res.stars);
    document.getElementById('result-heading').textContent = res.stars === 3 ? '🎉 滿星大滿貫！' : res.stars >= 1 ? '👏 挑戰成功！' : '💪 差一點點就拿章囉！';
    document.getElementById('result-quote').textContent = res.quote;
    document.getElementById('result-stats').innerHTML = res.stats.map(s => `
      <div class="res-stat"><small>${s.label}</small><strong>${s.val}</strong></div>
    `).join('');
    document.getElementById('result-tips').innerHTML = `
      <strong>📝 本局重點筆記：</strong>
      <ul style="margin:6px 0 0;padding-left:20px;">
        ${res.tips.map(t => `<li style="margin-bottom:4px;">${t}</li>`).join('')}
      </ul>
    `;

    // Update "下一攤" CTA label cleanly
    const nextId = getNextBoothId(boothId);
    const nextMeta = window.BOOTHS_META.find(b => b.id === nextId);
    const nextBtn = document.getElementById('btn-res-next');
    if (nextBtn && nextMeta) {
      nextBtn.dataset.nextBooth = nextId;
      nextBtn.textContent = `➡️ ${nextMeta.icon} 下一攤`;
    }

    const vidSlot = document.getElementById('result-video-slot');
    if (vidSlot) {
      if (res.stars === 3 && window.ASSETS_MANIFEST.detected.videos.victory) {
        vidSlot.innerHTML = `<video src="${window.ASSETS_MANIFEST.videos.victory}" autoplay muted playsinline loop></video>`;
        vidSlot.classList.remove('hidden');
      } else {
        vidSlot.innerHTML = '';
        vidSlot.classList.add('hidden');
      }
    }

    modal.classList.remove('hidden');
    newlyUnlocked.forEach(ach => toast(`🎖️ 解鎖勳章：${ach.icon} ${ach.name}！`));
    if (!prevProg.isAllCleared && nextProg.isAllCleared) {
      toast('🎈 恭喜全島制霸！回島嶼看天空熱氣球＆慶祝煙火！');
    }
  }

  function openPassport() {
    closeScenePopover();
    const state = window.STORAGE.load();
    const stars = window.STORAGE.getTotalStars(state);
    const hardBadges = window.STORAGE.getHardBadgeCount(state);
    const totalScore = window.STORAGE.getTotalScore(state);
    const rank = window.STORAGE.getRank(state);

    document.getElementById('passport-summary').innerHTML = `
      <div>
        <div style="font-size:0.8rem;color:#8B5305;font-weight:800;">目前稱號</div>
        <div class="rank-title">${rank.icon} ${rank.title}</div>
        <div style="font-size:0.82rem;color:#AD3024;font-weight:900;margin-top:2px;">🔥 幹部魔王赤章：${hardBadges} / 5 枚</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:1.25rem;font-weight:900;color:#AD3024;">${stars} / 15 ★</div>
        <div style="font-size:0.86rem;color:#43342B;font-weight:800;">總分 ${totalScore.toLocaleString()}</div>
      </div>
    `;
    document.getElementById('passport-stamps').innerHTML = window.BOOTHS_META.map(b => {
      const rec = state.booths[b.id] || { stars: 0, bestScore: 0, hardStars: 0 };
      const hardCleared = (rec.hardStars || 0) >= 2;
      return `
        <div class="stamp-slot ${rec.stars > 0 ? 'stamped' : ''}">
          ${hardCleared ? '<span class="stamp-hard-ribbon">🔥魔王</span>' : ''}
          <div class="stamp-circle">${b.icon}</div>
          <strong style="display:block;font-size:0.9rem;">${b.shortTitle}</strong>
          <div style="color:#A86804;letter-spacing:2px;font-size:0.95rem;">${'★'.repeat(rec.stars) + '☆'.repeat(3 - rec.stars)}</div>
          <small style="color:#6C594D;font-weight:700;">最高 ${rec.bestScore} 分</small>
        </div>
      `;
    }).join('');
    document.getElementById('passport-badges').innerHTML = window.STORAGE.ACHIEVEMENTS.map(a => {
      const has = state.badges.includes(a.id);
      return `
        <div class="ach-badge ${has ? 'unlocked' : ''}">
          <span style="font-size:1.35rem;">${has ? a.icon : '🔒'}</span>
          <div>
            <div>${a.name}</div>
            <small style="opacity:0.85;font-weight:500;">${a.desc}</small>
          </div>
        </div>
      `;
    }).join('');

    const nickInput = document.getElementById('player-nickname');
    if (nickInput) nickInput.value = state.nickname;
    window.SHARE_CARD.render();
    document.getElementById('modal-passport')?.classList.remove('hidden');
  }

  // 沒有 3D（file:// 或 WebGL／CDN 失敗）：列出 8 站＋導覽首頁＋挑戰區
  function renderFallbackGrid() {
    const grid = document.getElementById('fb2d-booths');
    if (!grid || !window.TOUR_CONTENT) return;
    const visited = window.STORAGE.getTour().visited || [];
    grid.innerHTML = `
      <button type="button" class="booth-card fb2d-wide" style="--booth-color:#21805F;text-align:center;" data-fb-home>
        <strong style="font-size:1rem;">🧭 互助島導覽首頁（選你是誰）</strong>
      </button>
      ${window.TOUR_CONTENT.order.map((id, i) => {
        const f = window.FUNDS_DATA.find(x => x.id === id);
        if (!f) return '';
        return `
          <button type="button" class="booth-card" style="--booth-color:${f.color};text-align:center;" data-fb-stop="${id}">
            <div style="font-size:1.8rem;">${f.icon}</div>
            <strong style="font-size:0.96rem;">${i + 1}. ${f.shortName}${visited.includes(id) ? ' ✅' : ''}</strong>
          </button>`;
      }).join('')}
      <button type="button" class="booth-card fb2d-wide" style="--booth-color:#DF5646;text-align:center;" data-fb-challenge>
        <strong style="font-size:1rem;">🎮 挑戰區：5 個小遊戲</strong>
      </button>
    `;
    grid.querySelector('[data-fb-home]')?.addEventListener('click', () => { window.SOUND.click(); window.TOUR.openHome(); });
    grid.querySelectorAll('[data-fb-stop]').forEach(btn => {
      btn.addEventListener('click', () => { window.SOUND.click(); window.TOUR.openStop(btn.dataset.fbStop); });
    });
    grid.querySelector('[data-fb-challenge]')?.addEventListener('click', () => { window.SOUND.click(); openBoothsList(); });
  }

  function show2DFallback(msg) {
    const fb = document.getElementById('fallback-2d-world');
    if (!fb) return;
    fallbackMsg = msg || '2D 模式';
    document.getElementById('fb2d-msg').textContent = fallbackMsg;
    renderFallbackGrid();
    fb.classList.remove('hidden');
  }

  // 「我是誰」身分路線（導覽首頁大按鈕、島景彈窗、桌機底部按鈕都走這裡）
  function setStageFilterUI(stageKey) {
    const key = window.TOUR_CONTENT && window.TOUR_CONTENT.personas[stageKey] ? stageKey : 'all';
    document.querySelectorAll('.stage-chip').forEach(ch => {
      const on = ch.dataset.stage === key;
      ch.classList.toggle('active', on);
      ch.setAttribute('aria-pressed', String(on));
    });
    const persona = window.TOUR ? window.TOUR.setPersona(key) : null;
    const banner = document.getElementById('synergy-banner');
    const txt = document.getElementById('synergy-banner-text');
    if (key === 'all' || !persona || !persona.banner) {
      banner?.classList.add('hidden');
    } else {
      txt.textContent = persona.banner;
      banner?.classList.remove('hidden');
    }
  }

  function bindGlobalEvents() {
    // 左上品牌：關抽屜、回全景（身分路線保留，要清掉按提示列的 ✕）
    document.getElementById('btn-home')?.addEventListener('click', () => {
      window.SOUND.click();
      closeScenePopover();
      closeDrawer(false);
      window.ISLAND_3D && window.ISLAND_3D.resetCamera();
    });

    // Collapsible Scene Popover Toggle
    const sceneBtn = document.getElementById('btn-scene-menu');
    const scenePop = document.getElementById('scene-popover');
    sceneBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.SOUND.click();
      const willOpen = scenePop?.classList.contains('hidden');
      scenePop?.classList.toggle('hidden', !willOpen);
      sceneBtn.setAttribute('aria-expanded', String(Boolean(willOpen)));
      sceneBtn.classList.toggle('active', Boolean(willOpen));
      // 彈窗打開時把頂部列疊到導覽抽屜上面，不然手機半高抽屜會蓋住彈窗
      document.querySelector('.float-top-bar')?.classList.toggle('popover-open', Boolean(willOpen));
    });
    document.addEventListener('click', (e) => {
      if (scenePop && !scenePop.classList.contains('hidden')) {
        if (!scenePop.contains(e.target) && !sceneBtn?.contains(e.target)) {
          closeScenePopover();
        }
      }
    });

    // 新手引導泡泡 → 導覽首頁；✕ 關掉後記住，不再出現
    document.getElementById('btn-newbie-go')?.addEventListener('click', () => {
      window.SOUND.click();
      window.SOUND.ensureBgm();
      window.TOUR.openHome();
    });
    document.getElementById('btn-newbie-close')?.addEventListener('click', () => {
      window.SOUND.click();
      window.STORAGE.dismissGuide();
      document.getElementById('newbie-guide-card')?.classList.add('hidden');
    });

    document.getElementById('btn-tour')?.addEventListener('click', () => {
      window.SOUND.click();
      window.SOUND.ensureBgm();
      window.TOUR.openHome();
    });

    document.getElementById('btn-open-booths')?.addEventListener('click', () => {
      window.SOUND.click();
      window.SOUND.ensureBgm();
      openBoothsList();
    });

    document.getElementById('btn-close-drawer')?.addEventListener('click', () => {
      window.SOUND.click();
      closeDrawer(false);
    });
    document.getElementById('btn-back-lobby')?.addEventListener('click', () => {
      window.SOUND.click();
      closeDrawer(false);
    });
    document.getElementById('btn-restart-game')?.addEventListener('click', () => {
      window.SOUND.click();
      if (activeBoothId) openBooth(activeBoothId);
    });
    document.getElementById('btn-game-handbook')?.addEventListener('click', () => {
      window.SOUND.click();
      window.HANDBOOK.open('all');
    });

    // 24H Atmosphere Buttons (+ Smooth Day/Night BGM Crossfade!)
    document.querySelectorAll('.time-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.SOUND.click();
        window.SOUND.ensureBgm();
        document.querySelectorAll('.time-btn').forEach(b => b.classList.toggle('active', b === btn));
        window.ISLAND_3D && window.ISLAND_3D.setTimeOfDay(btn.dataset.time);
        window.SOUND.setMusicTheme(btn.dataset.time);
        const names = { dawn: '🌅 清晨微風模式', day: '☀️ 暖陽嘉年華模式', sunset: '🌇 金橘夕陽・夜景配樂淡入', night: '🌌 星空夜景・星空晚安曲淡入' };
        toast(names[btn.dataset.time] || '');
      });
    });

    // Life-Stage Synergy Arc Chips (Desktop dock + Mobile popover both stay in sync!)
    document.querySelectorAll('.stage-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        window.SOUND.click();
        setStageFilterUI(btn.dataset.stage);
        closeScenePopover();
      });
    });
    document.getElementById('btn-clear-synergy')?.addEventListener('click', () => {
      window.SOUND.click();
      setStageFilterUI('all');
    });

    // Difficulty Switch with Mid-Game Protection Guardrail!
    function requestSwitchDiff(targetDiff) {
      if (targetDiff === currentDiff) return;
      window.SOUND.click();
      if (activeBoothId && !confirm(`切換為「${targetDiff === 'hard' ? '🔥 幹部魔王版' : '🌱 社員輕鬆版'}」將重新開始本攤挑戰，確定切換嗎？`)) {
        return;
      }
      currentDiff = targetDiff;
      document.querySelectorAll('.diff-pill').forEach(b => b.classList.toggle('active', b.dataset.diff === currentDiff));
      toast(currentDiff === 'hard' ? '🔥 已切換為「幹部魔王版」（達 2★ 可拿魔王赤章！）' : '🌱 已切換為「社員輕鬆版」');
      if (activeBoothId) openBooth(activeBoothId);
    }
    document.querySelectorAll('.diff-pill').forEach(btn => {
      btn.addEventListener('click', () => requestSwitchDiff(btn.dataset.diff));
    });
    document.getElementById('active-game-diff')?.addEventListener('click', () => {
      requestSwitchDiff(currentDiff === 'easy' ? 'hard' : 'easy');
    });

    // 底部「🔍 查基金」：導覽的關鍵字搜尋（裡面也能打開完整條款圖鑑）
    document.getElementById('btn-handbook')?.addEventListener('click', () => {
      window.SOUND.click();
      closeScenePopover();
      window.TOUR.openSearch();
    });
    document.getElementById('btn-passport')?.addEventListener('click', () => {
      window.SOUND.click();
      openPassport();
    });
    document.getElementById('mascot-widget')?.addEventListener('click', () => {
      window.SOUND.click();
      window.SOUND.ensureBgm();
      quoteIdx = (quoteIdx + 1) % window.GAME_CONTENT.mascotQuotes.length;
      window.SOUND.playVoice(quoteIdx % 2 === 1 ? 'taigi_welcome' : 'welcome');
      toast(`🎪 小管家：${window.GAME_CONTENT.mascotQuotes[quoteIdx]}`);
    });

    // Scene Tools inside Popover
    document.getElementById('btn-toggle-labels')?.addEventListener('click', (e) => {
      window.SOUND.click();
      const on = window.ISLAND_3D && window.ISLAND_3D.toggleLabels();
      e.currentTarget.classList.toggle('active', Boolean(on));
    });
    document.getElementById('btn-toggle-arcs')?.addEventListener('click', (e) => {
      window.SOUND.click();
      const on = window.ISLAND_3D && window.ISLAND_3D.toggleAllArcs();
      e.currentTarget.classList.toggle('active', Boolean(on));
      if (on) toast('✨ 已開啟全島 8 大基金協作光弧線！');
    });
    document.getElementById('btn-toggle-pause')?.addEventListener('click', (e) => {
      window.SOUND.click();
      const paused = window.ISLAND_3D && window.ISLAND_3D.togglePauseAnim();
      e.currentTarget.classList.toggle('active', Boolean(paused));
    });
    document.getElementById('btn-top-reset')?.addEventListener('click', () => {
      window.SOUND.click();
      closeScenePopover();
      window.ISLAND_3D && window.ISLAND_3D.resetCamera();
    });
    document.getElementById('btn-play-intro')?.addEventListener('click', () => {
      window.SOUND.click();
      closeScenePopover();
      openIntroVideo();
    });

    // 開場短片：點大按鈕開聲音；用影片自帶的喇叭鈕開聲音也一樣先停背景音樂
    document.getElementById('btn-intro-unmute')?.addEventListener('click', unmuteIntroVideo);
    document.getElementById('intro-video-el')?.addEventListener('volumechange', (e) => {
      const vid = e.currentTarget;
      if (!vid.muted && !document.getElementById('modal-intro-video')?.classList.contains('hidden')) {
        window.SOUND.pauseBgmForVideo();
        document.getElementById('btn-intro-unmute')?.classList.add('hidden');
      }
    });

    document.getElementById('btn-audio')?.addEventListener('click', (e) => {
      const on = window.SOUND.toggle();
      e.currentTarget.classList.toggle('muted', !on);
      const ico = document.getElementById('audio-icon');
      if (ico) {
        ico.innerHTML = on
          ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>'
          : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 6 6m0-6-6 6"/></svg>';
      }
    });

    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      window.SOUND.click();
      window.ISLAND_3D && window.ISLAND_3D.zoomCamera(0.84);
    });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      window.SOUND.click();
      window.ISLAND_3D && window.ISLAND_3D.zoomCamera(1.18);
    });
    document.getElementById('btn-reset-cam')?.addEventListener('click', () => {
      window.SOUND.click();
      window.ISLAND_3D && window.ISLAND_3D.resetCamera();
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.SOUND.click();
        document.getElementById(btn.dataset.closeModal)?.classList.add('hidden');
      });
    });
    document.querySelectorAll('.sheet-backdrop').forEach(bd => {
      bd.addEventListener('click', (e) => {
        if (e.target === bd && bd.id !== 'modal-result') {
          if (bd.id === 'modal-intro-video') closeIntroVideo(true);
          else bd.classList.add('hidden');
        }
      });
    });

    // Result Sheet Actions
    document.getElementById('btn-res-next')?.addEventListener('click', (e) => {
      window.SOUND.click();
      const nextId = e.currentTarget.dataset.nextBooth || getNextBoothId(activeBoothId);
      window.ISLAND_3D && window.ISLAND_3D.focusById && window.ISLAND_3D.focusById(nextId);
      openBooth(nextId);
    });
    document.getElementById('btn-res-replay')?.addEventListener('click', () => {
      window.SOUND.click();
      if (activeBoothId) openBooth(activeBoothId);
    });
    document.getElementById('btn-res-passport')?.addEventListener('click', () => {
      window.SOUND.click();
      document.getElementById('modal-result')?.classList.add('hidden');
      openPassport();
    });
    document.getElementById('btn-res-lobby')?.addEventListener('click', () => {
      window.SOUND.click();
      closeDrawer(true);
    });

    // Share Card Actions
    document.getElementById('btn-render-card')?.addEventListener('click', () => {
      window.SOUND.click();
      window.STORAGE.setNickname(document.getElementById('player-nickname')?.value);
      window.SHARE_CARD.render();
      toast('✨ 已更新戰績卡預覽！');
    });
    document.getElementById('btn-download-card')?.addEventListener('click', () => {
      window.STORAGE.setNickname(document.getElementById('player-nickname')?.value);
      window.SHARE_CARD.download();
      toast('📥 戰績卡 PNG 已下載，快傳去 LINE 群組！');
    });
    document.getElementById('btn-share-line')?.addEventListener('click', async () => {
      window.SOUND.click();
      window.STORAGE.setNickname(document.getElementById('player-nickname')?.value);
      const res = await window.SHARE_CARD.shareToLine();
      if (res === 'shared' || res === 'shared_link') {
        toast('🎉 已開啟分享，選個 LINE 群組炫耀吧！');
      } else if (res === 'downloaded') {
        toast('📥 戰績卡已下載＋網址已複製，貼到 LINE 群組即可推坑！');
      }
    });

    document.getElementById('btn-skip-intro')?.addEventListener('click', () => {
      window.SOUND.click();
      closeIntroVideo(true);
    });

    document.getElementById('btn-reset-progress')?.addEventListener('click', () => {
      if (confirm('確定要清除所有攤位星等、魔王章與集章紀錄嗎？（導覽逛過的紀錄會保留）')) {
        window.STORAGE.resetAll();
        syncIslandAndHud();
        openPassport();
        toast('🗑️ 已重設集章紀錄');
      }
    });
  }

  /* ---------- 手機返回鍵：抽屜或彈窗打開時記一筆，返回鍵依序關彈窗 → 抽屜，不會直接離開網站 ---------- */
  const LAYER_IDS = ['side-drawer', 'modal-handbook', 'modal-passport', 'modal-route-card', 'modal-result'];
  let historyArmed = false;
  let ignoreNextPop = false;

  function isShown(id) {
    const el = document.getElementById(id);
    return Boolean(el && !el.classList.contains('hidden'));
  }

  function anyLayerOpen() {
    return LAYER_IDS.some(isShown);
  }

  function armHistory() {
    if (historyArmed) return;
    try {
      history.pushState({ cuLayer: true }, '');
      historyArmed = true;
    } catch {
      historyArmed = false;
    }
  }

  // 由畫面按鈕關掉最後一層時，把剛才記的那一筆退掉，讓返回鍵的次數對得上
  function syncHistoryWithLayers() {
    const open = anyLayerOpen();
    if (open && !historyArmed) {
      armHistory();
    } else if (!open && historyArmed) {
      historyArmed = false;
      ignoreNextPop = true;
      try { history.back(); } catch { ignoreNextPop = false; }
    }
  }

  // 關最上面一層；遊戲還沒玩完先確認（回傳 false 表示使用者選擇繼續玩）
  function closeTopLayer() {
    for (const id of ['modal-handbook', 'modal-passport', 'modal-route-card']) {
      if (isShown(id)) {
        document.getElementById(id).classList.add('hidden');
        return true;
      }
    }
    if (isShown('side-drawer')) {
      const resultOpen = isShown('modal-result');
      if (activeBoothId && !resultOpen && !confirm('遊戲還沒玩完，確定要回到島上嗎？')) return false;
      closeDrawer(resultOpen);
      return true;
    }
    if (isShown('modal-result')) {
      document.getElementById('modal-result').classList.add('hidden');
      return true;
    }
    return false;
  }

  function bindBackButton() {
    window.addEventListener('popstate', () => {
      if (ignoreNextPop) { ignoreNextPop = false; return; }
      if (!historyArmed) return;
      historyArmed = false;            // 瀏覽器已經把我們記的那一筆退掉了
      const closed = closeTopLayer();
      if (!closed || anyLayerOpen()) armHistory();
    });
    // 抽屜開著時在 body 標記（桌機把底部按鈕列、頂部列往左讓開，不被抽屜蓋住）
    const observer = new MutationObserver(() => {
      document.body.classList.toggle('drawer-open', isShown('side-drawer'));
      syncHistoryWithLayers();
    });
    LAYER_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    });
    // 桌機 Esc 一樣關最上面一層
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && anyLayerOpen()) closeTopLayer();
    });
  }

  function closeIntroVideo(startMusic = true) {
    document.getElementById('modal-intro-video')?.classList.add('hidden');
    document.getElementById('btn-intro-unmute')?.classList.add('hidden');
    const vid = document.getElementById('intro-video-el');
    if (vid) {
      vid.pause();
      vid.onended = null;
    }
    if (startMusic) {
      window.SOUND.resumeBgmAfterVideo();
      window.SOUND.ensureBgm();
    } else {
      window.SOUND.releaseVideoHold();
    }
    syncIslandAndHud();
  }

  function showIntroUnmute(label) {
    const btn = document.getElementById('btn-intro-unmute');
    if (!btn || !window.SOUND.isEnabled()) return;
    btn.textContent = label;
    btn.classList.remove('hidden');
  }

  // 開場短片預設有聲音：先試有聲自動播放；瀏覽器擋下（手機、LINE 幾乎都會擋）
  // 就改靜音播放，並在影片上顯示大顆「點一下開聲音」，點了從頭有聲重播
  function openIntroVideo() {
    if (!window.ASSETS_MANIFEST.detected.videos.intro) {
      toast('尚未放入開場短片 assets/videos/intro_carnival.mp4');
      return;
    }
    const modal = document.getElementById('modal-intro-video');
    const vid = document.getElementById('intro-video-el');
    if (!modal || !vid) return;
    document.getElementById('btn-intro-unmute')?.classList.add('hidden');
    vid.src = window.ASSETS_MANIFEST.videos.intro;
    vid.currentTime = 0;
    vid.onended = () => closeIntroVideo(!vid.muted);
    modal.classList.remove('hidden');
    document.getElementById('newbie-guide-card')?.classList.add('hidden');

    const playMuted = () => {
      vid.muted = true;
      vid.play()
        .then(() => showIntroUnmute('🔊 點一下開聲音'))
        .catch(() => showIntroUnmute('▶ 點一下播放（有聲音）'));
    };
    if (!window.SOUND.isEnabled()) {
      playMuted();
      return;
    }
    vid.muted = false;
    vid.play()
      .then(() => window.SOUND.pauseBgmForVideo())
      .catch(playMuted);
  }

  function unmuteIntroVideo() {
    const vid = document.getElementById('intro-video-el');
    if (!vid) return;
    window.SOUND.pauseBgmForVideo();
    vid.muted = false;
    vid.currentTime = 0;
    vid.play().catch(() => {});
    document.getElementById('btn-intro-unmute')?.classList.add('hidden');
  }

  function init() {
    window.HANDBOOK.init();
    bindGlobalEvents();
    bindBackButton();
    // 還原上次選的身分路線（按鈕亮起＋提示列；3D 島準備好後由 TOUR.onIslandReady 補上高亮）
    setStageFilterUI(window.STORAGE.getTour().persona);
    syncIslandAndHud();
    if (window.location.protocol === 'file:') {
      show2DFallback('離線 2D 模式（雙擊 start_game.bat 或放上網站即可開啟全螢幕 3D 互助島！）');
    }
    window.ASSETS_MANIFEST.scanAll().then((det) => {
      window.TOUR && window.TOUR.refresh();   // 角色圖到位後重畫導覽畫面
      if (det && det.videos && det.videos.intro) {
        openIntroVideo();
      } else {
        syncIslandAndHud();
      }
    });
  }

  window.addEventListener('DOMContentLoaded', init);

  return {
    openBooth,
    openBoothsList,
    openFundCard,
    openHubInfo,
    goLobby: () => closeDrawer(false),
    isPaused,
    toast,
    setBottomBar,
    show2DFallback,
    showExploreDrawer,
    setStageFilterUI,
    syncIslandAndHud,
    FUND_TO_GAME
  };
})();
