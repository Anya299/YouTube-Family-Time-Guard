(() => {
  "use strict";

  const timeEl = document.getElementById("todayTime");
  const statusEl = document.getElementById("status");
  const resetBtn = document.getElementById("reset");

  function localDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function formatTime(totalSeconds) {
    const s = Math.floor(Number(totalSeconds) || 0);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h,m,sec].map(v => String(v).padStart(2,"0")).join(":");
  }

  function refresh() {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      const saved = data[STORAGE_KEY];
      const today = localDateKey();

      if (!saved || saved.date !== today || saved.version !== STORAGE_VERSION) {
        timeEl.textContent = "00:00:00";
        statusEl.textContent = "Only active YouTube playback time is counted.";
        return;
      }

      timeEl.textContent = formatTime(saved.seconds);
      statusEl.textContent = saved.limitReached
        ? "Your 2-hour reminder has been reached today."
        : "Only active YouTube playback time is counted.";
    });
  }

  resetBtn.addEventListener("click", () => {
    const state = {
      version: STORAGE_VERSION,
      date: localDateKey(),
      seconds: 0,
      limitReached: false
    };
    chrome.storage.local.set({ [STORAGE_KEY]: state }, refresh);
  });

  refresh();
  setInterval(refresh, 1000);
})();