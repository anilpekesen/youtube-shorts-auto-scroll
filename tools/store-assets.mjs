// Generates Chrome Web Store images: a 1280x800 screenshot and a 440x280 small promo tile.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const extDir = `${root}extension`;
const outDir = `${root}store-assets`;
mkdirSync(outDir, { recursive: true });

const iconData = readFileSync(`${extDir}/icons/icon128.png`).toString('base64');

const CAPTIONS = {
  en: { title: 'Shorts scroll themselves.', text: 'When a Short ends, the next one starts automatically. Free, no tracking.' },
  tr: { title: 'Shorts kendi kendine kaysın.', text: 'Short bitince sıradaki otomatik başlar. Ücretsiz, takip yok.' }
};

for (const [lang, caption] of Object.entries(CAPTIONS)) {
const context = await chromium.launchPersistentContext('', {
  channel: 'chromium',
  headless: true,
  locale: lang,
  viewport: { width: 1280, height: 800 },
  args: [
    `--disable-extensions-except=${extDir}`,
    `--load-extension=${extDir}`,
    '--autoplay-policy=no-user-gesture-required',
    '--mute-audio',
    `--lang=${lang}`
  ]
});

const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
const extId = new URL(worker.url()).host;

// Shorts page in the background of the screenshot.
const yt = await context.newPage();
await yt.goto('https://www.youtube.com/shorts', { waitUntil: 'domcontentloaded' });
const consent = yt.locator('button:has-text("Accept all"), button:has-text("Reject all")').first();
if (await consent.isVisible({ timeout: 5000 }).catch(() => false)) await consent.click();
await yt.waitForURL(/\/shorts\/[\w-]+/, { timeout: 30000 });
await yt.waitForTimeout(6000);
const shortsShot = (await yt.screenshot()).toString('base64');

// Popup as rendered by the extension, with a healthy status.
await worker.evaluate(() => chrome.storage.local.set({ health: { ok: true, reason: '', at: Date.now() } }));
const popup = await context.newPage();
await popup.setViewportSize({ width: 300, height: 400 });
await popup.goto(`chrome-extension://${extId}/src/popup.html`);
await popup.waitForTimeout(500);
// chrome.i18n follows the OS language on macOS, so apply the target locale's strings directly.
const messages = JSON.parse(readFileSync(`${extDir}/_locales/${lang}/messages.json`, 'utf8'));
await popup.evaluate(msgs => {
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = msgs[el.dataset.i18n]?.message ?? el.textContent;
  const status = document.getElementById('status');
  status.textContent = msgs.statusOk.message;
}, messages);
const popupShot = (await popup.locator('body').screenshot()).toString('base64');

const page = await context.newPage();

await page.setViewportSize({ width: 1280, height: 800 });
await page.setContent(`
  <style>
    body { margin: 0; width: 1280px; height: 800px; position: relative; overflow: hidden; font-family: system-ui, sans-serif; }
    .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(8px) brightness(.4); transform: scale(1.05); }
    .popup { position: absolute; top: 50%; right: 70px; transform: translateY(-50%) scale(1.25); transform-origin: right center; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,.5); }
    .caption { position: absolute; left: 70px; top: 50%; transform: translateY(-50%); color: #fff; max-width: 620px; text-shadow: 0 2px 12px rgba(0,0,0,.6); }
    .caption h1 { font-size: 56px; margin: 0 0 12px; line-height: 1.1; }
    .caption p { font-size: 22px; margin: 0; opacity: .9; }
  </style>
  <img class="bg" src="data:image/png;base64,${shortsShot}">
  <img class="popup" src="data:image/png;base64,${popupShot}">
  <div class="caption">
    <h1>${caption.title}</h1>
    <p>${caption.text}</p>
  </div>`);
await page.screenshot({ path: `${outDir}/screenshot-${lang}-1280x800.png` });

if (lang === 'en') {

await page.setViewportSize({ width: 440, height: 280 });
await page.setContent(`
  <style>
    html { background: #4b3cc9; }
    body { margin: 0; width: 440px; height: 280px; overflow: hidden; display: flex; align-items: center; justify-content: center; gap: 20px;
           background: linear-gradient(135deg, #6c5ce7, #3d2fb0); color: #fff; font-family: system-ui, sans-serif; }
    h1 { font-size: 30px; line-height: 1.1; margin: 0; }
    p { margin: 8px 0 0; font-size: 15px; opacity: .85; }
  </style>
  <img src="data:image/png;base64,${iconData}" width="96" height="96">
  <div><h1>Auto Scroll<br>for Shorts</h1><p>Hands-free Shorts</p></div>`);
await page.screenshot({ path: `${outDir}/promo-small-440x280.png` });
}

await context.close();
}
console.log(`written to ${outDir}`);
