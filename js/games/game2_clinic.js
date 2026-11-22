/* ==========================================================================
   攤位 2：互助配對診所（手機特大字方案配對＋底部固定下一步按鈕）
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
    const deck = shuffle(cases);

    let idx = 0;
    let score = 0;
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
      setBottomBar('');
      scrollTop && scrollTop();

      stage.innerHTML = `
        <div class="hud-row">
          <div class="hud-item">🩺 候診社員<span class="hud-val">${idx + 1}/${deck.length}</span></div>
          <div class="hud-item">✅ 滿意數<span class="hud-val good">${correct}/${deck.length}</span></div>
          <div class="hud-item">🏆 分數<span class="hud-val">${score}</span></div>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${(idx / deck.length) * 100}%"></div></div>

        <div id="clinic-feedback"></div>

        <div class="patient-box">
          <div class="patient-head">
            <div class="patient-avatar">${avatarHtml(c)}</div>
            <h3 style="font-size:1.12rem;">🙋 ${c.name}</h3>
          </div>
          <div class="patient-speech">
            <p>${c.speech}</p>
            <div class="patient-clues">
              ${c.clues.map(cl => `<span class="clue-pill">📌 ${cl}</span>`).join('')}
            </div>
          </div>
        </div>

        <h4 style="margin:0 0 10px;color:#156046;font-size:0.98rem;">👇 點選最適合的互助方案：</h4>
        <div class="clinic-options">
          ${opts.map((o, i) => `
            <button class="plan-choice-btn" data-idx="${i}">
              <span class="plan-choice-title">${o.title}</span>
              <span class="plan-choice-sub">${isHard ? '（魔王版隱藏細節，可點右上 📖 查圖鑑！）' : o.sub}</span>
            </button>
          `).join('')}
        </div>
      `;

      stage.querySelectorAll('.plan-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          const chosen = opts[Number(btn.dataset.idx)];
          stage.querySelectorAll('.plan-choice-btn').forEach((b, i) => {
            b.disabled = true;
            if (opts[i].ok) b.classList.add('correct');
            else if (b === btn) b.classList.add('wrong');
          });

          const fb = document.getElementById('clinic-feedback');
          if (chosen.ok) {
            correct += 1;
            score += isHard ? 180 : 150;
            window.SOUND.correct(correct);
            window.SOUND.playVoice('taigi_good');
            fb.innerHTML = `
              <div class="feedback-box ok" style="margin-bottom:12px;margin-top:0;">
                <strong>🌟 完美處方！+${isHard ? 180 : 150} 分</strong>
                <div>${c.explain}</div>
                <span class="feedback-taigi">🗣️ ${c.taigi}</span>
              </div>
            `;
          } else {
            window.SOUND.wrong();
            window.SOUND.playVoice('taigi_reject');
            missedTips.push(`${c.name}：${c.explain}`);
            fb.innerHTML = `
              <div class="feedback-box ng" style="margin-bottom:12px;margin-top:0;">
                <strong>💡 這個方案不太合適喔！</strong>
                <div>${c.explain}</div>
              </div>
            `;
          }

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
      const stars = acc >= 85 ? 3 : acc >= 65 ? 2 : acc >= 40 ? 1 : 0;
      onFinish({
        stars,
        score,
        stats: [
          { label: '配對成功', val: `${correct}/${deck.length}` },
          { label: '滿意度', val: `${acc}%` },
          { label: '總分', val: score }
        ],
        quote: stars === 3 ? '金牌互助規劃師！每位社員都帶走最暖心的保障！' : '每個計畫都有黃金適用年齡，多逛幾次圖鑑就全記住啦！',
        tips: missedTips.length ? missedTips.slice(0, 3) : ['從 1 歲 E 計畫到 76 歲松年意外與幹部方案都精準配對！']
      });
    }

    render();
  }

  return { mount, cleanup: () => {} };
})();
