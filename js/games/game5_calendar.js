/* ==========================================================================
   攤位 5：25 號送件大亂鬥（手機 2×3 特大郵筒鍵盤＋頂部大字解析＋底部下一步）
   ========================================================================== */
window.GAME_CALENDAR = (function () {
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
    const pool = window.GAME_CONTENT.calendarQuestions.filter(q => isHard ? true : q.diff === 'both');
    const deck = shuffle(pool);

    let idx = 0;
    let score = 0;
    let combo = 0;
    let correct = 0;
    let timeLeft = isHard ? 75 : 105;
    let locked = false;
    const missedTips = [];

    function render() {
      const q = deck[idx];
      if (!q) return finish();
      const boxes = window.GAME_CONTENT.calendarMailboxes[q.mode];
      setBottomBar('');
      scrollTop && scrollTop();

      stage.innerHTML = `
        <div class="hud-row">
          <div class="hud-item">📮 信封<span class="hud-val">${idx + 1}/${deck.length}</span></div>
          <div class="hud-item">⏱️ 倒數<span class="hud-val" id="cal-timer">${timeLeft}s</span></div>
          <div class="hud-item">🔥 連擊<span class="hud-val combo">${combo}x</span></div>
          <div class="hud-item">🏆 分數<span class="hud-val good">${score}</span></div>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${(idx / deck.length) * 100}%"></div></div>

        <div id="cal-feedback"></div>

        <div class="envelope-card">
          <div class="envelope-stamp"><span>每月</span><strong style="font-size:1rem;">25日</strong></div>
          <span class="envelope-mode-tag">${q.badge}</span>
          <h3 class="envelope-title">${q.title}</h3>
          <p class="envelope-sub">${q.sub}</p>
        </div>

        <h4 style="margin:0 0 10px;color:#7A4882;font-size:0.96rem;">👇 點選正確郵筒投遞：</h4>
        <div class="mailbox-grid">
          ${boxes.map(b => `
            <button class="mailbox-btn" data-bid="${b.id}">
              <span class="mailbox-icon">📮</span>
              <span class="mailbox-label">${b.label}</span>
              <span class="mailbox-hint">${isHard ? '點擊投遞' : b.hint}</span>
            </button>
          `).join('')}
        </div>
      `;

      stage.querySelectorAll('.mailbox-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          const picked = btn.dataset.bid;
          const isOk = picked === q.answer;

          stage.querySelectorAll('.mailbox-btn').forEach(b => {
            b.disabled = true;
            if (b.dataset.bid === q.answer) b.classList.add('correct');
            else if (b === btn) b.classList.add('wrong');
          });

          const fb = document.getElementById('cal-feedback');
          if (isOk) {
            combo += 1;
            correct += 1;
            const pts = 110 + Math.min(combo - 1, 5) * 20;
            score += pts;
            window.SOUND.correct(combo);
            window.SOUND.playVoice('taigi_good');
            fb.innerHTML = `
              <div class="feedback-box ok" style="margin-bottom:12px;margin-top:0;">
                <strong>📬 準時送達！+${pts} 分（連擊 ${combo}x）</strong>
                <div>${q.explain}</div>
                <span class="feedback-taigi">🗣️ ${q.taigi}</span>
              </div>
            `;
          } else {
            combo = 0;
            window.SOUND.wrong();
            window.SOUND.playVoice('taigi_reject');
            missedTips.push(`${q.title}：${q.explain}`);
            fb.innerHTML = `
              <div class="feedback-box ng" style="margin-bottom:12px;margin-top:0;">
                <strong>📨 投錯郵筒囉！</strong>
                <div>${q.explain}</div>
              </div>
            `;
          }

          scrollTop && scrollTop();
          const label = idx === deck.length - 1 ? '查看郵務結算 🏆' : '下一封信封 →';
          const bar = setBottomBar(`<button id="btn-cal-next" class="btn-primary btn-full">${label}</button>`);
          bar?.querySelector('#btn-cal-next')?.addEventListener('click', advanceNext);
        });
      });
    }

    function advanceNext() {
      if (!locked) return;
      window.SOUND.click();
      idx += 1;
      locked = false;
      if (idx >= deck.length) finish();
      else render();
    }

    keyHandler = (e) => {
      if (isPaused() || !locked) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advanceNext(); }
    };
    window.addEventListener('keydown', keyHandler);

    function finish() {
      cleanup();
      const timeBonus = Math.max(0, timeLeft) * 3;
      const totalScore = score + timeBonus;
      const acc = deck.length ? Math.round((correct / deck.length) * 100) : 0;
      const stars = acc >= 85 ? 3 : acc >= 65 ? 2 : acc >= 40 ? 1 : 0;
      onFinish({
        stars,
        score: totalScore,
        stats: [
          { label: '準時送件', val: `${acc}%` },
          { label: '投對信封', val: `${correct}/${deck.length}` },
          { label: '總分', val: totalScore }
        ],
        quote: stars === 3 ? '最速送件王！3/4/6/8/9/10 開保月跟 25 號截止線全刻在腦海裡！' : '小口訣：3 幹部、4 團體、6 防癌、8 重疾、9 意外、10 松年，每月 25 號前送件次月生效！',
        tips: missedTips.length ? missedTips.slice(0, 3) : ['零遲到滿分！每份名冊都能準時在次月 1 日生效！']
      });
    }

    timerId = setInterval(() => {
      if (isPaused() || locked) return;
      timeLeft -= 1;
      const el = document.getElementById('cal-timer');
      if (el) el.textContent = `${timeLeft}s`;
      if (timeLeft <= 10 && timeLeft > 0) window.SOUND.tick();
      if (timeLeft <= 0) finish();
    }, 1000);

    render();
  }

  return { mount, cleanup };
})();
