(() => {
  "use strict";

  if (window.__familyTimeGuardLoaded) return;
  window.__familyTimeGuardLoaded = true;

  const MESSAGE = "2 hours kala nodidira, family jothe time spend madi, chinte beda.";
  const SUBTITLE = "A small reminder to make a little room for family. ♡";

  let state = {
    version: STORAGE_VERSION,
    date: localDateKey(),
    seconds: 0,
    limitReached: false
  };

  let overlay = null;
  let tickHandle = null;
  let lastTickMs = null;
  let saveQueued = false;
  let audioContext = null;

  function localDateKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function loadState() {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      const saved = data[STORAGE_KEY];
      if (saved && saved.date === localDateKey() && saved.version === STORAGE_VERSION) {
        state = {
          version: STORAGE_VERSION,
          date: saved.date,
          seconds: Number(saved.seconds) || 0,
          limitReached: Boolean(saved.limitReached)
        };
      } else {
        state = { version: STORAGE_VERSION, date: localDateKey(), seconds: 0, limitReached: false };
        saveState();
      }
      renderIfNeeded();
      updateLoop();
    });
  }

  function saveState() {
    chrome.storage.local.set({ [STORAGE_KEY]: state });
  }

  function queueSave() {
    if (saveQueued) return;
    saveQueued = true;
    setTimeout(() => {
      saveQueued = false;
      saveState();
    }, 250);
  }

  function resetIfNewDay() {
    const today = localDateKey();
    if (state.date !== today) {
      state = { version: STORAGE_VERSION, date: today, seconds: 0, limitReached: false };
      saveState();
      hideOverlay();
    }
  }

  function isYouTubeWatchPage() {
    return location.pathname === "/watch" && !!new URLSearchParams(location.search).get("v");
  }

  function getVideo() {
    return document.querySelector("video.html5-main-video, video");
  }

  function isActivelyPlaying() {
    const video = getVideo();
    return !!(
      video &&
      !video.paused &&
      !video.ended &&
      video.readyState >= 2 &&
      document.visibilityState === "visible" &&
      isYouTubeWatchPage() &&
      !state.limitReached
    );
  }

  function updateLoop() {
    resetIfNewDay();

    if (isActivelyPlaying()) {
      if (!tickHandle) {
        lastTickMs = Date.now();
        tickHandle = setInterval(trackTick, 250);
      }
    } else {
      stopLoop();
    }
  }

  function stopLoop() {
    if (tickHandle) clearInterval(tickHandle);
    tickHandle = null;
    lastTickMs = null;
  }

  function trackTick() {
    resetIfNewDay();

    if (!isActivelyPlaying()) {
      stopLoop();
      return;
    }

    const now = Date.now();
    const elapsed = Math.max(0, Math.min((now - lastTickMs) / 1000, 1));
    lastTickMs = now;

    state.seconds += elapsed;
    queueSave();

    if (state.seconds >= LIMIT_SECONDS) {
      state.seconds = LIMIT_SECONDS;
      state.limitReached = true;
      saveState();
      stopLoop();
      triggerReminder();
    }
  }

  function createOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "ftg-overlay";
    overlay.innerHTML = `
      <div class="ftg-backdrop"></div>
      <div class="ftg-card" role="dialog" aria-modal="true" aria-labelledby="ftg-title">
        <div class="ftg-bell-wrap">
          <div class="ftg-bell" aria-hidden="true">🔔</div>
          <div class="ftg-sparkle sparkle-a">✦</div>
          <div class="ftg-sparkle sparkle-b">♡</div>
          <div class="ftg-sparkle sparkle-c">✦</div>
        </div>
        <div class="ftg-kicker">A gentle little reminder</div>
        <h1 id="ftg-title">Family Time ♡</h1>
        <p class="ftg-message">${MESSAGE}</p>
        <p class="ftg-subtitle">${SUBTITLE}</p>
        <div class="ftg-actions">
          <button id="ftg-continue" class="ftg-btn ftg-primary">Continue to YouTube</button>
          <button id="ftg-family" class="ftg-btn ftg-secondary">OK — Family Time</button>
        </div>
      </div>
    `;

    document.documentElement.appendChild(overlay);

    overlay.querySelector("#ftg-continue").addEventListener("click", continueToYouTube);
    overlay.querySelector("#ftg-family").addEventListener("click", familyTime);

    return overlay;
  }

  function pauseVideo() {
    const video = getVideo();
    if (video && !video.paused) video.pause();
  }

  function ringBell() {
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") audioContext.resume();

      const now = audioContext.currentTime;
      [0, 0.18, 0.36].forEach((offset, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(i === 1 ? 880 : 740, now + offset);
        osc.frequency.exponentialRampToValueAtTime(620, now + offset + 0.5);
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.18, now + offset + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.55);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.6);
      });
    } catch (_) {
      // Audio may be unavailable due to browser autoplay/security restrictions.
    }
  }

  function speakReminder() {
    try {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(MESSAGE);
      utterance.rate = 0.82;
      utterance.pitch = 1.02;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  }

  function triggerReminder() {
    pauseVideo();
    showOverlay();
    ringBell();
    setTimeout(speakReminder, 150);
  }

  function showOverlay() {
    const el = createOverlay();
    el.classList.add("ftg-visible");
    document.body.classList.add("ftg-reminder-open");
  }

  function hideOverlay() {
    if (overlay) overlay.classList.remove("ftg-visible");
    document.body.classList.remove("ftg-reminder-open");
    try { window.speechSynthesis.cancel(); } catch (_) {}
  }

  function continueToYouTube() {
    hideOverlay();
    state.limitReached = false;
    saveState();
    const video = getVideo();
    if (video) {
      video.play().catch(() => {});
    }
    updateLoop();
  }

  function familyTime() {
    pauseVideo();
    hideOverlay();
    state.limitReached = true;
    saveState();
    stopLoop();

    // Leave the current video without closing the whole browser.
    location.href = "https://www.youtube.com/";
  }

  function renderIfNeeded() {
    if (state.limitReached && isYouTubeWatchPage()) {
      pauseVideo();
      showOverlay();
    } else if (!state.limitReached) {
      hideOverlay();
    }
  }

  function watchForVideoChanges() {
    document.addEventListener("visibilitychange", updateLoop);
    window.addEventListener("focus", updateLoop);
    window.addEventListener("blur", updateLoop);

    document.addEventListener("play", updateLoop, true);
    document.addEventListener("pause", updateLoop, true);
    document.addEventListener("ended", updateLoop, true);

    let lastUrl = location.href;
    setInterval(() => {
      resetIfNewDay();

      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(() => {
          renderIfNeeded();
          updateLoop();
        }, 300);
      } else {
        updateLoop();
      }
    }, 500);
  }

  loadState();
  watchForVideoChanges();
})();