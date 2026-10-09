/* global YSS */
const t = key => chrome.i18n.getMessage(key) || key;

for (const el of document.querySelectorAll('[data-i18n]')) {
  el.textContent = t(el.dataset.i18n);
}

const enabledInput = document.getElementById('enabled');
const statusEl = document.getElementById('status');
const noticeEl = document.getElementById('notice');
const btcEl = document.getElementById('btc');
const copyBtn = document.getElementById('copy');

btcEl.textContent = YSS.BTC_ADDRESS;

chrome.storage.local.get(['settings', 'health', 'notice']).then(({ settings, health, notice }) => {
  enabledInput.checked = settings?.enabled !== false;
  renderHealth(health);
  if (notice) {
    noticeEl.textContent = notice;
    noticeEl.hidden = false;
  }
});

enabledInput.addEventListener('change', async () => {
  const { settings } = await chrome.storage.local.get('settings');
  await chrome.storage.local.set({ settings: { ...YSS.SETTINGS, ...settings, enabled: enabledInput.checked } });
});

copyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(YSS.BTC_ADDRESS);
  copyBtn.textContent = t('copied');
  setTimeout(() => { copyBtn.textContent = t('copy'); }, 1500);
});

function renderHealth(health) {
  if (!health) {
    statusEl.textContent = t('statusUnknown');
    return;
  }
  statusEl.className = 'status ' + (health.ok ? 'ok' : 'bad');
  statusEl.textContent = health.ok ? t('statusOk') : t('statusBroken');
  if (!health.ok) chrome.runtime.sendMessage({ type: 'refresh-config' });
}
