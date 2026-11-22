/* ==========================================================================
   攤位 1：核保快刷！過關還是退件？ (v15)
   - 🌱 輕鬆安心版：不限時、5 題輕量、免費「💡 問小管家」白話提示
   - 🔥 幹部魔王版：80 秒限時、10 題高難度實務快刷
   ========================================================================== */
window.GAME_SWIPE = (function () {
  let timerId = null;
  let keyHandler = null;
  let flyTimer = null;

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function cleanup() {
    if (timerId) { clearInterval(timerId); timerId = null; }
    if (flyTimer) { clearTimeout(flyTimer); flyTimer = null; }
    if (keyHandler) { window.removeEventListener('keydown', keyHandler); keyHandler = null; }
  }

  function spawnFloatPop(container, text, isGood) {
    if (!container) return;
    const pop = document.createElement('div');
    pop.className = `score-float-pop ${isGood ? 'ok' : 'ng'}`;
    pop.textContent = text;
    container.appendChild(pop);
    setTimeout(() => pop.remove(), 950);
  }

  function spawnMiniConfetti(container) {
    if (!container) return;
    const colors = ['#DF5646', '#F2AD34', '#2C8C6D', '#3969A2', '#C75284'];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('span');
      p.className = 'confetti-bit';
      p.style.background = colors[i % colors.length];
      p.style.left = `${20 + Math.random() * 60}%`;
      p.style.setProperty('--tx', `${(Math.random() - 0.5) * 180}px`);
      p.style.setProperty('--ty', `${-60 - Math.random() * 110}px`);
      p.style.setProperty('--rot', `${(Math.random() - 0.5) * 420}deg`);
      container.appendChild(p);
      setTimeout(() => p.remove(), 820);
    }
  }

  function mount(stage, { diff, isPaused, setBottomBar, scrollTop, onFinish }) {
    cleanup();
    const isHard = diff === 'hard';
    const pool = window.GAME_CONTENT.swipeCases.filter(c => isHard ? true : c.diff === 'both');
    const deck = shuffle(pool).slice(0, isHard ? 10 : 5);

    let idx = 0;
    let score = 0;
    let combo = 0;
    let maxCombo = 0;
    let correctCount = 0;
    let timeLeft = isHard ? 80 : 0;
    let locked = false;
    const missedTips = [];

    function avatarHtml(c) {
      const url = window.ASSETS_MANIFEST.getImageUrl(c.imgKey);
      return url ? `<img src="${url}" alt="${c.name}" />` : c.avatar;
    }

    function render() {
      const c = deck[idx];
      if (!c) return finishGame();
      scrollTop && scrollTop();

      const hintText = !isHard ? window.GAME_CONTENT.getEasyHint('swipe', c) : '';

      stage.innerHTML = `
        <div class="hud-row">
          <div class="hud-item">📋 案件<span class="hud-val">${idx + 1}/${deck.length}</span></div>
          <div class="hud-item">${isHard ? '⏱️ 剩餘' : '🌿 節奏'}<span class="hud-val ${isHard ? '' : 'good'}" id="sw-timer">${isHard ? `${timeLeft}s` : '不限時'}</span></div>
          <div class="hud-item">🔥 連擊<span class="hud-val combo" id="sw-combo">${combo}x</span></div>
          <div class="hud-item">🏆 分數<span class="hud-val good" id="sw-score">${score}</span></div>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${(idx / deck.length) * 100}%"></div></div>

        <div class="swipe-arena" id="sw-arena">
          <div id="sw-feedback"></div>

          <div class="applicant-card card-enter" id="swipe-card">
            <div class="stamp-overlay approve" id="stamp-ok">✅ 核准</div>
            <div class="stamp-overlay reject" id="stamp-ng">❌ 退件</div>
            <div class="applicant-header">
              <div class="applicant-avatar">${avatarHtml(c)}</div>
              <div>
                <span class="applicant-fund-badge">${c.fund}</span>
                <div class="applicant-name">${c.name}</div>
              </div>
            </div>
            <div class="applicant-facts">
              <div class="fact-chip"><small>🎂 年齡／資格</small><strong>${c.age}</strong></div>
              <div class="fact-chip"><small>💼 職業／身分</small><strong>${c.job}</strong></div>
            </div>
            <div class="applicant-note">${c.note}</div>
            ${!isHard ? `
              <div class="elder-hint-wrap">
                <button type="button" id="btn-sw-hint" class="elder-hint-btn">💡 不確定？問小管家（免費提示）</button>
                <div id="sw-hint-box" class="elder-hint-box hidden">🎪 小管家提示：${hintText}</div>
              </div>
            ` : '<div class="swipe-hint-strip">👈 左滑蓋退件 ｜ 右滑蓋核准 👉</div>'}
          </div>
        </div>
      `;

      stage.querySelector('#btn-sw-hint')?.addEventListener('click', (e) => {
        window.SOUND.click();
        document.getElementById('sw-hint-box')?.classList.remove('hidden');
        e.currentTarget.classList.add('hidden');
      });

      const bar = setBottomBar(`
        <div class="stamp-bar-grid">
          <button id="btn-sw-reject" class="stamp-action-btn stamp-btn-reject">
            ❌ 蓋章退件
            <small>拒絕 ／ 左滑</small>
          </button>
          <button id="btn-sw-approve" class="stamp-action-btn stamp-btn-approve">
            ✅ 蓋章核准
            <small>承保 ／ 右滑</small>
          </button>
        </div>
      `);
      bar?.querySelector('#btn-sw-reject')?.addEventListener('click', () => decide(false));
      bar?.querySelector('#btn-sw-approve')?.addEventListener('click', () => decide(true));

      bindCardDrag();
    }

    function bindCardDrag() {
      const card = document.getElementById('swipe-card');
      const stOk = document.getElementById('stamp-ok');
      const stNg = document.getElementById('stamp-ng');
      if (!card) return;

      let startX = 0, startY = 0, dx = 0;
      let dragging = false, horizontalLocked = false;

      card.addEventListener('pointerdown', (e) => {
        if (locked || e.target.closest('button')) return;
        dragging = true;
        horizontalLocked = false;
        startX = e.clientX;
        startY = e.clientY;
        dx = 0;
      });
      card.addEventListener('pointermove', (e) => {
        if (!dragging || locked) return;
        const curDx = e.clientX - startX;
        const curDy = e.clientY - startY;
        if (!horizontalLocked) {
          if (Math.abs(curDy) > 10 && Math.abs(curDy) > Math.abs(curDx)) {
            dragging = false;
            return;
          }
          if (Math.abs(curDx) > 14) {
            horizontalLocked = true;
            card.classList.add('dragging');
            try { card.setPointerCapture(e.pointerId); } catch {}
          } else return;
        }
        dx = curDx;
        card.style.transform = `translateX(${dx}px) rotate(${dx * 0.045}deg)`;
        stOk?.classList.toggle('show', dx > 35);
        stNg?.classList.toggle('show', dx < -35);
      });
      const onUp = () => {
        if (!dragging) return;
        dragging = false;
        card.classList.remove('dragging');
        if (horizontalLocked && dx > 80) decide(true);
        else if (horizontalLocked && dx < -80) decide(false);
        else {
          card.style.transform = '';
          stOk?.classList.remove('show');
          stNg?.classList.remove('show');
        }
        horizontalLocked = false;
      };
      card.addEventListener('pointerup', onUp);
      card.addEventListener('pointercancel', onUp);
    }

    function decide(playerApprove) {
      if (locked) return;
      locked = true;
      const c = deck[idx];
      const card = document.getElementById('swipe-card');
      const arena = document.getElementById('sw-arena');
      const stampEl = document.getElementById(playerApprove ? 'stamp-ok' : 'stamp-ng');
      if (card) card.style.transform = '';
      if (stampEl) stampEl.classList.add('show', 'stamp-slam');

      window.SOUND.stamp(playerApprove);
      const isRight = playerApprove === c.approve;
      window.ISLAND_3D && window.ISLAND_3D.pulseBooth && window.ISLAND_3D.pulseBooth('game1', isRight);

      let pts = 0;
      if (isRight) {
        combo += 1;
        maxCombo = Math.max(maxCombo, combo);
        correctCount += 1;
        pts = 120 + Math.min(combo - 1, 5) * 20;
        score += pts;
        window.SOUND.correct(combo);
        if (combo >= 3) {
          window.SOUND.confetti();
          spawnMiniConfetti(arena);
        }
        window.SOUND.playReaction(true, combo, c.voiceKey || null);
        spawnFloatPop(arena, combo >= 3 ? `🔥 ${combo}連擊！+${pts}` : `+${pts} 分`, true);
      } else {
        combo = 0;
        window.SOUND.wrong();
        window.SOUND.playReaction(false, 0, c.voiceKey || null);
        missedTips.push(`${c.name}（${c.fund}）：${c.explain}`);
        spawnFloatPop(arena, '蓋錯章囉！', false);
        card?.classList.add('card-shake');
      }

      const scEl = document.getElementById('sw-score');
      const cbEl = document.getElementById('sw-combo');
      if (scEl) scEl.textContent = score;
      if (cbEl) cbEl.textContent = `${combo}x`;

      flyTimer = setTimeout(() => {
        window.SOUND.whoosh();
        if (card) card.classList.add(playerApprove ? 'card-fly-right' : 'card-fly-left');
        setTimeout(() => {
          if (card) card.classList.add('hidden');
          const fb = document.getElementById('sw-feedback');
          if (fb) {
            fb.innerHTML = `
              <div class="verdict-mini-head">
                <div class="applicant-avatar" style="width:56px;height:56px;font-size:1.8rem;">${avatarHtml(c)}</div>
                <div>
                  <span class="applicant-fund-badge">${c.fund}</span>
                  <strong style="display:block;font-size:1.05rem;">${c.name}（${c.age}・${c.job}）</strong>
                </div>
              </div>
              <div class="feedback-box ${isRight ? 'ok' : 'ng'}" style="margin-top:8px;">
                <strong>${isRight ? `✅ 審核正確！+${pts} 分（連擊 ${combo}x）` : `❌ 蓋錯章囉！（正確應為：${c.approve ? '✅ 核准' : '❌ 退件'}）`}</strong>
                <div>${c.explain}</div>
                <span class="feedback-taigi">🗣️ ${c.taigi}</span>
              </div>
            `;
          }
          scrollTop && scrollTop();
        }, 230);
      }, 210);

      const label = idx === deck.length - 1 ? '查看核保結算 🏆' : '下一位社員 →';
      const bar = setBottomBar(`<button id="btn-sw-next" class="btn-primary btn-full">${label}</button>`);
      bar?.querySelector('#btn-sw-next')?.addEventListener('click', advanceNext);
    }

    function advanceNext() {
      if (!locked) return;
      if (flyTimer) { clearTimeout(flyTimer); flyTimer = null; }
      window.SOUND.click();
      idx += 1;
      locked = false;
      if (idx >= deck.length) finishGame();
      else render();
    }

    function finishGame() {
      cleanup();
      const timeBonus = isHard ? Math.max(0, timeLeft) * 4 : 0;
      const totalScore = score + timeBonus;
      const acc = deck.length ? Math.round((correctCount / deck.length) * 100) : 0;
      const stars = acc >= 80 ? 3 : acc >= 60 ? 2 : acc >= 40 ? 1 : 0;
      onFinish({
        stars,
        score: totalScore,
        stats: [
          { label: '審核正確率', val: `${acc}%` },
          { label: '最高連擊', val: `${maxCombo}x` },
          { label: '總分', val: totalScore }
        ],
        quote: stars === 3 ? '火眼金睛！連馬戲團馴獸師跟年齡紅線都逃不過你的法眼！' : '不錯喔！遇到不確定的題目隨時點「💡 問小管家」，馬上變身核保神手！',
        tips: missedTips.length ? missedTips.slice(0, 3) : ['全數掌握拒保職業、年齡紅線與幹部規範，滿分表現！']
      });
    }

    keyHandler = (e) => {
      if (isPaused()) return;
      if (locked) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advanceNext(); }
        return;
      }
      if (e.key === 'ArrowLeft') decide(false);
      else if (e.key === 'ArrowRight') decide(true);
    };
    window.addEventListener('keydown', keyHandler);

    // Countdown timer ONLY in 🔥 Hard mode! Easy mode is 100% stress-free!
    if (isHard) {
      timerId = setInterval(() => {
        if (isPaused() || locked) return;
        timeLeft -= 1;
        const el = document.getElementById('sw-timer');
        if (el) el.textContent = `${timeLeft}s`;
        if (timeLeft <= 10 && timeLeft > 0) window.SOUND.tick();
        if (timeLeft <= 0) finishGame();
      }, 1000);
    }

    render();
  }

  return { mount, cleanup };
})();
