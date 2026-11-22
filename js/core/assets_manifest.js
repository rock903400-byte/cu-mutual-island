/* ==========================================================================
   多媒體豪華素材槽位清單 (Blender / Google Flow / Colab 自動偵測與優雅降級)
   當第二階段將對應檔案放進 assets/ 時，網頁會自動升級，完全不需改程式碼！
   ========================================================================== */
window.ASSETS_MANIFEST = {
  model3d: 'assets/models/carnival_island.glb',
  videos: {
    intro: 'assets/videos/intro_carnival.mp4',
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
    victory: 'assets/audio/vo_victory.mp3',
    booth_game1: 'assets/audio/vo_booth_1.mp3',
    booth_game2: 'assets/audio/vo_booth_2.mp3',
    booth_game3: 'assets/audio/vo_booth_3.mp3',
    booth_game4: 'assets/audio/vo_booth_4.mp3',
    booth_game5: 'assets/audio/vo_booth_5.mp3'
  },
  detected: {
    model3d: false,
    videos: {},
    images: {},
    audio: {}
  },

  async probeUrl(url) {
    if (window.location.protocol === 'file:') return false;
    try {
      const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async scanAll() {
    if (window.location.protocol === 'file:') {
      this.renderStudioPanel();
      return this.detected;
    }
    try {
      const res = await fetch('assets/manifest.json', { cache: 'no-store' });
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
    this.renderStudioPanel();
    return this.detected;
  },

  getImageUrl(key) {
    return this.detected.images[key] ? this.images[key] : null;
  },

  getAudioUrl(key) {
    return this.detected.audio[key] ? this.audio[key] : null;
  },

  applyUpgrades() {
    // Upgrade mascot avatar if generated
    if (this.detected.images.mascot_host) {
      const slot = document.getElementById('mascot-avatar-slot');
      if (slot) slot.innerHTML = `<img src="${this.images.mascot_host}" alt="互助小管家" />`;
    }
    // Show intro Veo video banner if generated
    if (this.detected.videos.intro) {
      const banner = document.getElementById('intro-video-banner');
      const vid = document.getElementById('intro-video-el');
      if (banner && vid) {
        vid.src = this.videos.intro;
        banner.classList.remove('hidden');
      }
    }
  },

  renderStudioPanel() {
    const panel = document.getElementById('asset-status-panel');
    if (!panel) return;
    const imgCount = Object.values(this.detected.images).filter(Boolean).length;
    const imgTotal = Object.keys(this.images).length;
    const vidCount = Object.values(this.detected.videos).filter(Boolean).length;
    const audCount = Object.values(this.detected.audio).filter(Boolean).length;
    const audTotal = Object.keys(this.audio).length;

    panel.innerHTML = `
      <div class="asset-pill-box">
        <strong>🧊 Blender 3D 園遊會小島 (.glb)</strong>
        <div class="${this.detected.model3d ? 'asset-ok' : 'asset-pending'}">
          ${this.detected.model3d ? '✅ 已載入自訂 Blender 模型' : '⚡ 目前使用內建 Three.js 3D 小島（待匯入 assets/models/carnival_island.glb）'}
        </div>
      </div>
      <div class="asset-pill-box">
        <strong>🎨 Google Flow 角色立繪與視覺</strong>
        <div class="${imgCount > 0 ? 'asset-ok' : 'asset-pending'}">
          ${imgCount > 0 ? `✅ 已載入 ${imgCount}/${imgTotal} 張插畫` : `⏳ 0/${imgTotal}（已預留槽位，詳見 tools/google_flow_prompts.md）`}
        </div>
      </div>
      <div class="asset-pill-box">
        <strong>🎬 Google Flow Veo 開場／慶祝短片</strong>
        <div class="${vidCount > 0 ? 'asset-ok' : 'asset-pending'}">
          ${vidCount > 0 ? `✅ 已載入 ${vidCount}/2 部短片` : '⏳ 0/2（放進 assets/videos/ 自動解鎖播放）'}
        </div>
      </div>
      <div class="asset-pill-box">
        <strong>🎙️ 國／台語旁白與園遊會 BGM</strong>
        <div class="${audCount > 0 ? 'asset-ok' : 'asset-pending'}">
          ${audCount > 0 ? `✅ 已就緒 ${audCount}/${audTotal} 個音檔` : '⚡ 目前使用內建 Web Audio 音效＋合成配樂（可用 tools/generate_audio_colab.ipynb 升級）'}
        </div>
      </div>
    `;
  }
};
