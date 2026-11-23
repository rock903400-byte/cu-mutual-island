/* ==========================================================================
   一鍵產生「儲互社互助島」高畫質戰績卡 PNG (Canvas 900x1200)
   - 正名「🏝️ 儲互社互助島」
   - 支援雙軌顯示（15 金星 ＋ 5 枚🔥魔王赤紅徽章）
   - 內建真實可掃描 QR Code (https://cu-mutual-island.rock903400.workers.dev)
   - 支援手機 Web Share API 一鍵原生分享到 LINE，桌機自動降級下載 PNG
   ========================================================================== */
window.SHARE_CARD = (function () {
  const GAME_URL = 'https://cu-mutual-island.rock903400.workers.dev';
  const SHORT_URL = 'cu-mutual-island.rock903400.workers.dev';

  // Verified ISO/IEC 18004 QR Code (33x33, EC Level M) for GAME_URL
  const QR_MATRIX = [
    '111111101111110100100011001111111',
    '100000100110111010111010001000001',
    '101110100001001011101111101011101',
    '101110101111100011010001001011101',
    '101110101110100010010001001011101',
    '100000101101111100101010101000001',
    '111111101010101010101010101111111',
    '000000001011101001111110100000000',
    '100010111000001101001111011111001',
    '011111011111000111100011010001100',
    '111111100111111100101101100001000',
    '001000000101010010010101101000000',
    '000011101100010010010111101111001',
    '010011011001011001111011110100100',
    '001101100110010100101101111001010',
    '011001001011111111000100011001000',
    '011010111100010001010110101011010',
    '011111001100000110100001010001100',
    '110111110001100101001001101101000',
    '101010000001010001100111111100011',
    '101011111100010100101001001011011',
    '101101001110110010010001010100110',
    '001011110100110011110111000001010',
    '000111011010011001011100011011011',
    '110101101000111101101110111110000',
    '000000001011001111100100100010100',
    '111111101001100110101000101011000',
    '100000100100100010001011100010000',
    '101110101111111010000010111111011',
    '101110100001100001111101101111010',
    '101110100010011100101100011111100',
    '100000100111101111000110110000000',
    '111111101101111011011101101001001'
  ];

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

  function drawQrCode(ctx, x, y, size) {
    const n = QR_MATRIX.length;
    const quiet = 12;
    ctx.fillStyle = '#FFFFFF';
    drawRoundRect(ctx, x, y, size, size, 16);
    ctx.fill();
    ctx.strokeStyle = '#E2CDAF';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const inner = size - quiet * 2;
    const cell = inner / n;
    ctx.fillStyle = '#1E1510';
    for (let r = 0; r < n; r++) {
      const row = QR_MATRIX[r];
      for (let c = 0; c < n; c++) {
        if (row[c] === '1') {
          ctx.fillRect(
            x + quiet + c * cell,
            y + quiet + r * cell,
            Math.ceil(cell),
            Math.ceil(cell)
          );
        }
      }
    }
  }

  function render() {
    const canvas = document.getElementById('share-card-canvas');
    if (!canvas) return;
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const state = window.STORAGE.load();
    const totalStars = window.STORAGE.getTotalStars(state);
    const hardBadges = window.STORAGE.getHardBadgeCount(state);
    const totalScore = window.STORAGE.getTotalScore(state);
    const rank = window.STORAGE.getRank(state);

    // 1. Warm paper background
    ctx.fillStyle = '#FDF7EC';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(223,86,70,0.055)';
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

    // 2. Top bunting flags
    const flagColors = ['#DF5646', '#F2AD34', '#2C8C6D', '#3969A2', '#DD7540'];
    for (let i = 0; i < 12; i++) {
      const fx = 62 + i * 65;
      ctx.fillStyle = flagColors[i % flagColors.length];
      ctx.beginPath();
      ctx.moveTo(fx, 44);
      ctx.lineTo(fx + 56, 44);
      ctx.lineTo(fx + 28, 98);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Header title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#B73D30';
    ctx.font = '900 46px "Zen Maru Gothic", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText('🏝️ 儲互社互助島', W / 2, 166);

    ctx.fillStyle = '#5C4B42';
    ctx.font = '700 23px "Noto Sans TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText('8 大互助基金 3D 微縮世界 ‧ 登島集章戰績卡', W / 2, 204);

    // 4. Player & Rank Hero Card
    ctx.fillStyle = '#FFFDF8';
    drawRoundRect(ctx, 74, 228, W - 148, 186, 26);
    ctx.fill();
    ctx.strokeStyle = '#EBC074';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#8B5305';
    ctx.font = '700 21px "Noto Sans TC", sans-serif';
    ctx.fillText('登島玩家／儲互社名', W / 2, 266);

    ctx.fillStyle = '#2C221E';
    ctx.font = '900 42px "Zen Maru Gothic", "Microsoft JhengHei", sans-serif';
    ctx.fillText(state.nickname, W / 2, 320);

    // Rank Ribbon
    ctx.fillStyle = hardBadges >= 5 ? '#AD3024' : '#DF5646';
    drawRoundRect(ctx, 195, 342, W - 390, 50, 25);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 26px "Zen Maru Gothic", "Microsoft JhengHei", sans-serif';
    ctx.fillText(`${rank.icon} ${rank.title}`, W / 2, 376);

    // 5. Big Stats Row (Gold Stars + Hard Red Badges + Total Score)
    const stats = [
      { label: '島嶼金星集章', val: `${totalStars} / 15 ★`, color: '#C88312' },
      { label: '幹部魔王赤章', val: `${hardBadges} / 5 🔥`, color: '#C43427' },
      { label: '累計最高總分', val: `${totalScore.toLocaleString()} 分`, color: '#21805F' }
    ];
    stats.forEach((st, idx) => {
      const bx = 74 + idx * 256;
      ctx.fillStyle = '#FFF7E8';
      drawRoundRect(ctx, bx, 434, 238, 102, 20);
      ctx.fill();
      ctx.strokeStyle = '#E7D6BE';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#8B766A';
      ctx.font = '700 19px "Noto Sans TC", sans-serif';
      ctx.fillText(st.label, bx + 119, 468);
      ctx.fillStyle = st.color;
      ctx.font = '900 31px "Zen Maru Gothic", "Microsoft JhengHei", sans-serif';
      ctx.fillText(st.val, bx + 119, 513);
    });

    // 6. Five Booth Rubber Stamps
    ctx.fillStyle = '#2C221E';
    ctx.font = '900 25px "Zen Maru Gothic", sans-serif';
    ctx.fillText('— 五大主題攤位集章紀錄 —', W / 2, 582);

    window.BOOTHS_META.forEach((b, idx) => {
      const rec = state.booths[b.id] || { stars: 0, bestScore: 0, hardStars: 0 };
      const col = idx < 3 ? idx : idx - 3;
      const row = idx < 3 ? 0 : 1;
      const cardW = 236;
      const cardH = 160;
      const startX = row === 0 ? 74 : 202;
      const x = startX + col * 258;
      const y = 604 + row * 176;

      ctx.fillStyle = rec.stars > 0 ? '#FFFFFF' : '#F4EEE2';
      drawRoundRect(ctx, x, y, cardW, cardH, 20);
      ctx.fill();
      ctx.strokeStyle = rec.stars > 0 ? b.color : '#D8C8B0';
      ctx.lineWidth = rec.stars > 0 ? 4 : 2;
      ctx.stroke();

      // Hard Mode Conquered Flame Ribbon
      if ((rec.hardStars || 0) >= 2) {
        ctx.fillStyle = '#C43427';
        drawRoundRect(ctx, x + cardW - 76, y + 10, 66, 26, 13);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 15px "Noto Sans TC", sans-serif';
        ctx.fillText('🔥魔王', x + cardW - 43, y + 28);
      }

      // Stamp circle
      ctx.save();
      ctx.translate(x + cardW / 2, y + 54);
      if (rec.stars > 0) ctx.rotate(-0.12);
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.fillStyle = rec.stars > 0 ? b.soft : '#EAE2D5';
      ctx.fill();
      ctx.strokeStyle = rec.stars > 0 ? b.color : '#B8A894';
      ctx.lineWidth = 3.5;
      if (rec.stars === 0) ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '32px sans-serif';
      ctx.fillText(b.icon, 0, 11);
      ctx.restore();

      ctx.fillStyle = '#2C221E';
      ctx.font = '900 20px "Zen Maru Gothic", "Microsoft JhengHei", sans-serif';
      ctx.fillText(b.shortTitle, x + cardW / 2, y + 116);

      const starStr = '★'.repeat(rec.stars) + '☆'.repeat(3 - rec.stars);
      ctx.fillStyle = rec.stars > 0 ? '#E09612' : '#B8A894';
      ctx.font = '900 24px sans-serif';
      ctx.fillText(starStr, x + cardW / 2, y + 146);
    });

    // 7. Viral LINE Invite Footer Card with REAL Scannable QR Code!
    const fy = 972;
    ctx.fillStyle = '#FFFDF8';
    drawRoundRect(ctx, 74, fy, W - 148, 162, 22);
    ctx.fill();
    ctx.strokeStyle = '#E2CDAF';
    ctx.lineWidth = 3;
    ctx.stroke();

    drawQrCode(ctx, 94, fy + 15, 132);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#AD3024';
    ctx.font = '900 28px "Zen Maru Gothic", "Microsoft JhengHei", sans-serif';
    ctx.fillText('📱 掃碼立刻登島，挑戰我的紀錄！', 248, fy + 52);

    ctx.fillStyle = '#2C221E';
    ctx.font = '700 20px "Noto Sans TC", sans-serif';
    ctx.fillText(`🌐 ${SHORT_URL}`, 248, fy + 88);

    const now = new Date();
    const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
    ctx.fillStyle = '#6C594D';
    ctx.font = '700 18px "Noto Sans TC", sans-serif';
    ctx.fillText(`📅 簽發日期：${dateStr} ｜ 已解鎖 ${state.badges.length}/${window.STORAGE.ACHIEVEMENTS.length} 枚勳章`, 248, fy + 120);

    ctx.fillStyle = '#8B766A';
    ctx.font = '500 15px "Noto Sans TC", sans-serif';
    ctx.fillText('※ 內容依據中華民國儲蓄互助協會 8 大互助基金簡介製作', 248, fy + 146);

    // Mirror onto a real <img> so LINE in-app browser users can LONG-PRESS directly to save/forward!
    const previewImg = document.getElementById('share-card-img');
    if (previewImg) {
      try {
        previewImg.src = canvas.toDataURL('image/png');
      } catch {}
    }
  }

  function download() {
    render();
    const canvas = document.getElementById('share-card-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    const state = window.STORAGE.load();
    link.download = `儲互社互助島_戰績卡_${state.nickname}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    window.SOUND.fanfare();
  }

  async function shareToLine() {
    render();
    const canvas = document.getElementById('share-card-canvas');
    if (!canvas) return;
    const state = window.STORAGE.load();
    const stars = window.STORAGE.getTotalStars(state);
    const hardBadges = window.STORAGE.getHardBadgeCount(state);
    const rank = window.STORAGE.getRank(state);
    const shareText = `🏝️ 我在《儲互社互助島》拿到 ${stars}/15 ★${hardBadges > 0 ? `（🔥魔王章 ${hardBadges}/5）` : ''}，稱號「${rank.icon}${rank.title}」！快來跟我一起玩：${GAME_URL}`;

    try {
      if (navigator.share) {
        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        if (blob) {
          const file = new File([blob], `儲互社互助島_戰績卡_${state.nickname}.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: '🏝️ 儲互社互助島戰績卡',
              text: shareText,
              files: [file]
            });
            window.SOUND.confetti();
            return 'shared';
          }
        }
        await navigator.share({
          title: '🏝️ 儲互社互助島戰績卡',
          text: shareText,
          url: GAME_URL
        });
        window.SOUND.confetti();
        return 'shared_link';
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return 'cancelled';
    }
    // Desktop / unsupported browser fallback: copy text + download PNG
    try { await navigator.clipboard.writeText(shareText); } catch {}
    download();
    return 'downloaded';
  }

  /* ==========================================================================
     v16 我的互助島路線卡（導覽用，不計分）。護照戰績卡的 render() 維持原樣不動。
     ========================================================================== */
  const FONT_DISPLAY = '"Zen Maru Gothic", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
  const FONT_BODY = '"Noto Sans TC", "Microsoft JhengHei", sans-serif';

  function paintFrame(ctx, W, H, title, subtitle) {
    ctx.fillStyle = '#FDF7EC';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(33,128,95,0.055)';
    for (let y = 40; y < H; y += 44) {
      for (let x = 40; x < W; x += 44) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.strokeStyle = '#21805F';
    ctx.lineWidth = 10;
    drawRoundRect(ctx, 24, 24, W - 48, H - 48, 36);
    ctx.stroke();
    ctx.strokeStyle = '#F2AD34';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    drawRoundRect(ctx, 42, 42, W - 84, H - 84, 28);
    ctx.stroke();
    ctx.setLineDash([]);

    const flagColors = ['#21805F', '#F2AD34', '#3969A2', '#DF5646', '#6C8B3E'];
    for (let i = 0; i < 12; i++) {
      const fx = 62 + i * 65;
      ctx.fillStyle = flagColors[i % flagColors.length];
      ctx.beginPath();
      ctx.moveTo(fx, 44);
      ctx.lineTo(fx + 56, 44);
      ctx.lineTo(fx + 28, 98);
      ctx.closePath();
      ctx.fill();
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#156046';
    ctx.font = `900 46px ${FONT_DISPLAY}`;
    ctx.fillText(title, W / 2, 166);
    ctx.fillStyle = '#5C4B42';
    ctx.font = `700 23px ${FONT_BODY}`;
    ctx.fillText(subtitle, W / 2, 204);
  }

  function fitText(ctx, text, maxWidth) {
    const str = String(text || '');
    if (ctx.measureText(str).width <= maxWidth) return str;
    let lo = 0;
    let hi = str.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (ctx.measureText(str.slice(0, mid) + '…').width <= maxWidth) lo = mid;
      else hi = mid - 1;
    }
    return str.slice(0, lo) + '…';
  }

  function paintRouteCard(canvas, data) {
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const state = window.STORAGE.load();
    const route = data.route || [];
    const visited = data.visited || [];
    const doneInRoute = route.filter(id => visited.includes(id)).length;

    paintFrame(ctx, W, H, '🏝️ 儲互社互助島', '8 大互助基金白話導覽 ‧ 我的路線卡');

    // 逛島的人＋身分路線
    ctx.fillStyle = '#FFFDF8';
    drawRoundRect(ctx, 74, 228, W - 148, 160, 26);
    ctx.fill();
    ctx.strokeStyle = '#B8DCC9';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#156046';
    ctx.font = `700 21px ${FONT_BODY}`;
    ctx.fillText('逛島的人／儲互社名', W / 2, 264);
    ctx.fillStyle = '#2C221E';
    ctx.font = `900 40px ${FONT_DISPLAY}`;
    ctx.fillText(fitText(ctx, state.nickname, W - 220), W / 2, 314);
    ctx.fillStyle = '#21805F';
    drawRoundRect(ctx, 195, 334, W - 390, 44, 22);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `900 24px ${FONT_DISPLAY}`;
    ctx.fillText(`${data.persona.icon} ${data.persona.label}路線`, W / 2, 365);

    // 路線上的每一站
    ctx.fillStyle = '#2C221E';
    ctx.font = `900 25px ${FONT_DISPLAY}`;
    ctx.fillText(`— 我的路線：已逛 ${doneInRoute}／${route.length} 站 —`, W / 2, 430);

    route.slice(0, 8).forEach((id, i) => {
      const f = (data.funds || []).find(x => x.id === id);
      if (!f) return;
      const stop = data.stops ? data.stops[id] : null;
      const isDone = visited.includes(id);
      const y = 452 + i * 62;
      ctx.fillStyle = isDone ? '#FFFFFF' : '#F4EEE2';
      drawRoundRect(ctx, 74, y, W - 148, 54, 14);
      ctx.fill();
      ctx.strokeStyle = isDone ? f.color : '#D8C8B0';
      ctx.lineWidth = isDone ? 3 : 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(106, y + 27, 19, 0, Math.PI * 2);
      ctx.fillStyle = f.color;
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 21px ${FONT_DISPLAY}`;
      ctx.fillText(String(data.stopNo ? data.stopNo(id) : i + 1), 106, y + 34);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#1E1510';
      ctx.font = `900 21px ${FONT_BODY}`;
      ctx.fillText(`${f.icon} ${f.shortName}`, 138, y + 23);
      ctx.fillStyle = '#5C4B42';
      ctx.font = `500 16px ${FONT_BODY}`;
      // 導覽的一句話可能用 \n 拆成幾行（長輩友善），路線卡只有一行：接回一句再截斷
      ctx.fillText(fitText(ctx, stop ? stop.oneLiner.replace(/\n/g, '') : f.summary, 560), 138, y + 45);

      ctx.textAlign = 'right';
      ctx.fillStyle = isDone ? '#21805F' : '#9C8A7C';
      ctx.font = `900 19px ${FONT_BODY}`;
      ctx.fillText(isDone ? '✅ 已逛' : '○ 還沒逛', W - 92, y + 34);
    });

    // QR code 與網址（同戰績卡）
    const fy = 972;
    ctx.fillStyle = '#FFFDF8';
    drawRoundRect(ctx, 74, fy, W - 148, 162, 22);
    ctx.fill();
    ctx.strokeStyle = '#E2CDAF';
    ctx.lineWidth = 3;
    ctx.stroke();
    drawQrCode(ctx, 94, fy + 15, 132);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#156046';
    ctx.font = `900 28px ${FONT_DISPLAY}`;
    ctx.fillText('📱 掃碼一起逛互助島！', 248, fy + 52);
    ctx.fillStyle = '#2C221E';
    ctx.font = `700 20px ${FONT_BODY}`;
    ctx.fillText(`🌐 ${SHORT_URL}`, 248, fy + 88);
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
    ctx.fillStyle = '#6C594D';
    ctx.font = `700 18px ${FONT_BODY}`;
    ctx.fillText(`📅 ${dateStr} ｜ 全島 8 站已逛 ${visited.length}／${data.total || 8} 站`, 248, fy + 120);
    ctx.fillStyle = '#8B766A';
    ctx.font = `500 15px ${FONT_BODY}`;
    ctx.fillText('※ 依中華民國儲蓄互助協會各項互助基金簡介整理，以協會公告與條款為準', 248, fy + 146);
  }

  function renderRoute(data) {
    const canvas = document.getElementById('route-card-canvas');
    if (!canvas || !data) return null;
    paintRouteCard(canvas, data);
    const img = document.getElementById('route-card-img');
    if (img) {
      try { img.src = canvas.toDataURL('image/png'); } catch {}
    }
    return canvas;
  }

  function routeFileName() {
    return `儲互社互助島_路線卡_${window.STORAGE.load().nickname}.png`;
  }

  function downloadRoute(data) {
    const canvas = renderRoute(data);
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = routeFileName();
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  async function shareRoute(data) {
    const canvas = renderRoute(data);
    if (!canvas) return null;
    const shareText = `🏝️ 我在《儲互社互助島》逛了「${data.persona.icon}${data.persona.label}」路線（全島 8 站已逛 ${(data.visited || []).length} 站），一起來看 8 大互助基金適合誰、要注意什麼：${GAME_URL}`;
    try {
      if (navigator.share) {
        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        if (blob) {
          const file = new File([blob], routeFileName(), { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ title: '🏝️ 我的互助島路線卡', text: shareText, files: [file] });
            return 'shared';
          }
        }
        await navigator.share({ title: '🏝️ 我的互助島路線卡', text: shareText, url: GAME_URL });
        return 'shared_link';
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return 'cancelled';
    }
    try { await navigator.clipboard.writeText(shareText); } catch {}
    downloadRoute(data);
    return 'downloaded';
  }

  return { GAME_URL, render, download, shareToLine, renderRoute, downloadRoute, shareRoute };
})();
