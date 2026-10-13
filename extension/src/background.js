/* global YSS */
importScripts('defaults.js');

const REFRESH_ALARM = 'refresh-remote-config';
const MAX_SELECTORS = 10;
const MAX_SELECTOR_LENGTH = 200;

chrome.runtime.onInstalled.addListener(async () => {
  const { settings = {} } = await chrome.storage.local.get('settings');
  // v1.0 had a single `enabled` switch for YouTube only; carry it over to the YouTube toggle.
  const sites = { ...YSS.SETTINGS.sites, ...settings.sites };
  if (!settings.sites && settings.enabled === false) sites.youtube = false;
  await chrome.storage.local.set({ settings: { sites } });
  // Drop v1.0 storage shapes (flat selectors, single health record).
  await chrome.storage.local.remove(['remoteSelectors', 'health']);
  chrome.alarms.create(REFRESH_ALARM, { periodInMinutes: 360 });
  refreshRemoteConfig();
});

chrome.runtime.onStartup.addListener(refreshRemoteConfig);

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === REFRESH_ALARM) refreshRemoteConfig();
});

chrome.runtime.onMessage.addListener(msg => {
  if (msg?.type === 'health' && YSS.SITES[msg.site]) {
    setHealth(msg.site, msg.ok, msg.reason);
  } else if (msg?.type === 'refresh-config') {
    refreshRemoteConfig();
  }
});

async function setHealth(site, ok, reason = '') {
  const { health } = await chrome.storage.local.get('health');
  const next = { ...health, [site]: { ok, reason, at: Date.now() } };
  await chrome.storage.local.set({ health: next });
  const broken = Object.values(next).some(h => !h.ok);
  await chrome.action.setBadgeBackgroundColor({ color: '#d93025' });
  await chrome.action.setBadgeText({ text: broken ? '!' : '' });
}

async function refreshRemoteConfig() {
  try {
    const res = await fetch(YSS.REMOTE_CONFIG_URL, { cache: 'no-store' });
    if (!res.ok) return;
    const config = await res.json();
    const remoteSites = {};
    for (const id of Object.keys(YSS.SITES)) {
      // `selectors` is the v1.0 format (YouTube only) and stays in the file for older installs.
      const input = config.sites?.[id]?.selectors ?? (id === 'youtube' ? config.selectors : null);
      remoteSites[id] = sanitizeSelectors(input);
    }
    await chrome.storage.local.set({
      remoteSites,
      notice: typeof config.notice === 'string' ? config.notice.slice(0, 300) : '',
      remoteFetchedAt: Date.now()
    });
  } catch {
    // Offline or repo not configured: built-in selectors keep working.
  }
}

function sanitizeSelectors(input) {
  const out = {};
  if (!input || typeof input !== 'object') return out;
  for (const key of YSS.SELECTOR_KEYS) {
    const list = input[key];
    if (!Array.isArray(list)) continue;
    const clean = list
      .filter(s => typeof s === 'string' && s.length > 0 && s.length <= MAX_SELECTOR_LENGTH)
      .slice(0, MAX_SELECTORS);
    if (clean.length) out[key] = clean;
  }
  return out;
}
