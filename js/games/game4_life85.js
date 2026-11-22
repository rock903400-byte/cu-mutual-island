/* ==========================================================================
   攤位 4：互助人生 85 歲衝刺 (v15)
   - 🌱 輕鬆安心版：濃縮 5 大核心人生站＋簡明 2 格大字儀表板＋免費「💡 問小管家」配置建議
   - 🔥 幹部魔王版：完整 7 大人生站＋4 格財務儀表板＋嚴格 85% 預算＋跨齡鎖定資格考驗
   ========================================================================== */
window.GAME_LIFE85 = (function () {
  let spinRaf = null;

  function cleanup() {
    if (spinRaf) { cancelAnimationFrame(spinRaf); spinRaf = null; }
  }

  function buildWheelSvg(events, wheelId) {
    const segs = 6;
    const cx = 110, cy = 110, r = 100;
    const wedges = [];
    for (let i = 0; i < segs; i++) {
      const ev = events[i % events.length];
      const a0 = (i * 60 - 90) * Math.PI / 180;
      const a1 = ((i + 1) * 60 - 90) * Math.PI / 180;
      const x1 = cx + r * Math.cos(a0);
      const y1 = cy + r * Math.sin(a0);
      const x2 = cx + r * Math.cos(a1);
      const y2 = cy + r * Math.sin(a1);
      const midA = ((i + 0.5) * 60 - 90) * Math.PI / 180;
      const tx = cx + r * 0.64 * Math.cos(midA);
      const ty = cy + r * 0.64 * Math.sin(midA);
      const rotDeg = (i + 0.5) * 60;
      const col = i % 2 === 0 ? (ev.wedgeColor || '#DF5646') : (ev.wedgeColor || '#2C8C6D');
      const fill = (events.length === 2 && events[0].wedgeColor === events[1].wedgeColor && i % 2 === 1) ? '#2C8C6D' : col;
      wedges.push(`
        <path d="M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 0,1 ${x2.toFixed(1)},${y2.toFixed(1)} Z"
              fill="${fill}" stroke="#FFFDF8" stroke-width="3" />
        <text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" fill="#FFFFFF" font-size="10.2" font-weight="900"
              text-anchor="middle" dominant-baseline="middle"
              transform="rotate(${rotDeg}, ${tx.toFixed(1)}, ${ty.toFixed(1)})">${ev.wedgeLabel}</text>
      `);
    }
    return `
      <div class="wheel-stage">
        <div class="wheel-pointer">▼</div>
        <svg id="${wheelId}" class="destiny-wheel-svg" viewBox="0 0 220 220" width="210" height="210">
          ${wedges.join('')}
          <circle cx="${cx}" cy="${cy}" r="22" fill="#FFFDF8" stroke="#F2AD34" stroke-width="5"/>
          <text x="${cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="middle" font-size="16">🎡</text>
        </svg>
      </div>
    `;
  }

  function mount(stage, { diff, setBottomBar, scrollTop, onFinish }) {
    cleanup();
    const isHard = diff === 'hard';
    const allStages = window.GAME_CONTENT.lifeStages;
    // Easy mode picks 5 core milestone stations (1歲 → 24歲 → 38歲 → 63歲 → 72歲松年守護); Hard plays all 7!
    const stages = isHard ? allStages : [allStages[0], allStages[1], allStages[2], allStages[4], allStages[5]];

    let step = 0;
    let familyWealth = 30000;
    let lsStock100 = 0;
    let lsStockPost = 0;
    let lsBenefit = 0;
    let shieldedCount = 0;
    let withdrewTrap = false;
    const ownedFlags = new Set();
    let selectedIds = new Set();
    let stageResolved = false;
    let isSpinning = false;
    let lastEvent = null;
    let lastEventHit = false;
    let lastChosenNames = [];
    const takeaways = [];

    function getBudget(st) {
      return isHard ? Math.round(st.budget * 0.85) : st.budget;
    }

    function isActionLocked(act) {
      return Boolean(act.requireFlag && !ownedFlags.has(act.requireFlag));
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
      const totalStock = lsStock100 + lsStockPost;
      const hintText = !isHard ? window.GAME_CONTENT.getEasyHint('life', st) : '';
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
          <div class="life-stat-card"><small>🛡️ 風險接住</small><strong style="color:#AD3024;">${shieldedCount}/${stages.length}</strong></div>
          <div class="life-stat-card"><small>✨ LS 股金加值</small><strong style="color:#A86804;">$${lsBenefit.toLocaleString()}</strong></div>
          ${isHard ? `
            <div class="life-stat-card"><small>🏡 家庭守護資產</small><strong style="color:#156046;">$${familyWealth.toLocaleString()}</strong></div>
            <div class="life-stat-card"><small>💰 股金結餘</small><strong>$${totalStock.toLocaleString()}</strong></div>
          ` : ''}
        </div>

        <div class="life-stage-box card-enter">
          <div class="life-stage-head">
            <div class="life-age-circle">${st.ageLabel}</div>
            <div>
              <h3 style="font-size:1.1rem;">${st.icon} ${st.stageTitle}</h3>
              <p style="margin:4px 0 0;color:#43342B;font-size:0.94rem;">${st.story}</p>
            </div>
          </div>

          <div class="risk-radar-pill">📡 本站輪盤可能風險：<strong>${st.riskRadar}</strong></div>

          ${!stageResolved ? `
            <div id="life-wheel-host" class="${isSpinning ? '' : 'hidden'}">
              ${buildWheelSvg(st.events, 'life-wheel-svg')}
              <p id="life-wheel-status" style="text-align:center;font-weight:900;color:#AD3024;margin:6px 0 0;">🎡 命運輪盤高速轉動中…</p>
            </div>

            <div id="life-pick-area" class="${isSpinning ? 'hidden' : ''}">
              ${!isHard ? `
                <div class="elder-hint-wrap" style="margin-top:0;">
                  <button type="button" id="btn-life-hint" class="elder-hint-btn">💡 不確定怎麼勾？問小管家建議</button>
                  <div id="life-hint-box" class="elder-hint-box hidden">🎪 小管家建議：${hintText}</div>
                </div>
              ` : ''}

              <div class="life-budget-bar">
                <span>💳 本站預算 $${budget.toLocaleString()}</span>
                <span style="color:${remain < 0 ? '#AD3024' : '#156046'}">剩餘 $${remain.toLocaleString()}</span>
              </div>

              <div class="life-actions-grid">
                ${st.actions.map(a => {
                  const locked = isActionLocked(a);
                  const isSel = selectedIds.has(a.id);
                  return `
                    <button class="life-card-opt ${isSel ? 'selected' : ''} ${locked ? 'locked-opt' : ''}" data-aid="${a.id}" ${locked ? 'disabled' : ''}>
                      <span class="cost-tag">${locked ? '🔒 未解鎖' : a.cost === 0 ? '免費／退股' : `$${a.cost.toLocaleString()}`}</span>
                      <strong style="display:block;margin-bottom:4px;font-size:0.98rem;">${locked ? '🔒 ' : isSel ? '✅ ' : '⬜ '}${a.label}</strong>
                      <small style="color:${locked ? '#AD3024' : '#6C594D'};font-weight:800;">${locked ? a.lockMsg : `🏷️ ${a.tag}`}</small>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          ` : `
            <div class="life-event-card">
              <div style="font-size:0.84rem;color:#6B4005;margin-bottom:6px;font-weight:800;">
                📌 本站配置：${lastChosenNames.length ? lastChosenNames.join(' ＋ ') : '保留現金'}
              </div>
              <div class="life-delta-badge ${lastEventHit ? 'ok' : 'ng'}">
                ${lastEventHit ? `🛡️ 成功擋下！+$${lastEvent.shieldGain.toLocaleString()}` : `💥 保障缺口！-$${lastEvent.missLoss.toLocaleString()}`}
              </div>
              <h4 style="margin:6px 0 8px;font-size:1.08rem;color:#9A3B08;">${lastEvent.title}</h4>
              <p style="margin:0;font-weight:800;font-size:0.98rem;color:${lastEventHit ? '#11543C' : '#8A1C12'};">
                ${lastEventHit ? '🛡️ ' + lastEvent.hitText : '💥 ' + lastEvent.missText}
              </p>
            </div>
          `}
        </div>
      `;

      stage.querySelector('#btn-life-hint')?.addEventListener('click', (e) => {
        window.SOUND.click();
        document.getElementById('life-hint-box')?.classList.remove('hidden');
        e.currentTarget.classList.add('hidden');
      });

      if (!stageResolved && !isSpinning) {
        stage.querySelectorAll('.life-card-opt:not(:disabled)').forEach(btn => {
          btn.addEventListener('click', () => {
            const aid = btn.dataset.aid;
            const act = st.actions.find(x => x.id === aid);
            if (!act || isActionLocked(act)) return;
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

        const bar = setBottomBar(`<button id="btn-spin-life" class="btn-primary btn-full">🎡 確認配置・轉動命運輪盤！</button>`);
        bar?.querySelector('#btn-spin-life')?.addEventListener('click', () => startWheelSpin(st));
      } else if (isSpinning) {
        setBottomBar(`<button class="btn-secondary btn-full" disabled>🎡 命運輪盤轉動中…</button>`);
      } else {
        const nextLabel = step === stages.length - 1 ? '🎂 抵達圓滿終點！查看人生總結 🏆' : '前往下一個人生階段 →';
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

    function startWheelSpin(st) {
      if (isSpinning) return;
      isSpinning = true;

      const evIdx = Math.floor(Math.random() * st.events.length);
      const targetEv = st.events[evIdx];

      render(true);
      window.SOUND.playVoice('taigi_spin');

      const svg = document.getElementById('life-wheel-svg');
      const wedgeChoices = evIdx === 0 ? [0, 2, 4] : [1, 3, 5];
      const targetWedge = wedgeChoices[Math.floor(Math.random() * wedgeChoices.length)];
      const wedgeCenter = (targetWedge + 0.5) * 60;
      const jitter = (Math.random() - 0.5) * 28;
      const totalDeg = 360 * 4 + (360 - wedgeCenter) + jitter;

      const duration = 1800;
      const startTime = performance.now();
      let lastSeg = -1;

      function stepSpin(now) {
        const elapsed = now - startTime;
        const p = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const curDeg = totalDeg * eased;
        if (svg) svg.style.transform = `rotate(${curDeg}deg)`;

        const curSeg = Math.floor(curDeg / 60);
        if (curSeg !== lastSeg) {
          lastSeg = curSeg;
          window.SOUND.spinTick(0.85 + (1 - p) * 0.45);
        }

        if (p < 1) {
          spinRaf = requestAnimationFrame(stepSpin);
        } else {
          const status = document.getElementById('life-wheel-status');
          if (status) status.textContent = `🎯 命運停在：【${targetEv.wedgeLabel}】！`;
          setTimeout(() => resolveStage(st, targetEv), 450);
        }
      }
      spinRaf = requestAnimationFrame(stepSpin);
    }

    function resolveStage(st, ev) {
      isSpinning = false;
      stageResolved = true;
      lastEvent = ev;

      const pickedPolicies = new Set();
      let spent = 0;
      lastChosenNames = [];

      st.actions.forEach(a => {
        if (!selectedIds.has(a.id)) return;
        spent += a.cost;
        lastChosenNames.push(a.label);
        if (a.policy) pickedPolicies.add(a.policy);
        if (a.grants) ownedFlags.add(a.grants);
        if (a.lsAdd) {
          if ((a.lsRate || 1) >= 1) lsStock100 += a.lsAdd;
          else lsStockPost += a.lsAdd;
          lsBenefit += Math.round(a.lsAdd * (a.lsRate || 1));
        }
        if (a.lsWithdraw) {
          withdrewTrap = true;
          const drop = Math.min(lsStock100, a.lsWithdraw);
          lsStock100 = Math.max(0, lsStock100 - drop);
          lsBenefit = Math.max(0, lsBenefit - drop);
        }
      });

      familyWealth += (getBudget(st) - spent);
      lastEventHit = pickedPolicies.has(ev.needPolicy);

      window.ISLAND_3D && window.ISLAND_3D.pulseBooth && window.ISLAND_3D.pulseBooth('game4', lastEventHit);

      if (lastEventHit) {
        shieldedCount += 1;
        familyWealth += ev.shieldGain;
        window.SOUND.correct(shieldedCount);
        window.SOUND.playReaction(true, shieldedCount);
      } else {
        familyWealth = Math.max(0, familyWealth - ev.missLoss);
        window.SOUND.wrong();
        window.SOUND.playReaction(false, 0);
        takeaways.push(`${st.ageLabel}：${ev.missText}`);
      }

      render(true);
    }

    function finish() {
      cleanup();
      const totalStock = lsStock100 + lsStockPost;
      const totalValue = familyWealth + totalStock + lsBenefit;
      const score = Math.round(totalValue / 100) + shieldedCount * 140 + (withdrewTrap ? 0 : 120);
      const stars = isHard
        ? ((shieldedCount >= 6 || (shieldedCount >= 5 && !withdrewTrap && lsBenefit >= 10000)) ? 3 : shieldedCount >= 4 ? 2 : shieldedCount >= 2 ? 1 : 0)
        : (shieldedCount >= 4 ? 3 : shieldedCount >= 3 ? 2 : shieldedCount >= 1 ? 1 : 0);

      onFinish({
        stars,
        score,
        stats: [
          { label: '風險接住', val: `${shieldedCount}/${stages.length}` },
          { label: 'LS 加值', val: `$${lsBenefit.toLocaleString()}` },
          { label: '人生總分', val: score }
        ],
        quote: stars === 3
          ? '完美走完互助人生！從兒童 E 計畫、63 歲不退股續防癌到高齡松年意外全都顧好顧滿！'
          : '記得看「風險雷達」把兩種保障優先勾起來、63 歲不亂退股，下次一定滿星喔！',
        tips: takeaways.length ? takeaways.slice(0, 3) : ['你完美善用了 8 大互助基金的全生命週期銜接，是全家最強靠山！']
      });
    }

    render(true);
  }

  return { mount, cleanup };
})();
