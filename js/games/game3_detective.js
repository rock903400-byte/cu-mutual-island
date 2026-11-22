/* ==========================================================================
   攤位 3：理賠神算偵探社（手機特大字案件推理＋固定底部下一步按鈕）
   ========================================================================== */
window.GAME_DETECTIVE = (function () {
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
    const cases = window.GAME_CONTENT.detectiveCases.filter(c => isHard ? true : c.diff === 'both');
    const deck = isHard ? shuffle(cases).slice(0, 7) : cases.slice();

    let idx = 0;
    let score = 0;
    let solved = 0;
    let locked = false;
    const missedTips = [];

    function render() {
      const c = deck[idx];
      const opts = shuffle(c.choices);
      setBottomBar('');
      scrollTop && scrollTop();

      stage.innerHTML = `
        <div class="hud-row">
          <div class="hud-item">📁 卷宗<span class="hud-val">${idx + 1}/${deck.length}</span></div>
          <div class="hud-item">🔎 已破案<span class="hud-val good">${solved} 件</span></div>
          <div class="hud-item">🏆 積分<span class="hud-val">${score}</span></div>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${(idx / deck.length) * 100}%"></div></div>

        <div id="dt-feedback"></div>

        <div class="detective-folder">
          <span class="folder-tab">🔍 ${c.tag}</span>
          <h3 class="case-title">${c.title}</h3>
          <div class="case-story">${c.story}</div>

          <div class="case-timeline">
            ${c.timeline.map(n => `
              <div class="tl-node"><small>${n.label}</small><strong>${n.val}</strong></div>
            `).join('')}
          </div>

          <div class="case-question">❓ ${c.question}</div>
          <div class="calc-choices">
            ${opts.map((o, i) => `
              <button class="calc-btn" data-idx="${i}">
                <span class="calc-amount">${o.amount}</span>
                <span class="calc-reason">${isHard ? '點擊判定此結果' : o.reason}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;

      stage.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          const chosen = opts[Number(btn.dataset.idx)];
          stage.querySelectorAll('.calc-btn').forEach((b, i) => {
            b.disabled = true;
            if (opts[i].ok) b.classList.add('correct');
            else if (b === btn) b.classList.add('wrong');
          });

          const fb = document.getElementById('dt-feedback');
          if (chosen.ok) {
            solved += 1;
            const pts = isHard ? 200 : 160;
            score += pts;
            window.SOUND.correct(solved);
            window.SOUND.playVoice('taigi_good');
            fb.innerHTML = `
              <div class="feedback-box ok" style="margin-bottom:12px;margin-top:0;">
                <strong>🎯 完美破案！+${pts} 分</strong>
                <div>${c.explain}</div>
                <span class="feedback-taigi">🗣️ ${c.taigi}</span>
              </div>
            `;
          } else {
            window.SOUND.wrong();
            window.SOUND.playVoice('taigi_reject');
            missedTips.push(`${c.title}：${c.explain}`);
            fb.innerHTML = `
              <div class="feedback-box ng" style="margin-bottom:12px;margin-top:0;">
                <strong>🧩 差一點就破案！真相解析：</strong>
                <div>${c.explain}</div>
              </div>
            `;
          }

          scrollTop && scrollTop();
          const label = idx === deck.length - 1 ? '結案領獎 🏆' : '翻閱下一件卷宗 →';
          const bar = setBottomBar(`<button id="btn-dt-next" class="btn-primary btn-full">${label}</button>`);
          bar?.querySelector('#btn-dt-next')?.addEventListener('click', () => {
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
      const acc = Math.round((solved / deck.length) * 100);
      const stars = acc >= 85 ? 3 : acc >= 60 ? 2 : acc >= 35 ? 1 : 0;
      onFinish({
        stars,
        score,
        stats: [
          { label: '成功破案', val: `${solved}/${deck.length}` },
          { label: '準確率', val: `${acc}%` },
          { label: '總分', val: score }
        ],
        quote: stars === 3 ? '名偵探互助南！連最燒腦的 LS 退股與 LP 削減都被你一眼看穿！' : '理賠條款藏著很多小細節，隨時點右上 📖 翻圖鑑對照表格喔！',
        tips: missedTips.length ? missedTips.slice(0, 3) : ['LP 削減、LS 退股水位、等待期天數與骨折比例全部滿分通關！']
      });
    }

    render();
  }

  return { mount, cleanup: () => {} };
})();
