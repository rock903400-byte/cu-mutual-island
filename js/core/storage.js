/* ==========================================================================
   集章護照、稱號、星等與成就紀錄管理 (localStorage)
   ========================================================================== */
window.STORAGE = (function () {
  const KEY = 'cu_mutual_carnival_v1';

  const RANKS = [
    { minStars: 0, title: '互助見習生', icon: '🌱' },
    { minStars: 3, title: '園遊會熱血玩家', icon: '🎪' },
    { minStars: 7, title: '互助保障規劃師', icon: '🛡️' },
    { minStars: 11, title: '理賠神算特派員', icon: '🔍' },
    { minStars: 14, title: '儲互社金牌守護神', icon: '👑' }
  ];

  const ACHIEVEMENTS = [
    { id: 'first_stamp', icon: '🎫', name: '首枚入園章', desc: '完成任意 1 座攤位挑戰' },
    { id: 'all_booths', icon: '🎡', name: '園遊會全制霸', desc: '5 座攤位皆取得至少 1 顆星' },
    { id: 'hard_winner', icon: '🔥', name: '幹部魔王挑戰者', desc: '在🔥幹部魔王版獲得 2 顆星以上' },
    { id: 'tamer_stopper', icon: '🦁', name: '馴獸師攔截王', desc: '核保快刷獲得 3 顆星滿分' },
    { id: 'ls_master', icon: '💰', name: '神算精算師', desc: '理賠神算偵探社獲得 3 顆星' },
    { id: 'life_85', icon: '🎂', name: '85 歲圓滿人生', desc: '互助人生 85 歲獲得 3 顆星' },
    { id: 'cal_master', icon: '📮', name: '25 號零遲到王', desc: '25 號送件大亂鬥獲得 3 顆星' },
    { id: 'perfect_15', icon: '👑', name: '15 星大滿貫', desc: '5 大攤位全部拿下 3 顆星！' }
  ];

  function defaultState() {
    return {
      nickname: '熱心社員',
      booths: {
        game1: { stars: 0, bestScore: 0, plays: 0, hardBest: 0 },
        game2: { stars: 0, bestScore: 0, plays: 0, hardBest: 0 },
        game3: { stars: 0, bestScore: 0, plays: 0, hardBest: 0 },
        game4: { stars: 0, bestScore: 0, plays: 0, hardBest: 0 },
        game5: { stars: 0, bestScore: 0, plays: 0, hardBest: 0 }
      },
      badges: []
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      return {
        nickname: parsed.nickname || base.nickname,
        booths: { ...base.booths, ...(parsed.booths || {}) },
        badges: Array.isArray(parsed.badges) ? parsed.badges : []
      };
    } catch {
      return defaultState();
    }
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }

  function getTotalStars(state = load()) {
    return Object.values(state.booths).reduce((sum, b) => sum + (b.stars || 0), 0);
  }

  function getTotalScore(state = load()) {
    return Object.values(state.booths).reduce((sum, b) => sum + (b.bestScore || 0), 0);
  }

  function getRank(state = load()) {
    const stars = getTotalStars(state);
    let current = RANKS[0];
    for (const r of RANKS) {
      if (stars >= r.minStars) current = r;
    }
    return current;
  }

  function recordResult(boothId, { stars, score, diff }) {
    const state = load();
    const b = state.booths[boothId] || { stars: 0, bestScore: 0, plays: 0, hardBest: 0 };
    b.plays += 1;
    if (stars > b.stars) b.stars = stars;
    if (score > b.bestScore) b.bestScore = score;
    if (diff === 'hard' && score > (b.hardBest || 0)) b.hardBest = score;
    state.booths[boothId] = b;

    const newlyUnlocked = [];
    const unlock = (id) => {
      if (!state.badges.includes(id)) {
        state.badges.push(id);
        const found = ACHIEVEMENTS.find(a => a.id === id);
        if (found) newlyUnlocked.push(found);
      }
    };

    if (stars >= 1) unlock('first_stamp');
    if (Object.values(state.booths).every(x => x.stars >= 1)) unlock('all_booths');
    if (diff === 'hard' && stars >= 2) unlock('hard_winner');
    if (boothId === 'game1' && stars === 3) unlock('tamer_stopper');
    if (boothId === 'game3' && stars === 3) unlock('ls_master');
    if (boothId === 'game4' && stars === 3) unlock('life_85');
    if (boothId === 'game5' && stars === 3) unlock('cal_master');
    if (getTotalStars(state) >= 15) unlock('perfect_15');

    save(state);
    return { state, newlyUnlocked };
  }

  function setNickname(name) {
    const state = load();
    state.nickname = (name || '').trim() || '熱心社員';
    save(state);
    return state;
  }

  function resetAll() {
    const fresh = defaultState();
    save(fresh);
    return fresh;
  }

  return {
    ACHIEVEMENTS,
    load,
    save,
    getTotalStars,
    getTotalScore,
    getRank,
    recordResult,
    setNickname,
    resetAll
  };
})();
