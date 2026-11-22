/* ==========================================================================
   攤位 3：理賠神算偵探社 (v15)
   - 🌱 輕鬆安心版：4 件經典案卷＋免費「💡 不會算？問小管家幫我算」白話提示＋點線索加分
   - 🔥 幹部魔王版：6 件含動態精算數字（隱藏算式）
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
    const staticPool = window.GAME_CONTENT.detectiveCases.filter(c => isHard ? true : c.diff === 'both');
    const dynamicCases = window.GAME_CONTENT.buildDynamicDetectiveCases
      ? window.GAME_CONTENT.buildDynamicDetectiveCases(isHard)
      : [];

    const pickedStatic = shuffle(staticPool).slice(0, isHard ? 4 : 3);
    // 動態題先洗牌再取，魔王版的 LS 退股題才有機會出現
    const deck = shuffle([...pickedStatic, ...shuffle(dynamicCases).slice(0, isHard ? 2 : 1)]);

    let idx = 0;
    let score = 0;
    let solved = 0;
    let clueBonuses = 0;
    let combo = 0;
    let locked = false;
    let clueUnlocked = false;
    const missedTips = [];

    function render() {
      const c = deck[idx];
      const opts = shuffle(c.choices);
      clueUnlocked = false;
      const hintText = !isHard ? window.GAME_CONTENT.getEasyHint('detective', c) : '';
      setBottomBar('');
      scrollTop && scrollTop();

      stage.innerHTML = `
        <div class="hud-row">
          <div class="hud-item">📁 卷宗<span class="hud-val">${idx + 1}/${deck.length}</span></div>
          <div class="hud-item">🔎 破案<span class="hud-val good" id="dt-solved">${solved} 件</span></div>
          <div class="hud-item">💡 眼力<span class="hud-val combo" id="dt-clues">${clueBonuses} 次</span></div>
          <div class="hud-item">🏆 積分<span class="hud-val" id="dt-score">${score}</span></div>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${(idx / deck.length) * 100}%"></div></div>

        <div id="dt-feedback"></div>

        <div class="detective-folder card-enter">
          <span class="folder-tab">🔍 ${c.tag}</span>
          <h3 class="case-title">${c.title}</h3>
          <div class="case-story">${c.story}</div>

          <div class="clue-prompt-bar" id="dt-clue-prompt">
            🔎 點點看下方藏著「條款紅旗」的證據卡，解鎖公式再賺 <strong>+30 眼力分</strong>！
          </div>

          <div class="case-timeline" id="dt-timeline">
            ${c.timeline.map((n, ti) => `
              <button type="button" class="tl-node tl-node-btn" data-tidx="${ti}">
                <small>${n.label}</small>
                <strong>${n.val}</strong>
              </button>
            `).join('')}
          </div>

          <div id="dt-clue-box" class="clue-formula-box hidden"></div>

          ${!isHard ? `
            <div class="elder-hint-wrap">
              <button type="button" id="btn-dt-hint" class="elder-hint-btn">💡 不會算？點我請小管家幫你算（不扣分）</button>
              <div id="dt-hint-box" class="elder-hint-box hidden">🎪 小管家白話提示：${hintText}</div>
            </div>
          ` : ''}

          <div class="case-question">❓ ${c.question}</div>
          <div class="calc-choices">
            ${opts.map((o, i) => `
              <button class="calc-btn" data-idx="${i}">
                <span class="calc-amount">${o.amount}</span>
                <span class="calc-reason">${isHard ? '點擊拍板判定此金額' : (clueUnlocked ? o.reason : '點擊選擇此理賠金額')}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;

      // One-tap Elder Helper Button (also reveals friendly reasons on easy mode!)
      stage.querySelector('#btn-dt-hint')?.addEventListener('click', (e) => {
        window.SOUND.click();
        document.getElementById('dt-hint-box')?.classList.remove('hidden');
        e.currentTarget.classList.add('hidden');
        stage.querySelectorAll('.calc-btn').forEach((b, i) => {
          const sub = b.querySelector('.calc-reason');
          if (sub) sub.textContent = opts[i].reason;
        });
      });

      // Interactive Evidence Hunting!
      stage.querySelectorAll('.tl-node-btn').forEach(nodeBtn => {
        nodeBtn.addEventListener('click', () => {
          if (locked || clueUnlocked) return;
          const ti = Number(nodeBtn.dataset.tidx);
          if (ti === c.clueIndex) {
            clueUnlocked = true;
            clueBonuses += 1;
            score += 30;
            window.SOUND.clueFound();
            nodeBtn.classList.add('clue-found');
            const badge = document.createElement('span');
            badge.className = 'clue-found-badge';
            badge.textContent = '⚡ 關鍵紅旗！';
            nodeBtn.appendChild(badge);

            const box = document.getElementById('dt-clue-box');
            if (box) {
              box.innerHTML = `<strong>🔍 找到關鍵證據！+30 偵探眼力分</strong><div>${c.clueHint}</div>`;
              box.classList.remove('hidden');
            }
            document.getElementById('dt-clue-prompt')?.classList.add('hidden');

            const clEl = document.getElementById('dt-clues');
            const scEl = document.getElementById('dt-score');
            if (clEl) clEl.textContent = `${clueBonuses} 次`;
            if (scEl) scEl.textContent = score;

            if (!isHard) {
              stage.querySelectorAll('.calc-btn').forEach((b, i) => {
                const sub = b.querySelector('.calc-reason');
                if (sub) sub.textContent = opts[i].reason;
              });
            }
          } else {
            window.SOUND.click();
            nodeBtn.classList.add('clue-miss');
            setTimeout(() => nodeBtn.classList.remove('clue-miss'), 420);
            const promptBar = document.getElementById('dt-clue-prompt');
            if (promptBar) {
              promptBar.innerHTML = '🧐 這項是背景資料，再點點看哪一張藏著「時間／原因／天數」紅旗！';
            }
          }
        });
      });

      // Answer Judgment
      stage.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          const chosen = opts[Number(btn.dataset.idx)];
          stage.querySelectorAll('.calc-btn').forEach((b, i) => {
            b.disabled = true;
            const sub = b.querySelector('.calc-reason');
            if (sub) sub.textContent = opts[i].reason;
            if (opts[i].ok) b.classList.add('correct');
            else if (b === btn) b.classList.add('wrong');
          });
          stage.querySelector(`.tl-node-btn[data-tidx="${c.clueIndex}"]`)?.classList.add('clue-found');

          window.ISLAND_3D && window.ISLAND_3D.pulseBooth && window.ISLAND_3D.pulseBooth('game3', chosen.ok);

          const fb = document.getElementById('dt-feedback');
          if (chosen.ok) {
            solved += 1;
            combo += 1;
            const pts = isHard ? 200 : 160;
            score += pts;
            window.SOUND.correct(combo);
            window.SOUND.playReaction(true, combo);
            fb.innerHTML = `
              <div class="feedback-box ok" style="margin-bottom:12px;margin-top:0;">
                <strong>🎯 完美破案！+${pts} 分</strong>
                <div>${c.explain}</div>
                <span class="feedback-taigi">🗣️ ${c.taigi}</span>
              </div>
            `;
          } else {
            combo = 0;
            window.SOUND.wrong();
            window.SOUND.playReaction(false, 0);
            missedTips.push(`${c.title}：${c.explain}`);
            fb.innerHTML = `
              <div class="feedback-box ng" style="margin-bottom:12px;margin-top:0;">
                <strong>🧩 差一點就破案！真相解析：</strong>
                <div>${c.explain}</div>
              </div>
            `;
          }

          const svEl = document.getElementById('dt-solved');
          const scEl = document.getElementById('dt-score');
          if (svEl) svEl.textContent = `${solved} 件`;
          if (scEl) scEl.textContent = score;

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
      const stars = acc >= 75 ? 3 : acc >= 50 ? 2 : acc >= 25 ? 1 : 0;
      onFinish({
        stars,
        score,
        stats: [
          { label: '成功破案', val: `${solved}/${deck.length}` },
          { label: '找線索眼力', val: `${clueBonuses} 次` },
          { label: '總分', val: score }
        ],
        quote: stars === 3 ? '名偵探互助南！不論題目怎麼換數字，理賠條款全都被你一眼看穿！' : '下次不確定怎麼算，直接點「💡 請小管家幫你算」就輕鬆破案喔！',
        tips: missedTips.length ? missedTips.slice(0, 3) : ['LP 削減、LS 退股水位、等待期與骨折比例全部滿分通關！']
      });
    }

    render();
  }

  return { mount, cleanup: () => {} };
})();
