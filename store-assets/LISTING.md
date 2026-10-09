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
Watch YouTube Shorts hands-free.

When a Short finishes, Auto Scroll for YouTube Shorts moves to the next one automatically — no more swiping or pressing the arrow key after every video.

FEATURES
• Auto-advances to the next Short when the current one ends
• One-click on/off from the toolbar
• Works with YouTube's current layout and keeps working when it changes — fixes are delivered automatically
• Lightweight: runs only on youtube.com
• 100% free, no ads, no tracking, no account

PRIVACY
This extension collects no data. Your on/off setting is stored locally in your browser.

SUPPORT
The extension is free forever. If you find it useful, an optional USDT (TRC20) donation address and QR code are shown in the popup.

Not affiliated with or endorsed by YouTube or Google.
```

---

## Store listing — Türkçe

**Açıklama:**

```
YouTube Shorts'u elini sürmeden izle.

Bir Short bittiğinde Auto Scroll for YouTube Shorts otomatik olarak sonrakine geçer — her videodan sonra kaydırmana ya da ok tuşuna basmana gerek kalmaz.

ÖZELLİKLER
• Short bitince otomatik olarak sonrakine geçer
• Araç çubuğundan tek tıkla aç/kapat
• YouTube'un mevcut tasarımıyla çalışır, YouTube değişse bile çalışmaya devam eder — düzeltmeler otomatik gelir
• Hafif: sadece youtube.com'da çalışır
• Tamamen ücretsiz, reklam yok, takip yok, hesap yok

GİZLİLİK
Bu eklenti hiçbir veri toplamaz. Aç/kapa ayarın sadece tarayıcında saklanır.

DESTEK
Eklenti sonsuza dek ücretsiz. Beğendiysen popup'ta isteğe bağlı bir USDT (TRC20) bağış adresi ve QR kodu var.

YouTube veya Google ile bağlantılı değildir.
```

---

## Privacy practices tab

**Single purpose:**
```
Automatically scrolls to the next YouTube Short when the current one finishes.
```

**Permission justifications:**

| Permission | Justification |
|---|---|
| `storage` | Stores the user's on/off setting and the extension's health status locally. |
| `alarms` | Periodically refreshes the selector configuration so the extension keeps working when YouTube changes its page layout. |
| Host `raw.githubusercontent.com` | Downloads a public JSON file containing only CSS selectors (no code) from the extension's GitHub repository. |
| Content script on `youtube.com` | Detects when a Short finishes and moves to the next one. |

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
