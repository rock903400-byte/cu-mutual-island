/* =========================================================
   進互助島之前確認是來福好友（2026-11-23 使用者決定：一打開網站就要先加來福好友，做法跟選罷法一樣）
   ・來福＝LINE 官方帳號 @721byaqh「儲蓄互助社｜生活圈」。用「儲互社」那組 LINE 登入頻道（已連來福帳號）
     底下的互助島專用入口（LIFF，權限只有 profile，登入時跳加好友畫面）問 LINE「是不是好友」；
     網站不存、不傳任何 LINE 個人資料（只看 getFriendship() 的 friendFlag）
   ・只在正式網址檢查；本機開檔、本機測試網站不檢查（測試用 window.__LAIFU_TEST = { liff: 假的 LINE }）
   ・手機 LINE 裡：自動確認（沒登入就請 LINE 登入，第一次會跳授權畫面）
     電腦：QR code 請他用手機 LINE 掃，另留「在這台電腦登入 LINE」；手機其他瀏覽器：「用 LINE 打開互助島」
   ・確定「不是好友」才擋；LINE 那邊出錯、查不了，就先讓他進去（免得所有人卡在門口）
   ・開場短片照播；短片關掉（或沒有短片）才擋。從 LINE 登入回來不再播短片
   ・換了 LIFF 入口，QR_ISLAND 要跟著重產（segno 產生、OpenCV 實掃確認，見 AGENTS.md）
========================================================= */
window.LAIFU_GATE = (() => {
  const CFG = {
    liffId: '2009715141-C0OePFPc',
    liffUrl: 'https://liff.line.me/2009715141-C0OePFPc',
    addUrl: 'https://line.me/R/ti/p/@721byaqh',
    host: 'cu-mutual-island.rock903400.workers.dev',
    sdk: 'https://static.line-scdn.net/liff/edge/2/sdk.js',
    intentKey: 'cu_island_laifu_intent',
    triedKey: 'cu_island_laifu_login_tried'
  };
  const QR_ISLAND = "<svg viewBox=\"0 0 37 37\" class=\"laifu-qr\"><path fill=\"#fff\" d=\"M0 0h37v37h-37z\"/><path class=\"qrline\" stroke=\"#000\" d=\"M2 2.5h7m1 0h7m2 0h1m2 0h3m3 0h7m-33 1h1m5 0h1m1 0h2m1 0h1m1 0h2m1 0h1m1 0h1m1 0h1m3 0h1m1 0h1m5 0h1m-33 1h1m1 0h3m1 0h1m2 0h1m1 0h4m1 0h1m2 0h3m1 0h1m2 0h1m1 0h3m1 0h1m-33 1h1m1 0h3m1 0h1m4 0h4m1 0h1m1 0h3m2 0h1m2 0h1m1 0h3m1 0h1m-33 1h1m1 0h3m1 0h1m2 0h1m1 0h1m1 0h1m6 0h1m5 0h1m1 0h3m1 0h1m-33 1h1m5 0h1m2 0h2m5 0h4m2 0h1m3 0h1m5 0h1m-33 1h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7m-24 1h4m1 0h1m3 0h3m-20 1h1m4 0h3m1 0h2m1 0h7m2 0h1m1 0h2m5 0h2m-29 1h2m2 0h1m2 0h1m1 0h1m1 0h3m1 0h2m1 0h3m3 0h4m-28 1h3m1 0h2m1 0h1m1 0h1m1 0h3m2 0h1m1 0h1m1 0h1m3 0h1m1 0h1m-31 1h3m4 0h5m1 0h1m2 0h3m1 0h1m2 0h1m1 0h1m1 0h5m-30 1h5m2 0h1m2 0h6m1 0h1m1 0h1m1 0h4m4 0h1m-31 1h1m1 0h1m3 0h3m1 0h1m3 0h1m1 0h2m2 0h3m2 0h1m2 0h4m-30 1h2m1 0h2m1 0h1m1 0h1m6 0h1m1 0h2m3 0h3m1 0h1m1 0h1m-32 1h4m1 0h1m4 0h1m1 0h1m1 0h2m1 0h1m2 0h1m2 0h1m1 0h1m1 0h2m1 0h1m1 0h1m-32 1h1m2 0h1m1 0h2m1 0h4m1 0h2m2 0h1m3 0h4m1 0h3m2 0h1m-33 1h1m1 0h1m1 0h1m2 0h3m2 0h1m2 0h1m1 0h1m1 0h2m2 0h1m2 0h1m2 0h4m-30 1h2m1 0h3m1 0h3m1 0h1m1 0h4m1 0h4m2 0h1m1 0h4m-33 1h1m2 0h1m4 0h1m2 0h2m4 0h2m1 0h1m2 0h1m1 0h1m2 0h3m-31 1h2m1 0h1m2 0h2m2 0h2m1 0h1m2 0h1m1 0h2m2 0h1m1 0h2m2 0h2m-30 1h6m2 0h1m3 0h2m1 0h2m4 0h2m3 0h1m1 0h1m1 0h1m-31 1h1m4 0h5m1 0h4m2 0h1m1 0h1m2 0h1m1 0h3m2 0h3m-32 1h1m3 0h1m3 0h1m1 0h1m3 0h1m1 0h1m1 0h3m3 0h1m5 0h1m-31 1h4m2 0h4m1 0h2m1 0h2m2 0h1m1 0h1m2 0h6m2 0h1m-24 1h1m2 0h2m3 0h1m1 0h3m3 0h1m3 0h1m1 0h3m-33 1h7m1 0h1m2 0h3m1 0h1m1 0h1m5 0h2m1 0h1m1 0h1m1 0h1m-31 1h1m5 0h1m3 0h2m1 0h4m1 0h2m3 0h2m3 0h3m1 0h1m-33 1h1m1 0h3m1 0h1m3 0h2m1 0h1m2 0h4m1 0h1m2 0h6m-30 1h1m1 0h3m1 0h1m2 0h2m1 0h1m2 0h2m6 0h3m1 0h4m1 0h1m-33 1h1m1 0h3m1 0h1m3 0h1m1 0h3m4 0h3m1 0h1m1 0h1m1 0h2m1 0h3m-33 1h1m5 0h1m1 0h3m1 0h7m3 0h2m3 0h2m1 0h1m-31 1h7m3 0h1m1 0h2m1 0h3m6 0h4m1 0h1m1 0h1\"/></svg>";   // 內容：CFG.liffUrl（segno error=Q，border=2）
  const QR_ADD = "<svg viewBox=\"0 0 33 33\" class=\"laifu-qr\"><path fill=\"#fff\" d=\"M0 0h33v33h-33z\"/><path class=\"qrline\" stroke=\"#000\" d=\"M2 2.5h7m1 0h2m2 0h2m1 0h5m2 0h7m-29 1h1m5 0h1m1 0h1m2 0h1m2 0h1m3 0h3m1 0h1m5 0h1m-29 1h1m1 0h3m1 0h1m1 0h3m2 0h2m3 0h1m1 0h1m1 0h1m1 0h3m1 0h1m-29 1h1m1 0h3m1 0h1m1 0h2m1 0h3m4 0h2m2 0h1m1 0h3m1 0h1m-29 1h1m1 0h3m1 0h1m1 0h2m4 0h1m3 0h2m2 0h1m1 0h3m1 0h1m-29 1h1m5 0h1m3 0h3m1 0h3m2 0h2m1 0h1m5 0h1m-29 1h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7m-21 1h1m2 0h3m1 0h1m1 0h1m1 0h1m-19 1h2m1 0h1m1 0h2m2 0h1m6 0h1m1 0h1m2 0h1m1 0h5m-26 1h1m1 0h1m1 0h2m4 0h2m2 0h2m2 0h3m2 0h1m1 0h1m-25 1h4m2 0h1m4 0h2m3 0h1m3 0h2m1 0h2m-29 1h1m1 0h1m1 0h1m3 0h1m1 0h1m6 0h2m2 0h3m3 0h1m-26 1h1m3 0h1m2 0h4m3 0h3m1 0h1m1 0h2m1 0h1m-26 1h1m1 0h1m1 0h1m4 0h3m2 0h1m5 0h4m3 0h2m-29 1h1m5 0h1m2 0h1m1 0h1m3 0h1m2 0h1m1 0h2m1 0h1m2 0h1m1 0h1m-28 1h1m5 0h3m3 0h1m1 0h1m1 0h4m1 0h2m3 0h2m-29 1h1m1 0h1m2 0h2m2 0h2m1 0h1m1 0h4m1 0h1m1 0h3m1 0h1m2 0h1m-26 1h3m7 0h1m1 0h1m5 0h1m5 0h2m-29 1h1m1 0h2m2 0h3m2 0h2m1 0h1m1 0h2m3 0h1m1 0h1m2 0h3m-28 1h1m2 0h1m3 0h1m1 0h1m2 0h1m1 0h1m1 0h1m2 0h1m1 0h1m1 0h1m2 0h1m-28 1h1m1 0h1m1 0h1m1 0h1m4 0h1m2 0h4m2 0h5m3 0h1m-21 1h1m2 0h1m2 0h1m2 0h1m1 0h2m3 0h1m-25 1h7m1 0h1m1 0h2m2 0h1m3 0h3m1 0h1m1 0h1m1 0h3m-29 1h1m5 0h1m2 0h1m2 0h7m1 0h1m3 0h1m3 0h1m-29 1h1m1 0h3m1 0h1m1 0h2m1 0h1m1 0h2m1 0h2m2 0h6m1 0h1m-28 1h1m1 0h3m1 0h1m7 0h1m1 0h1m1 0h1m1 0h2m2 0h5m-29 1h1m1 0h3m1 0h1m1 0h4m1 0h1m5 0h1m3 0h4m1 0h1m-29 1h1m5 0h1m1 0h1m2 0h1m3 0h1m1 0h2m1 0h2m1 0h1m1 0h1m1 0h1m-28 1h7m3 0h1m2 0h2m1 0h2m2 0h1m1 0h1m1 0h1m2 0h2\"/></svg>";   // 內容：CFG.addUrl（跟選罷法同一個）
  const gate = { on: false, state: 'off', liff: null, wanted: false, open: false, busy: false, note: '', back: false };
  // state：off 不檢查｜loading 確認中｜login 要先登入 LINE｜notFriend 還不是好友｜friend 是好友｜error 查不了（放行）

  function env() {
    const ua = navigator.userAgent || '';
    return {
      inLine: / Line\//i.test(ua),
      mobile: /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
    };
  }
  function allows() { return ['off', 'friend', 'error'].includes(gate.state); }
  function within(p, ms) {
    return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('等太久')), ms))]);
  }
  function loadSdk() {
    const t = window.__LAIFU_TEST;
    if (t && t.liff) return Promise.resolve(t.liff);
    if (window.liff && window.liff.init) return Promise.resolve(window.liff);
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = CFG.sdk;
      s.charset = 'utf-8';
      s.async = true;
      s.onload = () => (window.liff && window.liff.init) ? resolve(window.liff) : reject(new Error('LINE 程式沒載到'));
      s.onerror = () => reject(new Error('LINE 程式下載失敗'));
      document.head.appendChild(s);
    });
  }
  async function isFriend() {
    const r = await within(gate.liff.getFriendship(), 10000);
    return !!(r && r.friendFlag);
  }
  function sessionGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sessionSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function sessionDel(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  function triedLoginRecently() { return Date.now() - Number(sessionGet(CFG.triedKey) || 0) < 2 * 60 * 1000; }

  function init() {
    gate.on = !!(window.__LAIFU_TEST || (location.hostname === CFG.host && CFG.liffId));
    if (!gate.on) { gate.state = 'off'; return; }
    // 10 分鐘內按過「請 LINE 確認」又回來：不要再播一次開場短片
    gate.back = Date.now() - Number(sessionGet(CFG.intentKey) || 0) < 10 * 60 * 1000;
    sessionDel(CFG.intentKey);
    gate.state = 'loading';
    bindUi();
    prepare();
  }

  async function prepare() {
    let next = 'error';
    try {
      gate.liff = await within(loadSdk(), 15000);
      await within(gate.liff.init({ liffId: CFG.liffId }), 15000);
      cleanLoginParams();
      if (!gate.liff.isLoggedIn()) next = 'login';
      else next = (await isFriend()) ? 'friend' : 'notFriend';
    } catch (e) {
      console.warn('[來福] 查不了是不是好友，先讓他進去：', (e && e.message) || e);
      next = 'error';
    }
    if (gate.back && next === 'login') gate.note = 'LINE 沒有完成確認。請再試一次，跳出授權畫面時按「許可」。';
    setState(next);
  }

  /* LINE 登入回來網址會帶一串代碼；初始化用完就拿掉，免得重新整理時又送一次 */
  function cleanLoginParams() {
    try {
      const u = new URL(location.href);
      if (!u.searchParams.has('liffClientId') && !u.searchParams.has('code')) return;
      ['code', 'state', 'liffClientId', 'liffRedirectUri', 'error', 'error_description'].forEach(k => u.searchParams.delete(k));
      const q = u.searchParams.toString();
      history.replaceState(history.state, '', u.pathname + (q ? '?' + q : '') + u.hash);
    } catch (e) {}
  }

  function setState(s) {
    gate.state = s;
    if (allows()) {
      gate.note = '';
      if (gate.open) hide();
      return;
    }
    if (!gate.wanted) return;   // 還在看開場短片：等短片關掉再擋
    show();
    if (s === 'login' && env().inLine && !triedLoginRecently()) login();
  }

  /* 要進島了（開場短片關掉、或沒有短片）：是好友（或不用檢查、查不了）就放行，不然開來福畫面 */
  function require() {
    gate.wanted = true;
    if (allows()) return;
    show();
    if (gate.state === 'login' && env().inLine && !triedLoginRecently()) login();
  }

  function login() {
    if (!gate.liff) return;
    sessionSet(CFG.intentKey, String(Date.now()));
    sessionSet(CFG.triedKey, String(Date.now()));
    gate.note = '⏳ 正在打開 LINE 登入…';
    render();
    try {
      gate.liff.login({ redirectUri: location.origin + location.pathname });
    } catch (e) {
      console.warn('[來福] 叫不出 LINE 登入，先讓他進去：', (e && e.message) || e);
      setState('error');
    }
  }

  /* 加好友：在 LINE 裡由 LINE 接手；其他瀏覽器另開分頁，互助島留著 */
  function openLine(url) {
    if (env().inLine) { location.href = url; return; }
    const w = window.open(url, '_blank', 'noopener');
    if (!w) location.href = url;
  }

  async function recheck(auto) {
    if (gate.busy || gate.state !== 'notFriend' || !gate.liff) return;
    gate.busy = true;
    if (!auto) { gate.note = '⏳ 確認中…'; render(); }
    let next = 'notFriend';
    try {
      next = (await isFriend()) ? 'friend' : 'notFriend';
    } catch (e) {
      console.warn('[來福] 再確認時出錯，先讓他進去：', (e && e.message) || e);
      next = 'error';
    }
    gate.busy = false;
    if (auto && next === 'notFriend') return;
    gate.note = next === 'notFriend' ? '還沒看到你加入來福。加好了再按一次。' : '';
    setState(next);
  }

  function show() {
    const el = document.getElementById('laifu-gate');
    if (!el) return;
    gate.open = true;
    render();
    el.classList.remove('hidden');
  }

  function hide() {
    gate.open = false;
    document.getElementById('laifu-gate')?.classList.add('hidden');
  }

  function render() {
    const box = document.getElementById('laifu-gate-step');
    const title = document.getElementById('laifu-gate-title');
    if (!box || !title || !gate.open) return;
    const e = env();
    const s = gate.state;
    title.textContent = s === 'loading' ? '🐶 正在確認你是不是來福好友' : '🐶 先加來福好友，就能逛互助島！';
    let h = '';
    if (s === 'loading') {
      h = '<div class="laifu-msg">⏳ 正在請 LINE 確認你是不是來福的好友…</div>';
    } else if (s === 'notFriend') {
      if (e.mobile || e.inLine) {
        h = '<button type="button" class="laifu-btn" data-laifu="add">➕ 加入來福</button>'
          + '<button type="button" class="laifu-btn2" data-laifu="recheck">我加好了，再確認一次</button>'
          + '<div class="laifu-hint">加好友之後回到這裡，就會自動確認。<br>已經加過、但封鎖了來福的話，要先解除封鎖。</div>';
      } else {
        h = `<div class="laifu-qr-wrap">${QR_ADD}<div class="laifu-qr-cap">用手機 LINE 的「掃描 QR code」掃這裡，<br>按「加入好友」</div></div>`
          + '<button type="button" class="laifu-btn" data-laifu="recheck">我加好了，再確認一次</button>'
          + '<div class="laifu-hint">已經加過、但封鎖了來福的話，要先解除封鎖。</div>';
      }
    } else if (s === 'login') {
      if (e.inLine) {
        h = '<button type="button" class="laifu-btn" data-laifu="login">請 LINE 確認</button>'
          + '<div class="laifu-hint">跳出 LINE 的授權畫面時，請按「許可」。</div>';
      } else if (e.mobile) {
        h = `<a class="laifu-btn" href="${CFG.liffUrl}">用 LINE 打開互助島</a>`
          + '<div class="laifu-hint">在 LINE 裡打開，LINE 才能確認你加了來福。</div>'
          + '<button type="button" class="laifu-link" data-laifu="login">在這個瀏覽器登入 LINE</button>';
      } else {
        h = `<div class="laifu-qr-wrap">${QR_ISLAND}<div class="laifu-qr-cap">用手機 LINE 的「掃描 QR code」掃這裡，<br>在手機上逛互助島</div></div>`
          + '<div class="laifu-hint">在 LINE 裡打開，LINE 才能確認你加了來福。</div>'
          + '<button type="button" class="laifu-link" data-laifu="login">在這台電腦登入 LINE</button>';
      }
    }
    if (gate.note) h += `<div class="laifu-note">${gate.note}</div>`;
    box.innerHTML = h;
  }

  function bindUi() {
    document.getElementById('laifu-gate')?.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-laifu]');
      if (!btn) return;
      const act = btn.dataset.laifu;
      if (act === 'add') openLine(CFG.addUrl);
      else if (act === 'recheck') recheck(false);
      else if (act === 'login') login();
    });
    // 去加好友、回到互助島時自動再確認一次
    const again = () => {
      if (document.visibilityState === 'hidden' || gate.state !== 'notFriend') return;
      setTimeout(() => recheck(true), 600);
    };
    document.addEventListener('visibilitychange', again);
    window.addEventListener('focus', again);
    window.addEventListener('pageshow', again);
  }

  return {
    init,
    require,
    returningFromLogin: () => gate.back,
    state: () => gate.state,
    isOpen: () => gate.open
  };
})();
