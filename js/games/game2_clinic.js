/* ==========================================================================
   攤位 2：互助配對診所 (v15)
   - 🌱 輕鬆安心版：5 題輕量＋免費「💡 問小管家」白話提示＋3 項需求診斷核對
   - 🔥 幹部魔王版：7 題進階轉軌與幹部方案（隱藏方案細項）
   ========================================================================== */
window.GAME_CLINIC = (function () {
  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function mount(stage, { diff, setBottomBar, scrollTop, onFinish }) {
    const isHard = diff === 'hard';
    const cases = window.GAME_CONTENT.clinicCases.filter(c => isHard ? true : c.diff === 'both');
    const deck = shuffle(cases).slice(0, isHard ? 7 : 5);

    let idx = 0;
    let score = 0;
    let combo = 0;
    let correct = 0;
    let locked = false;
    const missedTips = [];

    function avatarHtml(c) {
      const url = window.ASSETS_MANIFEST.getImageUrl(c.imgKey);
      return url ? `<img src="${url}" alt="${c.name}" />` : c.avatar;
    }

    function render() {
      const c = deck[idx];
      const opts = shuffle(c.options);
      const hintText = !isHard ? window.GAME_CONTENT.getEasyHint('clinic', c) : '';
      setBottomBar('');
      scrollTop && scrollTop();

      stage.innerHTML = `
        <div class="hud-row">
          <div class="hud-item">🩺 社員<span class="hud-val">${idx + 1}/${deck.length}</span></div>
          <div class="hud-item">🔥 連擊<span class="hud-val combo" id="cl-combo">${combo}x</span></div>
          <div class="hud-item">✅ 滿意<span class="hud-val good" id="cl-ok">${correct}/${deck.length}</span></div>
          <div class="hud-item">🏆 分數<span class="hud-val" id="cl-score">${score}</span></div>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${(idx / deck.length) * 100}%"></div></div>

        <div id="clinic-feedback"></div>

        <div class="patient-box card-enter">
          <div class="patient-head">
            <div class="patient-avatar">${avatarHtml(c)}</div>
            <div>
              <span class="rx-badge">📋 保障健檢問診單</span>
              <h3 style="font-size:1.12rem;margin-top:3px;">🙋 ${c.name}</h3>
            </div>
          </div>
          <div class="patient-speech">
            <p>${c.speech}</p>
            <div class="patient-clues" id="clinic-clues">
              ${c.clues.map((cl, ci) => `<span class="clue-pill" data-clue-i="${ci}">📌 ${cl}</span>`).join('')}
            </div>
          </div>
          ${!isHard ? `
            <div class="elder-hint-wrap" style="margin-bottom:0;">
              <button type="button" id="btn-cl-hint" class="elder-hint-btn">💡 不確定選哪張？問小管家（免費提示）</button>
              <div id="cl-hint-box" class="elder-hint-box hidden">🎪 小管家提示：${hintText}</div>
            </div>
          ` : ''}
        </div>

        <h4 style="margin:0 0 10px;color:#156046;font-size:0.98rem;">💊 點選一張處方籤，核對上方 3 項條件：</h4>
        <div class="clinic-options">
          ${opts.map((o, i) => `
            <button class="plan-choice-btn" data-idx="${i}">
              <span class="plan-choice-title">${o.title}</span>
              <span class="plan-choice-sub">${isHard ? '（魔王版隱藏規格，可點右上 📖 查圖鑑！）' : o.sub}</span>
            </button>
          `).join('')}
        </div>
      `;

      stage.querySelector('#btn-cl-hint')?.addEventListener('click', (e) => {
        window.SOUND.click();
        document.getElementById('cl-hint-box')?.classList.remove('hidden');
        e.currentTarget.classList.add('hidden');
      });

      stage.querySelectorAll('.plan-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          const chosen = opts[Number(btn.dataset.idx)];
          window.SOUND.stamp(chosen.ok);

          const checks = chosen.checks || (chosen.ok ? [true, true, true] : [false, false, false]);
          stage.querySelectorAll('#clinic-clues .clue-pill').forEach((pill, ci) => {
            const passed = checks[ci] !== false;
            pill.classList.add(passed ? 'clue-pass' : 'clue-fail');
            const raw = c.clues[ci] || '';
            pill.textContent = `${passed ? '✅ 符合｜' : '❌ 不符｜'}${raw}`;
          });

          stage.querySelectorAll('.plan-choice-btn').forEach((b, i) => {
            b.disabled = true;
            if (opts[i].ok) b.classList.add('correct');
            else if (b === btn) b.classList.add('wrong');
          });

          window.ISLAND_3D && window.ISLAND_3D.pulseBooth && window.ISLAND_3D.pulseBooth('game2', chosen.ok);

          const fb = document.getElementById('clinic-feedback');
          if (chosen.ok) {
            combo += 1;
            correct += 1;
            const pts = (isHard ? 180 : 150) + Math.min(combo - 1, 4) * 20;
            score += pts;
            window.SOUND.correct(combo);
            window.SOUND.playReaction(true, combo);
            fb.innerHTML = `
              <div class="feedback-box ok" style="margin-bottom:12px;margin-top:0;">
                <strong>🌟 處方 3 項全命中！+${pts} 分${combo >= 2 ? `（連擊 ${combo}x）` : ''}</strong>
                <div>${c.explain}</div>
                <span class="feedback-taigi">🗣️ ${c.taigi}</span>
              </div>
            `;
          } else {
            combo = 0;
            window.SOUND.wrong();
            window.SOUND.playReaction(false, 0);
            missedTips.push(`${c.name}：${c.explain}`);
            fb.innerHTML = `
              <div class="feedback-box ng" style="margin-bottom:12px;margin-top:0;">
                <strong>💡 看上方紅叉！這張處方有條件不合喔～</strong>
                <div>${c.explain}</div>
              </div>
            `;
          }

          const scEl = document.getElementById('cl-score');
          const cbEl = document.getElementById('cl-combo');
          const okEl = document.getElementById('cl-ok');
          if (scEl) scEl.textContent = score;
          if (cbEl) cbEl.textContent = `${combo}x`;
          if (okEl) okEl.textContent = `${correct}/${deck.length}`;

          scrollTop && scrollTop();
          const label = idx === deck.length - 1 ? '查看診所結算 🏆' : '下一位社員 →';
          const bar = setBottomBar(`<button id="btn-clinic-next" class="btn-primary btn-full">${label}</button>`);
          bar?.querySelector('#btn-clinic-next')?.addEventListener('click', () => {
            window.SOUND.click();
            idx += 1;
            locked = false;
            if (idx >= deck.length) finish();
            else render();
          });
        });
      });
    }

    function finish() {
      const acc = Math.round((correct / deck.length) * 100);
      const stars = acc >= 80 ? 3 : acc >= 60 ? 2 : acc >= 40 ? 1 : 0;
      onFinish({
        stars,
        score,
        stats: [
          { label: '配對成功', val: `${correct}/${deck.length}` },
          { label: '滿意度', val: `${acc}%` },
          { label: '總分', val: score }
        ],
        quote: stars === 3 ? '金牌互助規劃師！每位社員的年齡、預算與保障都精準配對！' : '看清「年齡門檻＋需求＋預算」三條件，隨時點「💡 問小管家」就全記住啦！',
        tips: missedTips.length ? missedTips.slice(0, 3) : ['從兒童 E 計畫、青壯 D 計畫到高齡松年意外與幹部方案全數精準開立！']
      });
    }

    render();
  }

  return { mount, cleanup: () => {} };
})();
