/* ==========================================================================
   儲互社互助島 — 全螢幕 3D 微縮世界 × 精簡浮動 HUD × 島嶼進度連動控制器 (v14)
   ========================================================================== */
window.APP = (function () {
  let currentDiff = 'easy';
  let activeBoothId = null;
  let quoteIdx = 0;
  let newbieDismissed = false;
  let pendingFirework = null;

  const GAME_MODULES = {
    game1: () => window.GAME_SWIPE,
    game2: () => window.GAME_CLINIC,
    game3: () => window.GAME_DETECTIVE,
    game4: () => window.GAME_LIFE85,
    game5: () => window.GAME_CALENDAR
  };

  const STAGE_NOTES = {
    kids: '👶 0~15歲成長線：團體 E 計畫($812)＋出生即可保防癌＋滿 6 月 LS 股金 100% 加值！',
    adult: '🧑 青壯成家線：45 歲前限定 D 計畫＋LP 貸款安全免費護身＋團體意外大眾運輸加倍＋重疾 7 項！',
    officer: '🎖️ 理監事幹部線：全體同選 A1/A2/A3、教委上限 5 人／顧問 3 人、3/1 開保、11/25 受理截止！',
    senior: '🌻 70~85歲銀髮線：松年意外續至 85 歲含實支實付＋防癌計畫三續至 75 歲＋75 歲前 LS 終身有效！'
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
    const badge = document.getElementById('header-star-badge');
    if (badge) {
      badge.textContent = progress.hardBadges > 0
        ? `${progress.totalStars}/15 ★`
        : `${progress.totalStars}/15`;
    }

    // Highlight primary CTA when player hasn't collected stars yet
    const boothBtn = document.getElementById('btn-open-booths');
    boothBtn?.classList.toggle('dock-pulse', progress.totalStars === 0);

    // Show/Hide newbie onboarding card cleanly
    const guide = document.getElementById('newbie-guide-card');
    const drawerOpen = !document.getElementById('side-drawer')?.classList.contains('hidden');
    const introOpen = !document.getElementById('modal-intro-video')?.classList.contains('hidden');
    if (guide) {
      const shouldShow = progress.totalStars === 0 && !newbieDismissed && !drawerOpen && !introOpen;
      guide.classList.toggle('hidden', !shouldShow);
    }

    // Push live progress to 3D Island (updates stars on labels, beacons, hot-air balloons!)
    window.ISLAND_3D && window.ISLAND_3D.syncProgress && window.ISLAND_3D.syncProgress(progress);
  }

  function closeScenePopover() {
    const pop = document.getElementById('scene-popover');
    const btn = document.getElementById('btn-scene-menu');
    pop?.classList.add('hidden');
    btn?.setAttribute('aria-expanded', 'false');
    btn?.classList.remove('active');
  }

  function closeDrawer(triggerCelebration = false) {
    cleanupActiveBooth();
    activeBoothId = null;
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

  function showExploreDrawer(title, sub, html) {
    closeScenePopover();
    cleanupActiveBooth();
    activeBoothId = null;
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
      '🎪 五大嘉年華挑戰攤位',
      currentDiff === 'hard'
        ? '🔥 幹部魔王版：計時＋實務精算，達 2★ 拿魔王赤章！'
        : '🌱 輕鬆安心版：不限時、5 題輕量、每題免費附白話提示！',
      html
    );
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

  function openFundCard(fundId) {
    window.SOUND.ensureBgm();
    const f = window.FUNDS_DATA.find(x => x.id === fundId);
    if (!f) return;
    const relGameId = FUND_TO_GAME[fundId] || 'game2';
    const relGame = window.BOOTHS_META.find(b => b.id === relGameId);

    const html = `
      <article class="fund-doc-card" style="--fund-color:${f.color}">
        <span class="fund-period-pill">📄 ${f.sourcePdf}</span>
        <p style="margin:0 0 12px;font-weight:700;color:#1E1510;">${f.summary}</p>
        <div class="fund-kv-grid">
          <div class="fund-kv"><strong>📅 保障期間</strong>${f.period}</div>
          <div class="fund-kv"><strong>⏰ 送件／受理期限</strong>${f.deadline}</div>
          <div class="fund-kv"><strong>🎂 年齡與資格</strong>${f.ageRule}</div>
        </div>
        ${f.plansTable ? `
          <div style="overflow-x:auto;">
            <table class="fund-table">
              <thead><tr>${f.plansTable.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
              <tbody>${f.plansTable.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
          </div>
        ` : ''}
        <ul class="fund-highlights">
          ${f.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
      </article>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button id="btn-fund-play-rel" class="btn-primary btn-full">🎮 挑戰相關攤位：${relGame.icon} ${relGame.shortTitle}</button>
        <button id="btn-fund-all-hb" class="btn-secondary btn-full">📖 查看完整 8 大基金速查圖鑑</button>
      </div>
    `;

    showExploreDrawer(`${f.icon} ${f.name}`, '3D 基金地標詳情 ‧ 18px 特大字速覽', html);
    document.getElementById('btn-fund-play-rel')?.addEventListener('click', () => {
      window.SOUND.click();
      openBooth(relGameId);
    });
    document.getElementById('btn-fund-all-hb')?.addEventListener('click', () => {
      window.SOUND.click();
      window.HANDBOOK.open(fundId);
    });
  }

  function openHubInfo() {
    window.SOUND.ensureBgm();
    window.SOUND.playVoice('welcome');
    quoteIdx = (quoteIdx + 1) % window.GAME_CONTENT.mascotQuotes.length;
    openBoothsList();
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

  function show2DFallback(msg) {
    const fb = document.getElementById('fallback-2d-world');
    if (!fb) return;
    document.getElementById('fb2d-msg').textContent = msg;
    const grid = document.getElementById('fb2d-booths');
    grid.innerHTML = window.BOOTHS_META.map(b => `
      <button class="booth-card" style="--booth-color:${b.color};text-align:center;" data-open-booth="${b.id}">
        <div style="font-size:2rem;">${b.icon}</div>
        <strong style="font-size:0.96rem;">${b.shortTitle}</strong>
      </button>
    `).join('');
    grid.querySelectorAll('[data-open-booth]').forEach(btn => {
      btn.addEventListener('click', () => openBooth(btn.dataset.openBooth));
    });
    fb.classList.remove('hidden');
  }

  function setStageFilterUI(stageKey) {
    document.querySelectorAll('.stage-chip').forEach(ch => {
      ch.classList.toggle('active', ch.dataset.stage === stageKey);
    });
    window.ISLAND_3D && window.ISLAND_3D.setStageFilter(stageKey);
    const banner = document.getElementById('synergy-banner');
    const txt = document.getElementById('synergy-banner-text');
    if (stageKey === 'all') {
      banner?.classList.add('hidden');
    } else if (STAGE_NOTES[stageKey]) {
      txt.textContent = STAGE_NOTES[stageKey];
      banner?.classList.remove('hidden');
    }
  }

  function bindGlobalEvents() {
    document.getElementById('btn-home')?.addEventListener('click', () => {
      window.SOUND.click();
      closeScenePopover();
      closeDrawer(false);
      setStageFilterUI('all');
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
    });
    document.addEventListener('click', (e) => {
      if (scenePop && !scenePop.classList.contains('hidden')) {
        if (!scenePop.contains(e.target) && !sceneBtn?.contains(e.target)) {
          closeScenePopover();
        }
      }
    });

    // Newbie Guide Quick-Start
    document.getElementById('btn-newbie-go')?.addEventListener('click', () => {
      window.SOUND.click();
      window.SOUND.ensureBgm();
      newbieDismissed = true;
      window.ISLAND_3D && window.ISLAND_3D.focusById('game1');
      openBooth('game1');
    });
    document.getElementById('btn-newbie-close')?.addEventListener('click', () => {
      window.SOUND.click();
      newbieDismissed = true;
      document.getElementById('newbie-guide-card')?.classList.add('hidden');
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

    document.getElementById('btn-handbook')?.addEventListener('click', () => {
      window.SOUND.click();
      closeScenePopover();
      window.HANDBOOK.open('all');
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
      openIntroVideo(false);
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
      if (confirm('確定要清除所有攤位星等、魔王章與集章紀錄嗎？')) {
        window.STORAGE.resetAll();
        newbieDismissed = false;
        syncIslandAndHud();
        openPassport();
        toast('🗑️ 已重設集章紀錄');
      }
    });
  }

  function closeIntroVideo(startMusic = true) {
    document.getElementById('modal-intro-video')?.classList.add('hidden');
    const vid = document.getElementById('intro-video-el');
    if (vid) {
      vid.pause();
      vid.onended = null;
    }
    if (startMusic) {
      window.SOUND.resumeBgmAfterVideo();
      window.SOUND.ensureBgm();
    }
    syncIslandAndHud();
  }

  function openIntroVideo(autoMuted = true) {
    if (!window.ASSETS_MANIFEST.detected.videos.intro) {
      toast('尚未放入開場短片 assets/videos/intro_carnival.mp4');
      return;
    }
    const modal = document.getElementById('modal-intro-video');
    const vid = document.getElementById('intro-video-el');
    if (modal && vid) {
      if (!autoMuted) window.SOUND.pauseBgmForVideo();
      vid.src = window.ASSETS_MANIFEST.videos.intro;
      vid.muted = autoMuted;
      vid.currentTime = 0;
      vid.onended = () => closeIntroVideo(!autoMuted);
      modal.classList.remove('hidden');
      document.getElementById('newbie-guide-card')?.classList.add('hidden');
      vid.play().catch(() => {});
    }
  }

  function init() {
    window.HANDBOOK.init();
    bindGlobalEvents();
    syncIslandAndHud();
    if (window.location.protocol === 'file:') {
      show2DFallback('離線 2D 模式（雙擊 start_game.bat 或放上網站即可開啟全螢幕 3D 互助島！）');
    }
    window.ASSETS_MANIFEST.scanAll().then((det) => {
      if (det && det.videos && det.videos.intro) {
        openIntroVideo(true);
      } else {
        syncIslandAndHud();
      }
    });
  }

  window.addEventListener('DOMContentLoaded', init);

  return {
    openBooth,
    openFundCard,
    openHubInfo,
    goLobby: () => closeDrawer(false),
    isPaused,
    toast,
    setBottomBar,
    show2DFallback,
    syncIslandAndHud
  };
})();
