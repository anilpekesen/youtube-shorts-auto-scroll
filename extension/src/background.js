/* global YSS */
importScripts('defaults.js');

const REFRESH_ALARM = 'refresh-remote-config';
const MAX_SELECTORS = 10;
const MAX_SELECTOR_LENGTH = 200;

chrome.runtime.onInstalled.addListener(async () => {
  const { settings } = await chrome.storage.local.get('settings');
  await chrome.storage.local.set({ settings: { ...YSS.SETTINGS, ...settings } });
  chrome.alarms.create(REFRESH_ALARM, { periodInMinutes: 360 });
  refreshRemoteConfig();
});

chrome.runtime.onStartup.addListener(refreshRemoteConfig);

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === REFRESH_ALARM) refreshRemoteConfig();
});

chrome.runtime.onMessage.addListener(msg => {
  if (msg?.type === 'health') {
    setHealth(msg.ok, msg.reason);
  } else if (msg?.type === 'refresh-config') {
    refreshRemoteConfig();
  }
});

async function setHealth(ok, reason = '') {
  await chrome.storage.local.set({ health: { ok, reason, at: Date.now() } });
  await chrome.action.setBadgeBackgroundColor({ color: '#d93025' });
  await chrome.action.setBadgeText({ text: ok ? '' : '!' });
}

async function refreshRemoteConfig() {
  try {
    const res = await fetch(YSS.REMOTE_CONFIG_URL, { cache: 'no-store' });
    if (!res.ok) return;
    const config = await res.json();
    await chrome.storage.local.set({
      remoteSelectors: sanitizeSelectors(config.selectors),
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
  for (const key of Object.keys(YSS.SELECTORS)) {
    const list = input[key];
    if (!Array.isArray(list)) continue;
    const clean = list
      .filter(s => typeof s === 'string' && s.length > 0 && s.length <= MAX_SELECTOR_LENGTH)
      .slice(0, MAX_SELECTORS);
    if (clean.length) out[key] = clean;
  }
  return out;
}
