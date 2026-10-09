// Generates Chrome Web Store images (1280x800 screenshots per language + 440x280 promo tile).
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, readdirSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const extDir = `${root}extension`;
const outDir = `${root}store-assets`;
mkdirSync(outDir, { recursive: true });
for (const f of readdirSync(outDir)) if (f.endsWith('.png')) unlinkSync(`${outDir}/${f}`);

const icon = `data:image/png;base64,${readFileSync(`${extDir}/icons/icon128.png`).toString('base64')}`;

const COPY = {
  en: {
    brand: 'Auto Scroll for YouTube Shorts',
    s1Title: 'Shorts that<br>scroll themselves.',
    s1Text: 'When a Short ends, the next one starts. No swiping, no arrow keys.',
    s1Points: ['Hands-free watching', 'Works on youtube.com/shorts', 'Free forever'],
    ended: 'Video ended',
    next: 'Next Short',
    s2Title: 'One switch.<br>That’s all.',
    s2Text: 'Turn auto scroll on or off from the toolbar whenever you like. A status line tells you everything is working.',
    s3Title: 'Free. Private.<br>Self-healing.',
    s3Text: 'No ads, no account, no data collection — and it fixes itself when YouTube changes.',
    cards: [
      ['shield', 'No tracking', 'Nothing leaves your browser. No account, no ads, no analytics.'],
      ['refresh', 'Keeps working', 'When YouTube changes its layout, fixes arrive automatically.'],
      ['zap', 'Lightweight', 'Runs only on youtube.com. Tiny, fast and quiet.']
    ]
  },
  tr: {
    brand: 'Auto Scroll for YouTube Shorts',
    s1Title: 'Kendi kendine<br>kayan Shorts.',
    s1Text: 'Short bitince sıradaki başlar. Kaydırmak yok, tuşa basmak yok.',
    s1Points: ['Elini sürmeden izle', 'youtube.com/shorts’ta çalışır', 'Sonsuza dek ücretsiz'],
    ended: 'Video bitti',
    next: 'Sıradaki Short',
    s2Title: 'Tek düğme.<br>Hepsi bu.',
    s2Text: 'Otomatik geçişi araç çubuğundan istediğin an aç ya da kapat. Durum satırı her şeyin çalıştığını gösterir.',
    s3Title: 'Ücretsiz. Gizli.<br>Kendini onaran.',
    s3Text: 'Reklam yok, hesap yok, veri toplama yok. YouTube değişince kendini düzeltir.',
    cards: [
      ['shield', 'Takip yok', 'Hiçbir veri tarayıcından çıkmaz. Hesap yok, reklam yok, analiz yok.'],
      ['refresh', 'Hep çalışır', 'YouTube tasarımını değiştirince düzeltme otomatik gelir.'],
      ['zap', 'Hafif', 'Sadece youtube.com’da çalışır. Küçük, hızlı, sessiz.']
    ]
  }
};

const ICONS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  down: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>'
};
const svg = (name, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=block');
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body {
    width: 1280px; height: 800px; overflow: hidden; position: relative;
    font-family: 'Inter', system-ui, sans-serif; color: #fff;
    background:
      radial-gradient(900px 600px at 85% 30%, rgba(124, 92, 255, .45), transparent 60%),
      radial-gradient(700px 500px at 0% 100%, rgba(255, 92, 138, .18), transparent 60%),
      linear-gradient(160deg, #15102e 0%, #0c0920 100%);
  }
  body::after {
    content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .5;
    background-image: radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px);
    background-size: 22px 22px;
    mask-image: linear-gradient(90deg, transparent, #000 60%);
  }
  .brand { position: absolute; top: 56px; left: 96px; display: flex; align-items: center; gap: 12px;
           font-weight: 600; font-size: 17px; color: rgba(255,255,255,.75); }
  .brand img { width: 32px; height: 32px; }
  .copy { position: absolute; left: 96px; top: 50%; transform: translateY(-50%); width: 560px; }
  h1 { font-size: 68px; line-height: 1.02; letter-spacing: -0.035em; font-weight: 800; margin: 0 0 24px; }
  h1 em { font-style: normal; background: linear-gradient(90deg, #b9a8ff, #ff8fb1);
          -webkit-background-clip: text; background-clip: text; color: transparent; }
  h1 .dot { color: #ff8fb1; font-weight: inherit; }
  .lead { font-size: 22px; line-height: 1.5; color: rgba(255,255,255,.72); margin: 0; max-width: 500px; font-weight: 500; }
  .points { list-style: none; padding: 0; margin: 36px 0 0; display: grid; gap: 14px; }
  .points li { display: flex; align-items: center; gap: 12px; font-size: 18px; font-weight: 600; color: rgba(255,255,255,.9); }
  .tick { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
          background: rgba(124, 92, 255, .25); color: #c7b9ff; }
`;

// Gradient-clipped text renders a gap before trailing punctuation, so keep it outside <em>.
const accentTitle = t => t.replace(/<br>(.*?)([.!]?)$/, '<br><em>$1</em><b class="dot">$2</b>');

function screen1(c) {
  return `<style>${BASE_CSS}
    .stage { position: absolute; right: 150px; top: 50%; transform: translateY(-50%); width: 340px; height: 640px; }
    .phone { position: absolute; inset: 0; border-radius: 46px; padding: 10px; background: #050410;
             box-shadow: 0 0 0 1.5px rgba(255,255,255,.12), 0 40px 100px rgba(0,0,0,.55), 0 0 120px rgba(124,92,255,.35); }
    .screen { position: relative; width: 100%; height: 100%; border-radius: 37px; overflow: hidden; background: #000; }
    .card { position: absolute; left: 0; width: 100%; height: 100%; border-radius: 26px; overflow: hidden; }
    .card.a { top: -46%; background: linear-gradient(165deg, #ffb36b 0%, #ff4d7d 45%, #7b2fff 100%); }
    .card.b { top: 56%; background: linear-gradient(165deg, #2ee6c8 0%, #2a7bff 55%, #2a2a9e 100%); }
    .sun { position: absolute; border-radius: 50%; background: rgba(255,255,255,.85); }
    .card.a .sun { width: 120px; height: 120px; left: 40px; top: 230px; box-shadow: 0 0 80px rgba(255,230,180,.9); }
    .card.b .sun { width: 90px; height: 90px; right: 50px; top: 60px; background: rgba(255,255,255,.7); }
    .hill { position: absolute; left: -20%; width: 140%; height: 50%; border-radius: 50% 50% 0 0; }
    .card.a .hill { top: 62%; background: rgba(40, 0, 80, .45); }
    .card.b .hill { top: 40%; background: rgba(0, 20, 70, .4); }
    .shade { position: absolute; inset: auto 0 0 0; height: 45%; background: linear-gradient(transparent, rgba(0,0,0,.7)); }
    .meta { position: absolute; left: 20px; right: 70px; bottom: 34px; }
    .who { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .avatar { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,.85); }
    .bar { height: 10px; border-radius: 5px; background: rgba(255,255,255,.85); }
    .bar.dim { background: rgba(255,255,255,.45); margin-top: 8px; }
    .actions { position: absolute; right: 14px; bottom: 40px; display: grid; gap: 16px; }
    .actions span { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.18); display: block; }
    .progress { position: absolute; left: 0; right: 0; bottom: 0; height: 5px; background: linear-gradient(90deg, #ff8fb1, #fff); }
    .chip { position: absolute; display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: 999px;
            font-weight: 700; font-size: 16px; white-space: nowrap; box-shadow: 0 16px 40px rgba(0,0,0,.4); }
    .chip.ended { left: -120px; top: 120px; background: rgba(255,255,255,.95); color: #1b1240; }
    .chip.ended i { width: 24px; height: 24px; border-radius: 50%; background: #ff4d7d; color: #fff; display: grid; place-items: center; }
    .chip.next { right: -110px; top: 330px; background: #7c5cff; color: #fff; }
    .trail { position: absolute; right: -40px; top: 150px; height: 170px; width: 2px;
             background: linear-gradient(rgba(124,92,255,0), #9a85ff); }
  </style>
  <div class="brand"><img src="${icon}">${c.brand}</div>
  <div class="copy">
    <h1>${accentTitle(c.s1Title)}</h1>
    <p class="lead">${c.s1Text}</p>
    <ul class="points">${c.s1Points.map(p => `<li><span class="tick">${svg('check', 16)}</span>${p}</li>`).join('')}</ul>
  </div>
  <div class="stage">
    <div class="phone"><div class="screen">
      ${['a', 'b'].map(k => `<div class="card ${k}"><div class="sun"></div><div class="hill"></div><div class="shade"></div>
        <div class="meta"><div class="who"><div class="avatar"></div><div class="bar" style="width:90px"></div></div>
        <div class="bar" style="width:85%"></div><div class="bar dim" style="width:60%"></div></div>
        <div class="actions"><span></span><span></span><span></span></div>
        ${k === 'a' ? '<div class="progress"></div>' : ''}</div>`).join('')}
    </div></div>
    <div class="chip ended"><i>${svg('check', 14)}</i>${c.ended}</div>
    <div class="trail"></div>
    <div class="chip next">${svg('down', 18)}${c.next}</div>
  </div>`;
}

function screen2(c, popup) {
  return `<style>${BASE_CSS}
    .copy { width: 520px; }
    .popup-wrap { position: absolute; right: 120px; top: 50%; transform: translateY(-50%); }
    .popup-wrap > img { display: block; width: 450px; border-radius: 22px;
      box-shadow: 0 0 0 1px rgba(255,255,255,.1), 0 50px 120px rgba(0,0,0,.6), 0 0 140px rgba(124,92,255,.4); }
    .pin { position: absolute; top: -64px; right: 24px; display: flex; align-items: center; gap: 10px;
           padding: 10px 14px; border-radius: 14px; background: #2a2150; border: 1px solid rgba(255,255,255,.12); }
    .pin img { width: 26px; height: 26px; border-radius: 6px; }
    .pin::after { content: ''; position: absolute; right: 30px; bottom: -9px; width: 16px; height: 16px; transform: rotate(45deg);
                  background: #2a2150; border-right: 1px solid rgba(255,255,255,.12); border-bottom: 1px solid rgba(255,255,255,.12); }
    .dots { display: flex; gap: 6px; }
    .dots span { width: 22px; height: 22px; border-radius: 6px; background: rgba(255,255,255,.12); }
  </style>
  <div class="brand"><img src="${icon}">${c.brand}</div>
  <div class="copy">
    <h1>${accentTitle(c.s2Title)}</h1>
    <p class="lead">${c.s2Text}</p>
  </div>
  <div class="popup-wrap">
    <div class="pin"><div class="dots"><span></span><span></span></div><img src="${icon}"></div>
    <img src="data:image/png;base64,${popup}">
  </div>`;
}

function screen3(c) {
  return `<style>${BASE_CSS}
    .copy { top: 140px; transform: none; width: 900px; }
    .copy .lead { max-width: 640px; }
    h1 { font-size: 64px; }
    .cards { position: absolute; left: 96px; right: 96px; bottom: 96px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .card { padding: 32px; border-radius: 24px; background: linear-gradient(180deg, rgba(255,255,255,.09), rgba(255,255,255,.04));
            border: 1px solid rgba(255,255,255,.12); }
    .ic { width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; margin-bottom: 22px;
          background: linear-gradient(135deg, #7c5cff, #ff6f9a); color: #fff; }
    .card h2 { font-size: 24px; margin: 0 0 10px; letter-spacing: -0.01em; }
    .card p { margin: 0; font-size: 17px; line-height: 1.5; color: rgba(255,255,255,.68); font-weight: 500; }
  </style>
  <div class="brand"><img src="${icon}">${c.brand}</div>
  <div class="copy"><h1>${accentTitle(c.s3Title)}</h1><p class="lead">${c.s3Text}</p></div>
  <div class="cards">${c.cards.map(([ic, h, p]) =>
    `<div class="card"><div class="ic">${svg(ic, 26)}</div><h2>${h}</h2><p>${p}</p></div>`).join('')}</div>`;
}

function promoTile() {
  return `<style>${BASE_CSS}
    body { width: 440px; height: 280px; }
    body::after { display: none; }
    .wrap { position: absolute; inset: 0; display: flex; align-items: center; gap: 22px; padding: 0 36px; }
    .wrap img { width: 92px; height: 92px; filter: drop-shadow(0 12px 30px rgba(124,92,255,.6)); }
    h1 { font-size: 30px; margin: 0; line-height: 1.08; letter-spacing: -0.02em; }
    p { margin: 8px 0 0; font-size: 15px; color: rgba(255,255,255,.72); font-weight: 600; }
  </style>
  <div class="wrap"><img src="${icon}"><div><h1>Auto Scroll<br><em>for Shorts</em></h1><p>Hands-free YouTube Shorts</p></div></div>`;
}

const context = await chromium.launchPersistentContext('', {
  channel: 'chromium',
  headless: true,
  viewport: { width: 1280, height: 800 },
  args: [`--disable-extensions-except=${extDir}`, `--load-extension=${extDir}`]
});
const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
const extId = new URL(worker.url()).host;
await worker.evaluate(() => chrome.storage.local.set({ health: { ok: true, reason: '', at: Date.now() } }));

async function renderPopup(lang) {
  const page = await context.newPage();
  await page.setViewportSize({ width: 600, height: 700 });
  await page.goto(`chrome-extension://${extId}/src/popup.html`);
  await page.waitForTimeout(400);
  // chrome.i18n follows the OS language on macOS, so apply the target locale's strings directly.
  const messages = JSON.parse(readFileSync(`${extDir}/_locales/${lang}/messages.json`, 'utf8'));
  await page.evaluate(msgs => {
    for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = msgs[el.dataset.i18n]?.message ?? el.textContent;
    const status = document.getElementById('status');
    status.className = 'status ok';
    status.querySelector('span').textContent = msgs.statusOk.message;
    document.body.style.zoom = 1.5; // crisp when shown large
  }, messages);
  const shot = (await page.locator('body').screenshot()).toString('base64');
  await page.close();
  return shot;
}

async function shoot(html, file, size = { width: 1280, height: 800 }) {
  const page = await context.newPage();
  await page.setViewportSize(size);
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${outDir}/${file}` });
  await page.close();
}

for (const [lang, c] of Object.entries(COPY)) {
  const popup = await renderPopup(lang);
  await shoot(screen1(c), `${lang}-1-hero.png`);
  await shoot(screen2(c, popup), `${lang}-2-popup.png`);
  await shoot(screen3(c), `${lang}-3-features.png`);
}
await shoot(promoTile(), 'promo-small-440x280.png', { width: 440, height: 280 });

await context.close();
console.log(`written to ${outDir}`);
