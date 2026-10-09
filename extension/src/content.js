/* global YSS */
(() => {
  const POLL_MS = 500;
  const ADVANCE_TIMEOUT_MS = 2500;
  const VIDEO_MISSING_MS = 10000;

  let selectors = YSS.SELECTORS;
  let enabled = YSS.SETTINGS.enabled;

  let video = null;
  let lastTime = 0;
  let watchedUrl = '';
  let advancing = false;
  let shortsSince = 0;
  let lastHealth = null;

  chrome.storage.local.get(['settings', 'remoteSelectors']).then(applyStorage);
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    applyStorage({
      settings: changes.settings?.newValue,
      remoteSelectors: changes.remoteSelectors?.newValue
    });
  });

  function applyStorage({ settings, remoteSelectors }) {
    if (settings) enabled = settings.enabled !== false;
    if (remoteSelectors) selectors = { ...YSS.SELECTORS, ...remoteSelectors };
  }

  const isShorts = () => location.pathname.startsWith('/shorts/');

  function query(list) {
    for (const sel of list) {
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch { /* invalid selector from remote config */ }
    }
    return null;
  }

  function report(ok, reason = '') {
    if (ok === lastHealth) return;
    lastHealth = ok;
    try {
      chrome.runtime.sendMessage({ type: 'health', ok, reason }).catch(() => {});
    } catch { /* extension reloaded; this script is orphaned */ }
  }

  function resetTracking() {
    lastTime = video ? video.currentTime : 0;
    watchedUrl = location.href;
  }

  // Shorts loop instead of ending, so a jump from the last second back to the start counts as "finished".
  function onTimeUpdate() {
    const t = video.currentTime;
    const d = video.duration;
    if (location.href !== watchedUrl) {
      resetTracking();
      return;
    }
    if (enabled && !advancing && d > 2 && isFinite(d) && lastTime >= d - 1 && t < 1) {
      advance();
    }
    lastTime = t;
  }

  function onEnded() {
    if (enabled && !advancing) advance();
  }

  function attach(v) {
    video = v;
    resetTracking();
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('ended', onEnded);
    v.addEventListener('loadstart', resetTracking);
  }

  function detach() {
    if (!video) return;
    video.removeEventListener('timeupdate', onTimeUpdate);
    video.removeEventListener('ended', onEnded);
    video.removeEventListener('loadstart', resetTracking);
    video = null;
  }

  function waitForUrlChange(from, timeout) {
    return new Promise(resolve => {
      const started = Date.now();
      const timer = setInterval(() => {
        if (location.href !== from) {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() - started > timeout) {
          clearInterval(timer);
          resolve(false);
        }
      }, 100);
    });
  }

  const strategies = [
    () => {
      const btn = query(selectors.nextButton);
      if (!btn) return false;
      btn.click();
      return true;
    },
    () => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40, bubbles: true
      }));
      return true;
    },
    () => {
      const box = query(selectors.scrollContainer);
      if (!box) return false;
      box.scrollBy({ top: box.clientHeight, behavior: 'smooth' });
      return true;
    }
  ];

  async function advance() {
    advancing = true;
    const from = location.href;
    try {
      for (const run of strategies) {
        if (!run()) continue;
        if (await waitForUrlChange(from, ADVANCE_TIMEOUT_MS)) {
          report(true);
          return;
        }
      }
      report(false, 'advance_failed');
    } finally {
      resetTracking();
      advancing = false;
    }
  }

  setInterval(() => {
    if (!isShorts()) {
      detach();
      shortsSince = 0;
      return;
    }
    if (!shortsSince) shortsSince = Date.now();

    const v = query(selectors.activeVideo);
    if (v !== video) {
      detach();
      if (v) attach(v);
    }
    if (!v && Date.now() - shortsSince > VIDEO_MISSING_MS) {
      report(false, 'video_not_found');
    }
  }, POLL_MS);
})();
