/* ==========================================================================
   一鍵產生「園遊會集章戰績卡」高畫質 PNG (Canvas 900x1140)
   ========================================================================== */
window.SHARE_CARD = (function () {
  function drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function render() {
    const canvas = document.getElementById('share-card-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const state = window.STORAGE.load();
    const totalStars = window.STORAGE.getTotalStars(state);
    const totalScore = window.STORAGE.getTotalScore(state);
    const rank = window.STORAGE.getRank(state);

    // 1. Warm paper background
    ctx.fillStyle = '#FDF7EC';
    ctx.fillRect(0, 0, W, H);

    // Subtle polka dots
    ctx.fillStyle = 'rgba(223,86,70,0.06)';
    for (let y = 40; y < H; y += 44) {
      for (let x = 40; x < W; x += 44) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Outer double border
    ctx.strokeStyle = '#DF5646';
    ctx.lineWidth = 10;
    drawRoundRect(ctx, 24, 24, W - 48, H - 48, 36);
    ctx.stroke();

    ctx.strokeStyle = '#F2AD34';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    drawRoundRect(ctx, 42, 42, W - 84, H - 84, 28);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Top carnival bunting flags
    const flagColors = ['#DF5646', '#F2AD34', '#2C8C6D', '#3969A2', '#DD7540'];
    for (let i = 0; i < 12; i++) {
      const fx = 62 + i * 65;
      ctx.fillStyle = flagColors[i % flagColors.length];
      ctx.beginPath();
      ctx.moveTo(fx, 44);
      ctx.lineTo(fx + 56, 44);
      ctx.lineTo(fx + 28, 102);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Header title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#B73D30';
    ctx.font = '900 46px "Zen Maru Gothic", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText('🎡 儲互社互助遊樂場', W / 2, 174);

    ctx.fillStyle = '#5C4B42';
    ctx.font = '700 24px "Noto Sans TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText('8 大互助基金 ‧ 園遊會集章護照戰績卡', W / 2, 214);

    // 4. Player & Rank Hero Card
    ctx.fillStyle = '#FFFDF8';
    drawRoundRect(ctx, 74, 244, W - 148, 198, 26);
    ctx.fill();
    ctx.strokeStyle = '#EBC074';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#8B5305';
    ctx.font = '700 22px "Noto Sans TC", sans-serif';
    ctx.fillText('玩家姓名／儲互社', W / 2, 286);

    ctx.fillStyle = '#2C221E';
    ctx.font = '900 44px "Zen Maru Gothic", "Microsoft JhengHei", sans-serif';
    ctx.fillText(state.nickname, W / 2, 342);

    // Rank Ribbon
    ctx.fillStyle = '#DF5646';
    drawRoundRect(ctx, 210, 366, W - 420, 52, 26);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 26px "Zen Maru Gothic", "Microsoft JhengHei", sans-serif';
    ctx.fillText(`${rank.icon} ${rank.title}`, W / 2, 401);

    // 5. Big Stats Row
    const stats = [
      { label: '總收集星星', val: `${totalStars} / 15 ★`, color: '#C88312' },
      { label: '最高累計總分', val: `${totalScore.toLocaleString()} 分`, color: '#2C8C6D' },
      { label: '解鎖成就勳章', val: `${state.badges.length} / ${window.STORAGE.ACHIEVEMENTS.length} 枚`, color: '#3969A2' }
    ];
    stats.forEach((st, idx) => {
      const bx = 74 + idx * 256;
      ctx.fillStyle = '#FFF7E8';
      drawRoundRect(ctx, bx, 466, 238, 108, 20);
      ctx.fill();
      ctx.strokeStyle = '#E7D6BE';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#8B766A';
      ctx.font = '700 20px "Noto Sans TC", sans-serif';
      ctx.fillText(st.label, bx + 119, 502);
      ctx.fillStyle = st.color;
      ctx.font = '900 32px "Zen Maru Gothic", "Microsoft JhengHei", sans-serif';
      ctx.fillText(st.val, bx + 119, 548);
    });

    // 6. Five Booth Rubber Stamps
    ctx.fillStyle = '#2C221E';
    ctx.font = '900 26px "Zen Maru Gothic", sans-serif';
    ctx.fillText('— 五大主題攤位集章紀錄 —', W / 2, 626);

    window.BOOTHS_META.forEach((b, idx) => {
      const rec = state.booths[b.id] || { stars: 0, bestScore: 0 };
      const col = idx < 3 ? idx : idx - 3;
      const row = idx < 3 ? 0 : 1;
      const cardW = 236;
      const cardH = 166;
      const startX = row === 0 ? 74 : 202;
      const x = startX + col * 258;
      const y = 650 + row * 184;

      ctx.fillStyle = rec.stars > 0 ? '#FFFFFF' : '#F4EEE2';
      drawRoundRect(ctx, x, y, cardW, cardH, 20);
      ctx.fill();
      ctx.strokeStyle = rec.stars > 0 ? b.color : '#D8C8B0';
      ctx.lineWidth = rec.stars > 0 ? 4 : 2;
      ctx.stroke();

      // Stamp circle
      ctx.save();
      ctx.translate(x + cardW / 2, y + 58);
      if (rec.stars > 0) ctx.rotate(-0.12);
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fillStyle = rec.stars > 0 ? b.soft : '#EAE2D5';
      ctx.fill();
      ctx.strokeStyle = rec.stars > 0 ? b.color : '#B8A894';
      ctx.lineWidth = 3.5;
      if (rec.stars === 0) ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '34px sans-serif';
      ctx.fillText(b.icon, 0, 12);
      ctx.restore();

      ctx.fillStyle = '#2C221E';
      ctx.font = '900 20px "Zen Maru Gothic", "Microsoft JhengHei", sans-serif';
      ctx.fillText(b.shortTitle, x + cardW / 2, y + 122);

      const starStr = '★'.repeat(rec.stars) + '☆'.repeat(3 - rec.stars);
      ctx.fillStyle = rec.stars > 0 ? '#E09612' : '#B8A894';
      ctx.font = '900 24px sans-serif';
      ctx.fillText(starStr, x + cardW / 2, y + 152);
    });

    // 7. Footer stamp & date
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
    ctx.fillStyle = '#8B766A';
    ctx.font = '700 20px "Noto Sans TC", sans-serif';
    ctx.fillText(`簽發日期：${dateStr} ‧ 快來儲互社互助遊樂場挑戰我的紀錄！`, W / 2, 1054);
    ctx.font = '500 16px "Noto Sans TC", sans-serif';
    ctx.fillText('※ 遊戲內容依據中華民國儲蓄互助協會各項互助基金簡介製作', W / 2, 1086);
  }

  function download() {
    render();
    const canvas = document.getElementById('share-card-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    const state = window.STORAGE.load();
    link.download = `儲互社互助遊樂場_戰績卡_${state.nickname}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    window.SOUND.fanfare();
  }

  return { render, download };
})();
