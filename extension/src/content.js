/* global YSS */
(() => {
  const POLL_MS = 500;
  const ADVANCE_TIMEOUT_MS = 2500;
  const VIDEO_MISSING_MS = 10000;
  // A single miss is often a one-off (ad, slow network); only repeated misses mean the page layout changed.
  const FAILURES_BEFORE_REPORT = 2;

  const siteId = Object.keys(YSS.SITES).find(id => YSS.SITES[id].hosts.includes(location.hostname));
  if (!siteId) return;
  const site = YSS.SITES[siteId];
  const pathRe = new RegExp(site.path);

  let selectors = site.selectors;
  let enabled = YSS.SETTINGS.sites[siteId];

  let video = null;
  let lastTime = 0;
  let watchedUrl = '';
  let advancing = false;
  let activeSince = 0;
  let lastHealth = null;
  let lastReason = '';
  let failures = 0;

  chrome.storage.local.get(['settings', 'remoteSites']).then(applyStorage);
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    applyStorage({
      settings: changes.settings?.newValue,
      remoteSites: changes.remoteSites?.newValue
    });
  });

  function applyStorage({ settings, remoteSites }) {
    if (settings) enabled = settings.sites?.[siteId] !== false;
    if (remoteSites) selectors = { ...site.selectors, ...remoteSites[siteId] };
  }

  const isActivePage = () => pathRe.test(location.pathname);

  function query(list) {
    for (const sel of list) {
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch { /* invalid selector from remote config */ }
    }
    return null;
  }

  function visibleArea(el) {
    const r = el.getBoundingClientRect();
    const w = Math.min(r.right, innerWidth) - Math.max(r.left, 0);
    const h = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
    return w > 0 && h > 0 ? w * h : 0;
  }

  // Feeds keep neighbouring videos in the DOM, so the most visible match is the one being watched.
  function findVideo() {
    for (const sel of selectors.activeVideo) {
      let best = null;
      let bestArea = 0;
      try {
        for (const el of document.querySelectorAll(sel)) {
          const area = visibleArea(el);
          if (area > bestArea) [best, bestArea] = [el, area];
        }
      } catch { /* invalid selector from remote config */ }
      if (best) return best;
    }
    return null;
  }

  function scrollContainer() {
    const box = query(selectors.scrollContainer);
    if (box) return box;
    for (let el = video?.parentElement; el; el = el.parentElement) {
      if (el.scrollHeight > el.clientHeight + 10 && /(auto|scroll)/.test(getComputedStyle(el).overflowY)) return el;
    }
    return null;
  }

  function report(ok, reason = '') {
    if (ok === lastHealth && reason === lastReason) return;
    lastHealth = ok;
    lastReason = reason;
    try {
      chrome.runtime.sendMessage({ type: 'health', site: siteId, ok, reason }).catch(() => {});
    } catch { /* extension reloaded; this script is orphaned */ }
  }

  function resetTracking() {
    lastTime = video ? video.currentTime : 0;
    watchedUrl = location.href;
  }

  // Videos loop instead of ending, so a jump from the last second back to the start counts as "finished".
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

  // TikTok swaps videos without changing the URL, so a different active video also counts as moved on.
  function position() {
    const v = findVideo();
    return { href: location.href, video: v, src: v?.currentSrc };
  }

  function hasMoved(from) {
    const now = position();
    return now.href !== from.href || (now.video && (now.video !== from.video || now.src !== from.src));
  }

  function waitForMove(from, timeout) {
    return new Promise(resolve => {
      const started = Date.now();
      const timer = setInterval(() => {
        if (hasMoved(from)) {
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
    // Instant rather than smooth: smooth scrolling stalls when the tab is in the background.
    () => {
      const box = scrollContainer();
      if (!box) return false;
      box.scrollBy({ top: box.clientHeight, behavior: 'instant' });
      return true;
    }
  ];

  async function advance() {
    advancing = true;
    const from = position();
    try {
      for (const run of strategies) {
        if (!run()) continue;
        if (await waitForMove(from, ADVANCE_TIMEOUT_MS)) {
          failures = 0;
          report(true);
          return;
        }
      }
      // Background tabs throttle timers and scrolling, so a miss there says nothing about the layout.
      if (!document.hidden && ++failures >= FAILURES_BEFORE_REPORT) report(false, 'advance_failed');
    } finally {
      resetTracking();
      advancing = false;
    }
  }

  setInterval(() => {
    if (!isActivePage()) {
      detach();
      activeSince = 0;
      return;
    }
    // Sites don't build the player in a background tab, so only count time the tab is visible.
    if (document.hidden) activeSince = 0;
    else if (!activeSince) activeSince = Date.now();

    const v = findVideo();
    if (v !== video) {
      detach();
      if (v) attach(v);
    }
    if (v && lastReason === 'video_not_found') {
      report(true);
    } else if (!v && activeSince && Date.now() - activeSince > VIDEO_MISSING_MS) {
      report(false, 'video_not_found');
    }
  }, POLL_MS);
})();
