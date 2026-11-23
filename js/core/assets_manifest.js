/* ==========================================================================
   多媒體豪華素材槽位清單 (v14 — 支援 10 句媠聲台語彩蛋與自動降級)
   ========================================================================== */
window.ASSETS_MANIFEST = {
  model3d: 'assets/models/carnival_island.glb',
  videos: {
    // 2026-11-24 換成 Google Flow 重新生成的版本（原片 5.1 秒起高鐵一台變兩台）；換影片後把 ?v= 加 1
    intro: 'assets/videos/intro_carnival.mp4?v=2',
    victory: 'assets/videos/victory_fireworks.mp4'
  },
  images: {
    mascot_host: 'assets/images/mascot_host.jpg',
    carnival_hero: 'assets/images/carnival_hero.png',
    char_tamer: 'assets/images/char_tamer.jpg',
    char_grandma: 'assets/images/char_grandma.jpg',
    char_grandpa: 'assets/images/char_grandpa.jpg',
    char_baby: 'assets/images/char_baby.jpg',
    char_climber: 'assets/images/char_climber.jpg',
    char_teacher: 'assets/images/char_teacher.jpg',
    char_shop: 'assets/images/char_teacher.jpg',
    char_office: 'assets/images/char_office.jpg',
    char_pyro: 'assets/images/char_pyro.jpg',
    char_officer: 'assets/images/char_officer.jpg',
    char_sailor: 'assets/images/char_climber.jpg'
  },
  audio: {
    bgm: 'assets/audio/bgm_day.mp3?v=3',
    bgm_day: 'assets/audio/bgm_day.mp3?v=3',
    bgm_night: 'assets/audio/bgm_night.mp3?v=3',
    welcome: 'assets/audio/vo_welcome.mp3',
    taigi_welcome: 'assets/audio/vo_taigi_welcome.mp3',
    taigi_good: 'assets/audio/vo_taigi_good.mp3',
    taigi_reject: 'assets/audio/vo_taigi_reject.mp3',
    taigi_tamer: 'assets/audio/vo_taigi_tamer.mp3',
    taigi_victory: 'assets/audio/vo_taigi_victory.mp3',
    taigi_combo: 'assets/audio/vo_taigi_combo.mp3',
    taigi_encourage: 'assets/audio/vo_taigi_encourage.mp3',
    taigi_insider: 'assets/audio/vo_taigi_insider.mp3',
    taigi_spin: 'assets/audio/vo_taigi_spin.mp3',
    taigi_mail: 'assets/audio/vo_taigi_mail.mp3',
    victory: 'assets/audio/vo_victory.mp3',
    booth_game1: 'assets/audio/vo_booth_1.mp3',
    booth_game2: 'assets/audio/vo_booth_2.mp3',
    booth_game3: 'assets/audio/vo_booth_3.mp3',
    booth_game4: 'assets/audio/vo_booth_4.mp3',
    booth_game5: 'assets/audio/vo_booth_5.mp3',
    // 每站語音導覽（tools/generate_stop_voice.py 產生；重做音檔後把 ?v= 加 1）
    stop_lp: 'assets/audio/vo_stop_lp.mp3?v=1',
    stop_ls: 'assets/audio/vo_stop_ls.mp3?v=1',
    stop_group: 'assets/audio/vo_stop_group.mp3?v=1',
    stop_accident: 'assets/audio/vo_stop_accident.mp3?v=1',
    stop_senior: 'assets/audio/vo_stop_senior.mp3?v=1',
    stop_cancer: 'assets/audio/vo_stop_cancer.mp3?v=1',
    stop_ci: 'assets/audio/vo_stop_ci.mp3?v=1',
    stop_officer: 'assets/audio/vo_stop_officer.mp3?v=1'
  },
  detected: {
    model3d: false,
    videos: {},
    images: {},
    audio: {}
  },

  async scanAll() {
    if (window.location.protocol === 'file:') {
      return this.detected;
    }
    try {
      const res = await fetch('assets/manifest.json?v=15', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        this.detected.model3d = Boolean(data.model3d);
        this.detected.videos = data.videos || {};
        this.detected.images = data.images || {};
        this.detected.audio = data.audio || {};
      }
    } catch {
      // Keep safe defaults
    }
    this.applyUpgrades();
    return this.detected;
  },

  getImageUrl(key) {
    return this.detected.images[key] ? this.images[key] : null;
  },

  getAudioUrl(key) {
    return this.detected.audio[key] ? this.audio[key] : null;
  },

  applyUpgrades() {
    if (this.detected.images.mascot_host) {
      const slot = document.getElementById('mascot-avatar-slot');
      if (slot) slot.innerHTML = `<img src="${this.images.mascot_host}" alt="互助小管家" />`;
    }
  }
};
