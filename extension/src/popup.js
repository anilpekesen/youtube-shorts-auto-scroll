/* global YSS */
const t = key => chrome.i18n.getMessage(key) || key;

for (const el of document.querySelectorAll('[data-i18n]')) {
  el.textContent = t(el.dataset.i18n);
}

const sitesEl = document.getElementById('sites');
const rowTemplate = document.getElementById('site-row');
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
  for (const [id, site] of Object.entries(YSS.SITES)) {
    sitesEl.append(renderSite(id, site, settings?.sites?.[id] !== false, health?.[id]));
  }
  if (Object.values(health || {}).some(h => !h.ok)) chrome.runtime.sendMessage({ type: 'refresh-config' });
  if (notice) {
    noticeEl.textContent = notice;
    noticeEl.hidden = false;
  }
});

function renderSite(id, site, enabled, health) {
  const row = rowTemplate.content.firstElementChild.cloneNode(true);
  const input = row.querySelector('input');
  const status = row.querySelector('.status');
  row.querySelector('strong').textContent = site.name;
  input.checked = enabled;
  input.addEventListener('change', () => setSiteEnabled(id, input.checked));
  if (health) status.classList.add(health.ok ? 'ok' : 'bad');
  status.querySelector('span').textContent =
    !health ? t('statusUnknown') : health.ok ? t('statusOk') : t('statusBroken');
  return row;
}

async function setSiteEnabled(id, on) {
  const { settings } = await chrome.storage.local.get('settings');
  const sites = { ...YSS.SETTINGS.sites, ...settings?.sites, [id]: on };
  await chrome.storage.local.set({ settings: { ...settings, sites } });
}

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
