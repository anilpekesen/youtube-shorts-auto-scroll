// Loads the extension in Chromium, opens YouTube Shorts and checks that it auto-advances.
// Exit codes: 0 = works, 1 = broken (YouTube changed), 2 = inconclusive (bot check / network).
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const extDir = fileURLToPath(new URL('../extension', import.meta.url));
const remoteConfig = JSON.parse(readFileSync(new URL('../remote-config.json', import.meta.url), 'utf8'));
const YSS = new Function(readFileSync(`${extDir}/src/defaults.js`, 'utf8') + '; return YSS;')();
const selectors = { ...YSS.SELECTORS, ...remoteConfig.selectors };

const report = { ok: false, reason: '', url: '', selectors: {} };

function finish(code) {
  writeFileSync('monitor-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(code);
}

const context = await chromium.launchPersistentContext('', {
  channel: 'chromium',
  headless: process.env.HEADED !== '1',
  locale: 'en-US',
  args: [
    `--disable-extensions-except=${extDir}`,
    `--load-extension=${extDir}`,
    '--autoplay-policy=no-user-gesture-required',
    '--mute-audio'
  ]
});

try {
  const page = await context.newPage();
  await page.goto('https://www.youtube.com/shorts', { waitUntil: 'domcontentloaded', timeout: 60000 });

  const consent = page.locator('button:has-text("Accept all"), button:has-text("Reject all")').first();
  if (await consent.isVisible({ timeout: 5000 }).catch(() => false)) await consent.click();

  try {
    await page.waitForURL(/\/shorts\/[\w-]+/, { timeout: 30000 });
  } catch {
    const body = await page.textContent('body').catch(() => '');
    report.url = page.url();
    report.reason = /not a bot|unusual traffic|captcha/i.test(body) ? 'bot_check' : 'shorts_url_not_reached';
    finish(report.reason === 'bot_check' ? 2 : 1);
  }

  await page.waitForTimeout(4000);
  report.selectors = await page.evaluate(groups => Object.fromEntries(
    Object.entries(groups).map(([name, list]) => [name, list.filter(s => {
      try { return !!document.querySelector(s); } catch { return false; }
    })])
  ), selectors);

  if (!report.selectors.activeVideo.length) {
    report.url = page.url();
    report.reason = 'video_not_found';
    finish(1);
  }

  // YouTube often refuses playback to datacenter IPs (GitHub runners). The DOM is still testable,
  // so in that case simulate the end of the video instead of playing to the end.
  const playable = await page.waitForFunction(list => list.some(s => {
    const v = document.querySelector(s);
    return v && v.duration > 0;
  }), selectors.activeVideo, { timeout: 20000 }).then(() => true, () => false);
  report.mode = playable ? 'playback' : 'simulated_end';
  if (!playable) {
    report.playerError = await page.evaluate(() =>
      document.querySelector('.ytp-error, #shorts-player .ytp-error-content')?.innerText?.slice(0, 200) || '');
  }

  const before = page.url();
  await page.evaluate(([list, play]) => {
    const v = list.map(s => document.querySelector(s)).find(Boolean);
    if (play) {
      v.currentTime = Math.max(0, v.duration - 1.5);
      v.play();
    } else {
      v.dispatchEvent(new Event('ended'));
    }
  }, [selectors.activeVideo, playable]);

  const advanced = await page.waitForFunction(u => location.href !== u, before, { timeout: 25000 })
    .then(() => true, () => false);

  report.url = page.url();
  report.ok = advanced;
  report.reason = advanced ? '' : 'did_not_advance';
  finish(advanced ? 0 : 1);
} catch (err) {
  report.reason = `error: ${err.message}`;
  finish(2);
} finally {
  await context.close().catch(() => {});
}
