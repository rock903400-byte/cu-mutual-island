/* ==========================================================================
   攤位 4：互助人生 85 歲衝刺（手機特大字版＋底部永遠釘選轉輪／下一步大鈕）
   ========================================================================== */
window.GAME_LIFE85 = (function () {
  function mount(stage, { diff, setBottomBar, scrollTop, onFinish }) {
    const isHard = diff === 'hard';
    const stages = window.GAME_CONTENT.lifeStages;

    let step = 0;
    let familyWealth = 30000;
    let lsStock = 0;
    let lsBenefit = 0;
    let shieldedCount = 0;
    let selectedIds = new Set();
    let stageResolved = false;
    let lastEventHit = false;
    let lastChosenNames = [];
    const takeaways = [];

    function getBudget(st) {
      return isHard ? Math.round(st.budget * 0.85) : st.budget;
    }

    function spentInStage(st) {
      let total = 0;
      st.actions.forEach(a => { if (selectedIds.has(a.id)) total += a.cost; });
      return total;
    }

    function render(resetScroll = false) {
      const st = stages[step];
      const budget = getBudget(st);
      const spent = spentInStage(st);
      const remain = budget - spent;
      if (resetScroll && scrollTop) scrollTop();

      stage.innerHTML = `
        <div class="life-timeline-bar">
          ${stages.map((s, i) => `
            <div class="life-step-dot ${i < step ? 'done' : i === step ? 'active' : ''}">
              <div>${s.icon}</div>
              <div>${s.ageLabel}</div>
            </div>
          `).join('')}
        </div>

        <div class="life-dashboard">
          <div class="life-stat-card"><small>🏡 家庭守護資產</small><strong style="color:#156046;">$${familyWealth.toLocaleString()}</strong></div>
          <div class="life-stat-card"><small>🛡️ 風險接住</small><strong style="color:#AD3024;">${shieldedCount}/${stages.length}</strong></div>
          <div class="life-stat-card"><small>💰 股金結餘</small><strong>$${lsStock.toLocaleString()}</strong></div>
          <div class="life-stat-card"><small>✨ LS 加值額</small><strong style="color:#A86804;">$${lsBenefit.toLocaleString()}</strong></div>
        </div>

        <div class="life-stage-box">
          <div class="life-stage-head">
            <div class="life-age-circle">${st.ageLabel}</div>
            <div>
              <h3 style="font-size:1.12rem;">${st.icon} ${st.stageTitle}</h3>
              <p style="margin:4px 0 0;color:#43342B;font-size:0.96rem;">${st.story}</p>
            </div>
          </div>

          ${!stageResolved ? `
            <div class="life-budget-bar">
              <span>💳 預算 $${budget.toLocaleString()}</span>
              <span style="color:${remain < 0 ? '#AD3024' : '#156046'}">剩餘 $${remain.toLocaleString()}</span>
            </div>

            <div class="life-actions-grid">
              ${st.actions.map(a => {
                const isSel = selectedIds.has(a.id);
                return `
                  <button class="life-card-opt ${isSel ? 'selected' : ''}" data-aid="${a.id}">
                    <span class="cost-tag">${a.cost === 0 ? '免費／退股' : `$${a.cost.toLocaleString()}`}</span>
                    <strong style="display:block;margin-bottom:4px;font-size:1rem;">${isSel ? '✅ ' : '⬜ '}${a.label}</strong>
                    <small style="color:#6C594D;font-weight:800;">🏷️ ${a.tag}</small>
                  </button>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="life-event-card">
              <div style="font-size:0.86rem;color:#6B4005;margin-bottom:6px;font-weight:800;">
                📌 本站選擇：${lastChosenNames.length ? lastChosenNames.join(' ＋ ') : '保留現金'}
              </div>
              <h4 style="margin:0 0 8px;font-size:1.1rem;color:#9A3B08;">${st.event.title}</h4>
              <p style="margin:0;font-weight:800;font-size:1rem;color:${lastEventHit ? '#11543C' : '#8A1C12'};">
                ${lastEventHit ? '🛡️ ' + st.event.hitText : '💥 ' + st.event.missText}
              </p>
            </div>
          `}
        </div>
      `;

      if (!stageResolved) {
        stage.querySelectorAll('.life-card-opt').forEach(btn => {
          btn.addEventListener('click', () => {
            const aid = btn.dataset.aid;
            const act = st.actions.find(x => x.id === aid);
            if (!act) return;
            window.SOUND.click();
            if (selectedIds.has(aid)) {
              selectedIds.delete(aid);
            } else {
              if (aid === 'hold_ls') selectedIds.delete('withdraw_ls');
              if (aid === 'withdraw_ls') selectedIds.delete('hold_ls');
              if (spentInStage(st) + act.cost > budget) {
                window.SOUND.wrong();
                window.APP.toast('💰 預算不夠囉！先取消別張再選這張～');
                return;
              }
              selectedIds.add(aid);
            }
            render(false);
          });
        });

        const bar = setBottomBar(`<button id="btn-spin-life" class="btn-primary btn-full">🎲 確認配置・轉動命運輪盤！</button>`);
        bar?.querySelector('#btn-spin-life')?.addEventListener('click', () => resolveStage(st));
      } else {
        const nextLabel = step === stages.length - 1 ? '🎂 抵達 85 歲！查看人生總結 🏆' : '前往下一個人生階段 →';
        const bar = setBottomBar(`<button id="btn-life-next" class="btn-accent btn-full">${nextLabel}</button>`);
        bar?.querySelector('#btn-life-next')?.addEventListener('click', () => {
          window.SOUND.click();
          step += 1;
          selectedIds = new Set();
          stageResolved = false;
          if (step >= stages.length) finish();
          else render(true);
        });
      }
    }

    function resolveStage(st) {
      stageResolved = true;
      window.SOUND.tick();
      const pickedPolicies = new Set();
      let spent = 0;
      lastChosenNames = [];

      st.actions.forEach(a => {
        if (!selectedIds.has(a.id)) return;
        spent += a.cost;
        lastChosenNames.push(a.label);
        if (a.policy) pickedPolicies.add(a.policy);
        if (a.lsAdd) {
          lsStock += a.lsAdd;
          lsBenefit += Math.round(a.lsAdd * (a.lsRate || 1));
        }
        if (a.lsWithdraw) {
          lsStock = Math.max(0, lsStock - a.lsWithdraw);
          lsBenefit = Math.max(0, lsBenefit - a.lsWithdraw);
        }
      });

      familyWealth += (getBudget(st) - spent);
      lastEventHit = pickedPolicies.has(st.event.needPolicy);

      if (lastEventHit) {
        shieldedCount += 1;
        familyWealth += st.event.shieldGain;
        window.SOUND.correct(shieldedCount);
        window.SOUND.playVoice('taigi_good');
      } else {
        familyWealth = Math.max(0, familyWealth - st.event.missLoss);
        window.SOUND.wrong();
        window.SOUND.playVoice('taigi_reject');
        takeaways.push(`${st.ageLabel}：${st.event.missText}`);
      }

      render(true);
    }

    function finish() {
      const totalValue = familyWealth + lsStock + lsBenefit;
      const score = Math.round(totalValue / 100) + shieldedCount * 120;
      const stars = shieldedCount >= 6 ? 3 : shieldedCount >= 4 ? 2 : shieldedCount >= 2 ? 1 : 0;
      onFinish({
        stars,
        score,
        stats: [
          { label: '風險接住', val: `${shieldedCount}/${stages.length}` },
          { label: 'LS 加值', val: `$${lsBenefit.toLocaleString()}` },
          { label: '人生總分', val: score }
        ],
        quote: stars === 3 ? '完美走完 0~85 歲互助人生！從兒童 E 計畫一路守護到松年意外！' : '趁年輕卡位 D 計畫與 60 歲前存股金、70 歲銜接計畫三與松年，下次一定滿星！',
        tips: takeaways.length ? takeaways.slice(0, 3) : ['你完美善用了 8 大互助基金的全生命週期，是全家最強靠山！']
      });
    }

    render(true);
  }

  return { mount, cleanup: () => {} };
})();
