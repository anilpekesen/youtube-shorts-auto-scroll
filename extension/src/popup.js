/* global YSS */
const t = key => chrome.i18n.getMessage(key) || key;

for (const el of document.querySelectorAll('[data-i18n]')) {
  el.textContent = t(el.dataset.i18n);
}

const enabledInput = document.getElementById('enabled');
const statusEl = document.getElementById('status');
const noticeEl = document.getElementById('notice');
const addressEl = document.getElementById('address');
const copyBtn = document.getElementById('copy');
const qrToggle = document.getElementById('qr-toggle');
const qrEl = document.getElementById('qr');

document.getElementById('coin').textContent = YSS.DONATION.coin;
document.getElementById('network').textContent = YSS.DONATION.network;
addressEl.textContent = YSS.DONATION.address;
copyBtn.title = t('copy');
copyBtn.setAttribute('aria-label', t('copy'));

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
  await navigator.clipboard.writeText(YSS.DONATION.address);
  copyBtn.classList.add('done');
  copyBtn.title = t('copied');
  setTimeout(() => {
    copyBtn.classList.remove('done');
    copyBtn.title = t('copy');
  }, 1500);
});

qrToggle.addEventListener('click', () => {
  const open = qrEl.hidden;
  qrEl.hidden = !open;
  qrToggle.setAttribute('aria-expanded', String(open));
  qrToggle.querySelector('span').textContent = t(open ? 'hideQr' : 'showQr');
});

function renderHealth(health) {
  const text = statusEl.querySelector('span');
  if (!health) {
    text.textContent = t('statusUnknown');
    return;
  }
  statusEl.className = 'status ' + (health.ok ? 'ok' : 'bad');
  text.textContent = health.ok ? t('statusOk') : t('statusBroken');
  if (!health.ok) chrome.runtime.sendMessage({ type: 'refresh-config' });
}
