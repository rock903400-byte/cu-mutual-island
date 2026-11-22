/* ==========================================================================
   攤位 5：25 號送件大亂鬥 (v15)
   - 🌱 輕鬆安心版：不限時、5 封精選信封＋口訣小抄＋免費「💡 問小管家」單題提示
   - 🔥 幹部魔王版：85 秒限時、11 封含年度最後受理截止日實戰
   ========================================================================== */
window.GAME_CALENDAR = (function () {
  let timerId = null;
  let keyHandler = null;
  let deliverTimer = null;

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
    if (deliverTimer) { clearTimeout(deliverTimer); deliverTimer = null; }
    if (keyHandler) { window.removeEventListener('keydown', keyHandler); keyHandler = null; }
  }

  function mount(stage, { diff, isPaused, setBottomBar, scrollTop, onFinish }) {
    cleanup();
    const isHard = diff === 'hard';
    const starts = shuffle(window.GAME_CONTENT.calendarQuestions.filter(q => q.mode === 'startMonths'));
    const cutoffs = shuffle(window.GAME_CONTENT.calendarQuestions.filter(q => q.mode === 'cutoffs'));
    const counters = window.GAME_CONTENT.buildDynamicCounterQuestions
      ? window.GAME_CONTENT.buildDynamicCounterQuestions()
      : [];

    // Easy: 5 cozy envelopes (3 start-month + 2 everyday 25-day counter); Hard: 11 timed!
    const deck = isHard
      ? shuffle([...starts.slice(0, 4), ...cutoffs.slice(0, 4), ...counters.slice(0, 3)])
      : shuffle([...starts.slice(0, 3), ...counters.slice(0, 2)]);

    let idx = 0;
    let score = 0;
    let combo = 0;
    let correct = 0;
    let timeLeft = isHard ? 85 : 0;
    let locked = false;
    let showMnemonic = false;
    const missedTips = [];

    function render() {
      const q = deck[idx];
      if (!q) return finish();
      const boxes = window.GAME_CONTENT.calendarMailboxes[q.mode];
      const hintText = !isHard ? window.GAME_CONTENT.getEasyHint('calendar', q) : '';
      setBottomBar('');
      scrollTop && scrollTop();
      window.SOUND.whoosh();

      stage.innerHTML = `
        <div class="hud-row">
          <div class="hud-item">📮 信封<span class="hud-val">${idx + 1}/${deck.length}</span></div>
          <div class="hud-item">${isHard ? '⏱️ 倒數' : '🌿 節奏'}<span class="hud-val ${isHard ? '' : 'good'}" id="cal-timer">${isHard ? `${timeLeft}s` : '不限時'}</span></div>
          <div class="hud-item">🔥 連擊<span class="hud-val combo" id="cal-combo">${combo}x</span></div>
          <div class="hud-item">🏆 分數<span class="hud-val good" id="cal-score">${score}</span></div>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${(idx / deck.length) * 100}%"></div></div>

        ${!isHard ? `
          <div class="mnemonic-wrap">
            <button type="button" id="btn-toggle-mnemonic" class="mnemonic-toggle">
              💡 ${showMnemonic ? '隱藏口訣小抄 ▲' : '偷看開保月＆25號口訣小抄 ▼'}
            </button>
            <div id="mnemonic-card" class="mnemonic-card ${showMnemonic ? '' : 'hidden'}">
              <strong>📌 順口溜：</strong>「<strong>3</strong> 幹部、<strong>4</strong> 團體、<strong>6</strong> 防癌、<strong>8</strong> 重疾、<strong>9</strong> 意外、<strong>10</strong> 松年」<br/>
              <strong>⏰ 25 號鐵律：</strong>當月 25 日前送達協會 → 次月 1 日生效；超過 25 日順延 1 個月！
            </div>
          </div>
        ` : ''}

        <div id="cal-feedback"></div>

        <div class="envelope-card envelope-slide-in" id="cal-envelope">
          <div class="envelope-stamp"><span>每月</span><strong style="font-size:1rem;">25日</strong></div>
          <span class="envelope-mode-tag">${q.badge}</span>
          <h3 class="envelope-title">${q.title}</h3>
          <p class="envelope-sub">${q.sub}</p>
          ${!isHard ? `
            <div class="elder-hint-wrap" style="margin-bottom:0;">
              <button type="button" id="btn-cal-hint" class="elder-hint-btn">💡 不確定投哪個？問小管家（免費提示）</button>
              <div id="cal-hint-box" class="elder-hint-box hidden">🎪 小管家提示：${hintText}</div>
            </div>
          ` : ''}
        </div>

        <h4 style="margin:0 0 10px;color:#7A4882;font-size:0.96rem;">👇 點選正確郵筒投遞：</h4>
        <div class="mailbox-grid ${boxes.length === 3 ? 'mailbox-grid-3' : ''}">
          ${boxes.map(b => `
            <button class="mailbox-btn" data-bid="${b.id}">
              <span class="mailbox-icon">📮</span>
              <span class="mailbox-label">${b.label}</span>
              <span class="mailbox-hint">${isHard ? '點擊投遞' : b.hint}</span>
            </button>
          `).join('')}
        </div>
      `;

      stage.querySelector('#btn-toggle-mnemonic')?.addEventListener('click', () => {
        window.SOUND.click();
        showMnemonic = !showMnemonic;
        document.getElementById('mnemonic-card')?.classList.toggle('hidden', !showMnemonic);
        const btn = document.getElementById('btn-toggle-mnemonic');
        if (btn) btn.textContent = `💡 ${showMnemonic ? '隱藏口訣小抄 ▲' : '偷看開保月＆25號口訣小抄 ▼'}`;
      });

      stage.querySelector('#btn-cal-hint')?.addEventListener('click', (e) => {
        window.SOUND.click();
        document.getElementById('cal-hint-box')?.classList.remove('hidden');
        e.currentTarget.classList.add('hidden');
      });

      stage.querySelectorAll('.mailbox-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          const picked = btn.dataset.bid;
          const isOk = picked === q.answer;
          const env = document.getElementById('cal-envelope');

          window.SOUND.stamp(isOk);
          if (env) env.classList.add('envelope-deliver');

          stage.querySelectorAll('.mailbox-btn').forEach(b => {
            b.disabled = true;
            if (b.dataset.bid === q.answer) b.classList.add('correct');
            else if (b === btn) b.classList.add('wrong');
          });

          window.ISLAND_3D && window.ISLAND_3D.pulseBooth && window.ISLAND_3D.pulseBooth('game5', isOk);

          let pts = 0;
          if (isOk) {
            combo += 1;
            correct += 1;
            pts = 120 + Math.min(combo - 1, 5) * 20;
            score += pts;
            window.SOUND.correct(combo);
            window.SOUND.playReaction(true, combo, q.voiceKey || (combo === 4 ? 'taigi_mail' : null));
          } else {
            combo = 0;
            window.SOUND.wrong();
            window.SOUND.playReaction(false, 0);
            missedTips.push(`${q.title}：${q.explain}`);
          }

          const scEl = document.getElementById('cal-score');
          const cbEl = document.getElementById('cal-combo');
          if (scEl) scEl.textContent = score;
          if (cbEl) cbEl.textContent = `${combo}x`;

          deliverTimer = setTimeout(() => {
            const fb = document.getElementById('cal-feedback');
            if (fb) {
              fb.innerHTML = isOk
                ? `
                  <div class="feedback-box ok" style="margin-bottom:12px;margin-top:0;">
                    <strong>📬 準時投遞成功！+${pts} 分（連擊 ${combo}x）</strong>
                    <div>${q.explain}</div>
                    <span class="feedback-taigi">🗣️ ${q.taigi}</span>
                  </div>
                `
                : `
                  <div class="feedback-box ng" style="margin-bottom:12px;margin-top:0;">
                    <strong>📨 投錯郵筒囉！</strong>
                    <div>${q.explain}</div>
                  </div>
                `;
            }
            scrollTop && scrollTop();
          }, 190);

          const label = idx === deck.length - 1 ? '查看郵務結算 🏆' : '下一封信封 →';
          const bar = setBottomBar(`<button id="btn-cal-next" class="btn-primary btn-full">${label}</button>`);
          bar?.querySelector('#btn-cal-next')?.addEventListener('click', advanceNext);
        });
      });
    }

    function advanceNext() {
      if (!locked) return;
      if (deliverTimer) { clearTimeout(deliverTimer); deliverTimer = null; }
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
      const timeBonus = isHard ? Math.max(0, timeLeft) * 3 : 0;
      const totalScore = score + timeBonus;
      const acc = deck.length ? Math.round((correct / deck.length) * 100) : 0;
      const stars = acc >= 80 ? 3 : acc >= 60 ? 2 : acc >= 40 ? 1 : 0;
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

    // Countdown timer ONLY in 🔥 Hard mode!
    if (isHard) {
      timerId = setInterval(() => {
        if (isPaused() || locked) return;
        timeLeft -= 1;
        const el = document.getElementById('cal-timer');
        if (el) el.textContent = `${timeLeft}s`;
        if (timeLeft <= 10 && timeLeft > 0) window.SOUND.tick();
        if (timeLeft <= 0) finish();
      }, 1000);
    }

    render();
  }

  return { mount, cleanup };
})();
