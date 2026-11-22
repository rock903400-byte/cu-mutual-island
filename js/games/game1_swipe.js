/* ==========================================================================
   攤位 1：核保快刷！過關還是退件？（手機單手底部大印章列＋特大字高對比）
   ========================================================================== */
window.GAME_SWIPE = (function () {
  let timerId = null;
  let keyHandler = null;

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
    if (keyHandler) { window.removeEventListener('keydown', keyHandler); keyHandler = null; }
  }

  function mount(stage, { diff, isPaused, setBottomBar, scrollTop, onFinish }) {
    cleanup();
    const isHard = diff === 'hard';
    const pool = window.GAME_CONTENT.swipeCases.filter(c => isHard ? true : c.diff === 'both');
    const deck = shuffle(pool).slice(0, isHard ? 12 : 8);

    let idx = 0;
    let score = 0;
    let combo = 0;
    let maxCombo = 0;
    let correctCount = 0;
    let timeLeft = isHard ? 75 : 110;
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

      stage.innerHTML = `
        <div class="hud-row">
          <div class="hud-item">📋 案件<span class="hud-val">${idx + 1}/${deck.length}</span></div>
          <div class="hud-item">⏱️ 剩餘<span class="hud-val" id="sw-timer">${timeLeft}s</span></div>
          <div class="hud-item">🔥 連擊<span class="hud-val combo">${combo}x</span></div>
          <div class="hud-item">🏆 分數<span class="hud-val good">${score}</span></div>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${(idx / deck.length) * 100}%"></div></div>

        <div id="sw-feedback"></div>

        <div class="applicant-card" id="swipe-card">
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
        </div>
      `;

      // Pin big red/green stamp buttons in bottom thumb zone!
      const bar = setBottomBar(`
        <div class="stamp-bar-grid">
          <button id="btn-sw-reject" class="stamp-action-btn stamp-btn-reject">
            ❌ 蓋章退件
            <small>往左滑 ／ 拒絕</small>
          </button>
          <button id="btn-sw-approve" class="stamp-action-btn stamp-btn-approve">
            ✅ 蓋章核准
            <small>往右滑 ／ 承保</small>
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
        if (locked) return;
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
        card.style.transform = `translateX(${dx}px) rotate(${dx * 0.04}deg)`;
        stOk?.classList.toggle('show', dx > 35);
        stNg?.classList.toggle('show', dx < -35);
      });
      const onUp = () => {
        if (!dragging) return;
        dragging = false;
        card.classList.remove('dragging');
        if (horizontalLocked && dx > 85) decide(true);
        else if (horizontalLocked && dx < -85) decide(false);
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
      if (card) card.style.transform = '';
      document.getElementById(playerApprove ? 'stamp-ok' : 'stamp-ng')?.classList.add('show');

      window.SOUND.stamp(playerApprove);
      const isRight = playerApprove === c.approve;
      const fb = document.getElementById('sw-feedback');

      if (isRight) {
        combo += 1;
        maxCombo = Math.max(maxCombo, combo);
        correctCount += 1;
        const pts = 100 + Math.min(combo - 1, 5) * 20;
        score += pts;
        window.SOUND.correct(combo);
        if (c.voiceKey) window.SOUND.playVoice(c.voiceKey);
        if (fb) {
          fb.innerHTML = `
            <div class="feedback-box ok" style="margin-bottom:12px;margin-top:0;">
              <strong>✅ 審核正確！+${pts} 分（連擊 ${combo}x）</strong>
              <div>${c.explain}</div>
              <span class="feedback-taigi">🗣️ ${c.taigi}</span>
            </div>
          `;
        }
      } else {
        combo = 0;
        window.SOUND.wrong();
        missedTips.push(`${c.name}（${c.fund}）：${c.explain}`);
        if (fb) {
          fb.innerHTML = `
            <div class="feedback-box ng" style="margin-bottom:12px;margin-top:0;">
              <strong>❌ 蓋錯章囉！（正確：${c.approve ? '核准' : '退件'}）</strong>
              <div>${c.explain}</div>
              <span class="feedback-taigi">🗣️ ${c.taigi}</span>
            </div>
          `;
        }
      }

      scrollTop && scrollTop();
      const label = idx === deck.length - 1 ? '查看核保結算 🏆' : '下一位社員 →';
      const bar = setBottomBar(`<button id="btn-sw-next" class="btn-primary btn-full">${label}</button>`);
      bar?.querySelector('#btn-sw-next')?.addEventListener('click', advanceNext);
    }

    function advanceNext() {
      if (!locked) return;
      window.SOUND.click();
      idx += 1;
      locked = false;
      if (idx >= deck.length) finishGame();
      else render();
    }

    function finishGame() {
      cleanup();
      const timeBonus = Math.max(0, timeLeft) * 4;
      const totalScore = score + timeBonus;
      const acc = deck.length ? Math.round((correctCount / deck.length) * 100) : 0;
      const stars = acc >= 88 ? 3 : acc >= 65 ? 2 : acc >= 40 ? 1 : 0;
      onFinish({
        stars,
        score: totalScore,
        stats: [
          { label: '審核正確率', val: `${acc}%` },
          { label: '最高連擊', val: `${maxCombo}x` },
          { label: '總分', val: totalScore }
        ],
        quote: stars === 3 ? '火眼金睛！連馬戲團馴獸師跟超額顧問都逃不過你的法眼！' : '不錯喔！多翻幾次圖鑑，馬上變身核保神手！',
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

    timerId = setInterval(() => {
      if (isPaused() || locked) return;
      timeLeft -= 1;
      const el = document.getElementById('sw-timer');
      if (el) el.textContent = `${timeLeft}s`;
      if (timeLeft <= 10 && timeLeft > 0) window.SOUND.tick();
      if (timeLeft <= 0) finishGame();
    }, 1000);

    render();
  }

  return { mount, cleanup };
})();
