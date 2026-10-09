// Renders the donation address as a static QR code SVG bundled with the extension.
import { readFileSync, writeFileSync } from 'node:fs';
import QRCode from 'qrcode';

const defaults = readFileSync(new URL('../extension/src/defaults.js', import.meta.url), 'utf8');
const YSS = new Function(defaults + '; return YSS;')();

const svg = await QRCode.toString(YSS.DONATION.address, {
  type: 'svg',
  margin: 1,
  errorCorrectionLevel: 'M',
  color: { dark: '#1b1240', light: '#ffffff' }
});
writeFileSync(new URL('../extension/src/donate-qr.svg', import.meta.url), svg);
console.log(`QR written for ${YSS.DONATION.address}`);
