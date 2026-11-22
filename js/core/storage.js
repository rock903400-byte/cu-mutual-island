/* ==========================================================================
   集章護照、稱號、雙難度星等（15 金星＋5 魔王赤紅徽章）與成就紀錄管理 (v14)
   ========================================================================== */
window.STORAGE = (function () {
  const KEY = 'cu_mutual_carnival_v1';

  const RANKS = [
    { minStars: 0, title: '互助見習生', icon: '🌱' },
    { minStars: 3, title: '登島熱血玩家', icon: '🎪' },
    { minStars: 7, title: '互助保障規劃師', icon: '🛡️' },
    { minStars: 11, title: '理賠神算特派員', icon: '🔍' },
    { minStars: 14, title: '儲互社金牌守護神', icon: '👑' }
  ];

  const ACHIEVEMENTS = [
    { id: 'first_stamp', icon: '🎫', name: '首枚入島章', desc: '完成任意 1 座攤位並取得星等' },
    { id: 'all_booths', icon: '🏝️', name: '互助島全制霸', desc: '5 座攤位皆過關（解鎖全島熱氣球彩蛋！）' },
    { id: 'tamer_stopper', icon: '🦁', name: '馴獸師攔截王', desc: '第 1 攤《核保快刷》獲得 3 顆星' },
    { id: 'clinic_doctor', icon: '🩺', name: '金牌互助規劃師', desc: '第 2 攤《互助配對診所》獲得 3 顆星' },
    { id: 'ls_master', icon: '💰', name: '神算精算偵探', desc: '第 3 攤《理賠神算偵探社》獲得 3 顆星' },
    { id: 'life_85', icon: '🎂', name: '85 歲圓滿人生', desc: '第 4 攤《互助人生 85 歲》獲得 3 顆星' },
    { id: 'cal_master', icon: '📮', name: '25 號零遲到王', desc: '第 5 攤《25 號送件大亂鬥》獲得 3 顆星' },
    { id: 'hard_winner', icon: '🔥', name: '幹部魔王征服者', desc: '在🔥幹部魔王版任一攤獲得 2 顆星以上' },
    { id: 'hard_all_5', icon: '⚔️', name: '五攤魔王大滿貫', desc: '全部 5 攤🔥幹部魔王版皆獲 2 顆星以上' },
    { id: 'perfect_15', icon: '👑', name: '15 星傳說守護神', desc: '5 大攤位全部拿下 3 顆星滿貫！' }
  ];

  function defaultBooth() {
    return { stars: 0, bestScore: 0, plays: 0, hardStars: 0, hardBest: 0 };
  }

  function defaultState() {
    return {
      nickname: '熱心社員',
      booths: {
        game1: defaultBooth(),
        game2: defaultBooth(),
        game3: defaultBooth(),
        game4: defaultBooth(),
        game5: defaultBooth()
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
      const mergedBooths = {};
      Object.keys(base.booths).forEach(k => {
        mergedBooths[k] = { ...defaultBooth(), ...(parsed.booths?.[k] || {}) };
      });
      return {
        nickname: parsed.nickname || base.nickname,
        booths: mergedBooths,
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

  function getHardBadgeCount(state = load()) {
    return Object.values(state.booths).reduce((sum, b) => sum + ((b.hardStars || 0) >= 2 ? 1 : 0), 0);
  }

  function getTotalScore(state = load()) {
    return Object.values(state.booths).reduce((sum, b) => sum + (b.bestScore || 0), 0);
  }

  function getRank(state = load()) {
    const stars = getTotalStars(state);
    const hardCount = getHardBadgeCount(state);
    if (stars >= 15 && hardCount >= 5) {
      return { minStars: 15, title: '儲互社無雙大督導', icon: '🏆' };
    }
    let current = RANKS[0];
    for (const r of RANKS) {
      if (stars >= r.minStars) current = r;
    }
    return current;
  }

  function getIslandProgress(state = load()) {
    const entries = Object.entries(state.booths);
    const clearedBooths = entries.filter(([, b]) => (b.stars || 0) >= 1).length;
    const totalStars = getTotalStars(state);
    const hardBadges = getHardBadgeCount(state);
    const perBooth = {};
    entries.forEach(([id, b]) => {
      perBooth[id] = {
        stars: b.stars || 0,
        hardCleared: (b.hardStars || 0) >= 2,
        hardStars: b.hardStars || 0
      };
    });
    return {
      totalStars,
      clearedBooths,
      hardBadges,
      isAllCleared: clearedBooths >= 5,
      isPerfect15: totalStars >= 15,
      perBooth
    };
  }

  function recordResult(boothId, { stars, score, diff }) {
    const state = load();
    const b = { ...defaultBooth(), ...(state.booths[boothId] || {}) };
    b.plays += 1;
    if (stars > b.stars) b.stars = stars;
    if (score > b.bestScore) b.bestScore = score;
    if (diff === 'hard') {
      if (stars > (b.hardStars || 0)) b.hardStars = stars;
      if (score > (b.hardBest || 0)) b.hardBest = score;
    }
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
    if (Object.values(state.booths).every(x => (x.stars || 0) >= 1)) unlock('all_booths');
    if (diff === 'hard' && stars >= 2) unlock('hard_winner');
    if (getHardBadgeCount(state) >= 5) unlock('hard_all_5');
    if (boothId === 'game1' && stars === 3) unlock('tamer_stopper');
    if (boothId === 'game2' && stars === 3) unlock('clinic_doctor');
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
    getHardBadgeCount,
    getTotalScore,
    getRank,
    getIslandProgress,
    recordResult,
    setNickname,
    resetAll
  };
})();
