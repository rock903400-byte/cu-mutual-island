/* ==========================================================================
   音效、國台語智慧輪播配音與「日夜雙原聲配樂自動淡入＋語音閃避」引擎 (v14)
   - 智慧語音節奏：避免每題重複播放同一句台語，依連擊／關鍵彩蛋／多口氣輪播
   - 新增輪盤撥片聲、飛卡呼嘯聲、偵探發現線索聲、彩帶慶祝聲
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
  let goodToggle = 0;
  let missCount = 0;
  let lastVoiceMs = 0;
  let pausedByLifecycle = false;
  let resumeFadeTimer = null;

  function pauseAllVideos() {
    document.querySelectorAll('video').forEach(v => {
      try { if (!v.paused) v.pause(); } catch {}
    });
  }

  function handleBackgroundPause(hardStop = false) {
    if (resumeFadeTimer) { clearInterval(resumeFadeTimer); resumeFadeTimer = null; }
    stopVoice();
    pauseAllVideos();
    if (ctx && ctx.state === 'running') {
      ctx.suspend().catch(() => {});
    }
    if (hardStop) {
      // pagehide / beforeunload: completely release audio streams so LINE WebView NEVER leaks background sound!
      pausedByLifecycle = bgmStarted;
      stopBgm();
      return;
    }
    if (activeAudio && !activeAudio.paused) {
      pausedByLifecycle = true;
      try { activeAudio.pause(); } catch {}
    } else if (bgmStarted && !pausedForVideo) {
      pausedByLifecycle = true;
    }
    flushFadingAudios();
  }

  function handleForegroundResume() {
    if (document.hidden) return;
    if (ctx && ctx.state === 'suspended' && enabled) {
      ctx.resume().catch(() => {});
    }
    if (!pausedByLifecycle || !enabled || !bgmStarted || pausedForVideo) {
      pausedByLifecycle = false;
      return;
    }
    pausedByLifecycle = false;
    if (activeAudio) {
      const target = getCurrentTargetVol();
      activeAudio.volume = 0.0;
      activeAudio.play().then(() => {
        if (resumeFadeTimer) clearInterval(resumeFadeTimer);
        let step = 0;
        const steps = 10;
        resumeFadeTimer = setInterval(() => {
          step++;
          if (!activeAudio || document.hidden || !enabled || pausedForVideo) {
            clearInterval(resumeFadeTimer);
            resumeFadeTimer = null;
            return;
          }
          const tgt = getCurrentTargetVol();
          activeAudio.volume = Math.min(tgt, tgt * (step / steps));
          if (step >= steps) {
            clearInterval(resumeFadeTimer);
            resumeFadeTimer = null;
            activeAudio.volume = tgt;
          }
        }, 50);
      }).catch(() => {});
    } else {
      startBgm();
    }
  }

  // LINE In-App Browser (iOS WKWebView / Android WebView) + Mobile Switch/Lock Lifecycle Guards
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) handleBackgroundPause(false);
    else handleForegroundResume();
  });
  window.addEventListener('pagehide', () => handleBackgroundPause(true));
  window.addEventListener('beforeunload', () => handleBackgroundPause(true));
  window.addEventListener('blur', () => handleBackgroundPause(false));
  window.addEventListener('focus', () => handleForegroundResume());
  window.addEventListener('pageshow', (e) => {
    if (e.persisted || pausedByLifecycle) handleForegroundResume();
  });

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

  // 語音結束或被打斷時通知呼叫的人（每站語音導覽用來切換按鈕）：reason = ended／stopped／error／blocked
  function finishVoice(v, reason) {
    const cb = v && v._onDone;
    if (!cb) return;
    v._onDone = null;
    try { cb(reason); } catch {}
  }

  function stopVoice() {
    if (activeVoice) {
      const v = activeVoice;
      activeVoice = null;
      try { v.onended = null; v.onerror = null; v.pause(); } catch {}
      finishVoice(v, 'stopped');
    }
    voiceDucking = false;
    applyDuckingVolume();
  }

  // opts.onDone(reason)：播完、被停掉（離開頁面、靜音、換別句）、載入失敗或被瀏覽器擋下時都會叫一次
  function playVoice(key, opts = {}) {
    if (!enabled || !key) return false;
    const url = window.ASSETS_MANIFEST && window.ASSETS_MANIFEST.getAudioUrl(key);
    if (!url) return false;
    try {
      stopVoice();
      const v = new Audio(url);
      v.volume = 0.96;
      v._onDone = typeof opts.onDone === 'function' ? opts.onDone : null;
      activeVoice = v;
      voiceDucking = true;
      lastVoiceMs = Date.now();
      applyDuckingVolume();

      const restore = (reason) => {
        if (activeVoice === v) {
          activeVoice = null;
          voiceDucking = false;
          applyDuckingVolume();
        }
        finishVoice(v, reason);
      };
      v.onended = () => restore('ended');
      v.onerror = () => restore('error');
      v.play().catch(() => restore('blocked'));
      return true;
    } catch {
      voiceDucking = false;
      applyDuckingVolume();
      return false;
    }
  }

  // Smart reaction voice pacing so players never hear the exact same phrase 6 times in a row!
  function playReaction(isCorrect, combo = 1, specialKey = null) {
    if (!enabled) return;
    if (specialKey && window.ASSETS_MANIFEST?.getAudioUrl(specialKey)) {
      playVoice(specialKey);
      return;
    }
    const now = Date.now();
    if (isCorrect) {
      // Streak milestones always trigger celebratory combo voice
      if (combo >= 3 && combo % 2 === 1) {
        if (!playVoice('taigi_combo')) playVoice('taigi_good');
        return;
      }
      // First correct or after sufficient cooldown, alternate between 2 distinct phrases
      if (combo === 1 || (now - lastVoiceMs > 7500)) {
        goodToggle += 1;
        const pick = goodToggle % 2 === 0 ? 'taigi_insider' : 'taigi_good';
        if (!playVoice(pick)) playVoice('taigi_good');
      }
    } else {
      missCount += 1;
      // Don't scold every single miss; alternate warm encouragement vs reminder
      if (missCount === 1 || (now - lastVoiceMs > 6500)) {
        const pick = missCount % 2 === 1 ? 'taigi_encourage' : 'taigi_reject';
        if (!playVoice(pick)) playVoice('taigi_reject');
      }
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
    // 影片結束但使用者還沒互動過：只解除「影片播放中」狀態，不硬放音樂（瀏覽器會擋），等第一次點擊再開
    releaseVideoHold() {
      pausedForVideo = false;
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
    stopVoice,
    isVoicePlaying: () => Boolean(activeVoice),
    playReaction,
    click() {
      playTone(640, 0.065, 'sine', 0.085);
    },
    whoosh() {
      const c = ensureCtx();
      if (!c) return;
      const now = c.currentTime;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);
      g.gain.setValueAtTime(0.08, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    },
    stamp(isApprove = true) {
      playTone(130, 0.13, 'triangle', 0.25);
      playTone(isApprove ? 620 : 250, 0.14, 'sine', 0.13, 0.045);
    },
    clueFound() {
      playTone(698.46, 0.11, 'sine', 0.13, 0);
      playTone(880.0, 0.13, 'sine', 0.13, 0.07);
      playTone(1174.66, 0.22, 'triangle', 0.14, 0.14);
    },
    spinTick(pitch = 1.0) {
      playTone(720 * pitch, 0.045, 'triangle', 0.11, 0);
    },
    confetti() {
      [587.33, 783.99, 987.77, 1174.66].forEach((f, i) => {
        playTone(f, 0.16, 'triangle', 0.11, i * 0.05);
      });
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
