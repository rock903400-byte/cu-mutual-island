/* ==========================================================================
   音效、國台語配音與「日夜雙原聲配樂自動淡入＋語音閃避」引擎 (v12)
   - 白天/清晨 -> bgm_day.mp3（CC0 實錄暖陽烏克麗麗／木吉他原聲）
   - 夕陽/星空夜景 -> bgm_night.mp3（CC0 實錄柔和晚安鋼琴／八音盒原聲）
   - 修復快速切換日夜疊音、支援國台語語音播放自動壓低 BGM、支援片頭影片暫停連動
   ========================================================================== */
window.SOUND = (function () {
  let ctx = null;
  let enabled = true;
  let musicTheme = 'day'; // 'day' | 'night'
  let bgmStarted = false;
  let pausedForVideo = false;
  let voiceDucking = false;
  let activeAudio = null;
  let fadingOutAudios = [];
  let fadeTimer = null;
  let synthTimer = null;
  let synthStep = 0;
  let activeVoice = null;

  function ensureCtx() {
    if (!enabled) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function playTone(freq, dur, type = 'triangle', gainVal = 0.14, delay = 0) {
    const c = ensureCtx();
    if (!c) return;
    const now = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(gainVal, now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(now);
    osc.stop(now + dur + 0.03);
  }

  // Fallback gentle polyphonic Day (ukulele/marimba) & Night (music box/piano)
  const DAY_MELODY = [523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 587.33, 523.25, 587.33, 659.25, 783.99, 1046.5, 880.0, 783.99, 659.25];
  const NIGHT_MELODY = [659.25, 783.99, 987.77, 783.99, 659.25, 587.33, 523.25, 587.33, 659.25, 987.77, 880.0, 783.99, 659.25, 523.25, 587.33, 523.25];

  function getBaseTargetVol() {
    return musicTheme === 'night' ? 0.25 : 0.22;
  }

  function getCurrentTargetVol() {
    const base = getBaseTargetVol();
    return voiceDucking ? base * 0.26 : base;
  }

  function applyDuckingVolume() {
    if (!activeAudio || fadeTimer) return;
    activeAudio.volume = getCurrentTargetVol();
  }

  function getTrackUrl(theme) {
    if (!window.ASSETS_MANIFEST) return null;
    const key = theme === 'night' ? 'bgm_night' : 'bgm_day';
    return window.ASSETS_MANIFEST.getAudioUrl(key) || window.ASSETS_MANIFEST.getAudioUrl('bgm');
  }

  function stopSynth() {
    if (synthTimer) { clearInterval(synthTimer); synthTimer = null; }
  }

  function killAudio(a) {
    if (!a) return;
    try { a.pause(); a.src = ''; } catch {}
  }

  function flushFadingAudios() {
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
    while (fadingOutAudios.length) {
      killAudio(fadingOutAudios.pop());
    }
  }

  function startSynthFallback() {
    stopSynth();
    const intervalMs = musicTheme === 'night' ? 560 : 350;
    synthTimer = setInterval(() => {
      if (!enabled || pausedForVideo || document.hidden) return;
      const duck = voiceDucking ? 0.28 : 1.0;
      const notes = musicTheme === 'night' ? NIGHT_MELODY : DAY_MELODY;
      const n = notes[synthStep % notes.length];
      if (musicTheme === 'night') {
        playTone(n, 0.72, 'sine', 0.036 * duck);
        if (synthStep % 4 === 0) playTone(n / 2, 1.1, 'sine', 0.024 * duck);
      } else {
        playTone(n, 0.24, 'triangle', 0.034 * duck);
        if (synthStep % 4 === 0) playTone(n / 2, 0.34, 'sine', 0.028 * duck);
      }
      synthStep++;
    }, intervalMs);
  }

  function crossfadeToAudio(url) {
    stopSynth();
    // Immediately kill any previously fading-out tracks so rapid clicks NEVER leak overlapping audio!
    flushFadingAudios();

    if (activeAudio && activeAudio._trackUrl === url) {
      activeAudio.volume = getCurrentTargetVol();
      if (activeAudio.paused && !pausedForVideo) activeAudio.play().catch(() => {});
      return;
    }

    const oldAudio = activeAudio;
    const oldStartVol = oldAudio ? oldAudio.volume : 0;
    if (oldAudio) fadingOutAudios.push(oldAudio);

    const nextAudio = new Audio(url);
    nextAudio._trackUrl = url;
    nextAudio.loop = true;
    nextAudio.volume = 0.0;
    activeAudio = nextAudio;

    if (pausedForVideo) {
      flushFadingAudios();
      return;
    }

    nextAudio.play().then(() => {
      // Guard: if activeAudio changed while awaiting play(), abort this stale instance!
      if (activeAudio !== nextAudio) {
        killAudio(nextAudio);
        return;
      }
      let step = 0;
      const steps = 16;
      fadeTimer = setInterval(() => {
        step++;
        const p = Math.min(1, step / steps);
        const tgt = getCurrentTargetVol();
        nextAudio.volume = Math.min(tgt, tgt * p);
        if (oldAudio) oldAudio.volume = Math.max(0, oldStartVol * (1 - p));
        if (step >= steps) {
          clearInterval(fadeTimer);
          fadeTimer = null;
          flushFadingAudios();
          nextAudio.volume = getCurrentTargetVol();
        }
      }, 55);
    }).catch(() => {
      // Autoplay blocked until next user gesture
      flushFadingAudios();
      if (activeAudio === nextAudio) activeAudio = null;
    });
  }

  function startBgm() {
    if (!enabled) return;
    bgmStarted = true;
    if (pausedForVideo) return;
    const url = getTrackUrl(musicTheme);
    if (url) {
      crossfadeToAudio(url);
    } else {
      flushFadingAudios();
      killAudio(activeAudio);
      activeAudio = null;
      startSynthFallback();
    }
  }

  function stopBgm() {
    stopSynth();
    flushFadingAudios();
    killAudio(activeAudio);
    activeAudio = null;
  }

  function stopVoice() {
    if (activeVoice) {
      try { activeVoice.onended = null; activeVoice.onerror = null; activeVoice.pause(); } catch {}
      activeVoice = null;
    }
    voiceDucking = false;
    applyDuckingVolume();
  }

  function playVoice(key) {
    if (!enabled || !key) return;
    const url = window.ASSETS_MANIFEST && window.ASSETS_MANIFEST.getAudioUrl(key);
    if (!url) return;
    try {
      stopVoice();
      const v = new Audio(url);
      v.volume = 0.96;
      activeVoice = v;
      voiceDucking = true;
      applyDuckingVolume();

      const restore = () => {
        if (activeVoice === v) {
          activeVoice = null;
          voiceDucking = false;
          applyDuckingVolume();
        }
      };
      v.onended = restore;
      v.onerror = restore;
      v.play().catch(restore);
    } catch {
      voiceDucking = false;
      applyDuckingVolume();
    }
  }

  return {
    isEnabled: () => enabled,
    toggle() {
      enabled = !enabled;
      if (!enabled) {
        stopBgm();
        stopVoice();
      } else {
        this.click();
        startBgm();
      }
      return enabled;
    },
    ensureBgm() {
      if (enabled && !pausedForVideo && (!bgmStarted || (!activeAudio && !synthTimer))) startBgm();
    },
    pauseBgmForVideo() {
      pausedForVideo = true;
      stopVoice();
      if (activeAudio) {
        try { activeAudio.pause(); } catch {}
      }
      flushFadingAudios();
    },
    resumeBgmAfterVideo() {
      pausedForVideo = false;
      if (!enabled) return;
      if (activeAudio) {
        activeAudio.volume = getCurrentTargetVol();
        activeAudio.play().catch(() => {});
      } else {
        startBgm();
      }
    },
    setMusicTheme(theme) {
      const next = (theme === 'night' || theme === 'sunset') ? 'night' : 'day';
      if (next === musicTheme && (activeAudio || synthTimer)) return;
      musicTheme = next;
      if (enabled && bgmStarted && !pausedForVideo) startBgm();
    },
    playVoice,
    click() {
      playTone(640, 0.065, 'sine', 0.085);
    },
    stamp(isApprove = true) {
      playTone(135, 0.12, 'triangle', 0.24);
      playTone(isApprove ? 587 : 260, 0.14, 'sine', 0.12, 0.05);
    },
    correct(combo = 1) {
      const shift = Math.min(combo - 1, 6) * 45;
      playTone(523.25 + shift, 0.14, 'triangle', 0.15, 0);
      playTone(659.25 + shift, 0.16, 'triangle', 0.16, 0.08);
      playTone(783.99 + shift, 0.22, 'sine', 0.15, 0.16);
    },
    wrong() {
      playTone(250, 0.18, 'sawtooth', 0.11, 0);
      playTone(195, 0.26, 'sawtooth', 0.11, 0.12);
    },
    tick() {
      playTone(880, 0.05, 'square', 0.045);
    },
    fanfare(isPerfect = false) {
      [523.25, 659.25, 783.99, 1046.5].forEach((n, idx) => {
        playTone(n, 0.28, 'triangle', 0.16, idx * 0.1);
      });
      setTimeout(() => playVoice(isPerfect ? 'taigi_victory' : 'victory'), 420);
    }
  };
})();
