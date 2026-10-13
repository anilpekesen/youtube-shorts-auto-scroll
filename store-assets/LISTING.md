# Chrome Web Store listing

Images in this folder (upload in this order):
- English listing: `en-1-hero.png`, `en-2-popup.png`, `en-3-features.png`
- Turkish listing: `tr-1-hero.png`, `tr-2-popup.png`, `tr-3-features.png`
- Small promo tile (440x280): `promo-small-440x280.png`
- Store icon (128x128): `../extension/icons/icon128.png`

Regenerate with `npm run store-assets`.

---

## Store listing — English (default)

**Category:** Productivity → Tools (or "Entertainment")
**Language:** English

**Description:**

```
Watch YouTube Shorts, Instagram Reels and TikTok hands-free.

When a video finishes, Auto Scroll moves to the next one automatically — no more swiping or pressing the arrow key after every video.

FEATURES
• Auto-advances to the next video when the current one ends
• Works on YouTube Shorts, Instagram Reels and the TikTok feed
• Turn it on or off separately for each site from the toolbar
• Keeps working when a site changes its layout — fixes are delivered automatically
• Lightweight: runs only on youtube.com, instagram.com and tiktok.com
• 100% free, no ads, no tracking, no account

PRIVACY
This extension collects no data. Your on/off settings are stored locally in your browser.

SUPPORT
The extension is free forever. If you find it useful, an optional USDT (TRC20) donation address and QR code are shown in the popup.

Not affiliated with or endorsed by YouTube, Google, Instagram, Meta or TikTok.
```

---

## Store listing — Türkçe

**Açıklama:**

```
YouTube Shorts, Instagram Reels ve TikTok'u elini sürmeden izle.

Bir video bittiğinde Auto Scroll otomatik olarak sonrakine geçer — her videodan sonra kaydırmana ya da ok tuşuna basmana gerek kalmaz.

ÖZELLİKLER
• Video bitince otomatik olarak sonrakine geçer
• YouTube Shorts, Instagram Reels ve TikTok akışında çalışır
• Her site için araç çubuğundan ayrı ayrı aç/kapat
• Bir site tasarımını değiştirse bile çalışmaya devam eder — düzeltmeler otomatik gelir
• Hafif: sadece youtube.com, instagram.com ve tiktok.com'da çalışır
• Tamamen ücretsiz, reklam yok, takip yok, hesap yok

GİZLİLİK
Bu eklenti hiçbir veri toplamaz. Aç/kapa ayarların sadece tarayıcında saklanır.

DESTEK
Eklenti sonsuza dek ücretsiz. Beğendiysen popup'ta isteğe bağlı bir USDT (TRC20) bağış adresi ve QR kodu var.

YouTube, Google, Instagram, Meta veya TikTok ile bağlantılı değildir.
```

---

## Privacy practices tab

**Single purpose:**
```
Automatically scrolls to the next short video (YouTube Shorts, Instagram Reels, TikTok) when the current one finishes.
```

**Permission justifications:**

| Permission | Justification |
|---|---|
| `storage` | Stores the user's per-site on/off settings and the extension's health status locally. |
| `alarms` | Periodically refreshes the selector configuration so the extension keeps working when a supported site changes its page layout. |
| Host `raw.githubusercontent.com` | Downloads a public JSON file containing only CSS selectors (no code) from the extension's GitHub repository. |
| Content script on `youtube.com`, `instagram.com`, `tiktok.com` | Detects when a Short, Reel or TikTok video finishes and moves to the next one. Only active on the Shorts, Reels and TikTok feed pages. |

**Remote code:** No, I am not using remote code.
(The remote file is JSON data with CSS selectors only; no JavaScript is fetched or executed.)

**Data usage:** Check nothing — the extension does not collect any user data.
Tick all three certifications (not sold, not used for unrelated purposes, not used for creditworthiness).

**Privacy policy URL:**
```
https://github.com/anilpekesen/youtube-shorts-auto-scroll/blob/main/PRIVACY.md
```

---

## Distribution tab
- **Payments:** Free of charge
- **Visibility:** Public
- **Regions:** All regions
