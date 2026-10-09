# Auto Scroll for YouTube Shorts

Shorts videosu bitince otomatik olarak sonrakine geçen, ücretsiz Chrome eklentisi (Manifest V3).

## Yapı

```
extension/              ← Store'a yüklenen klasör (zip'lenen kısım)
  manifest.json
  src/defaults.js       ← seçiciler, USDT bağış adresi, uzak config URL'si
  src/content.js        ← video bitişini algılar, sonrakine geçer, sağlık durumu bildirir
  src/background.js     ← uzak config'i 6 saatte bir çeker, bozulunca ikonda "!" gösterir
  src/popup.*           ← aç/kapa, durum, USDT (TRC20) bağış
remote-config.json      ← GitHub'dan canlı okunan seçiciler (Store incelemesi olmadan düzeltme)
tests/monitor.mjs       ← gerçek YouTube'da uçtan uca test
.github/workflows/
  monitor.yml           ← 6 saatte bir test; bozulursa issue açar (GitHub e-posta atar)
  release.yml           ← v* tag'i push'layınca Chrome Web Store'a yükler
```

## Nasıl çalışır

Shorts videoları bitmez, başa sarar. Eklenti videonun son saniyesinden başa atladığı anı (ya da `ended`
olayını) yakalar ve sırayla şunları dener: **"Sonraki" butonu → ArrowDown tuşu → container scroll**.
URL değişirse başarılı sayılır; hiçbiri işe yaramazsa sağlık durumu "bozuk" olur.

## YouTube değişince ne olur?

1. **Kullanıcı tarafı:** ikonda kırmızı `!`, popup'ta "YouTube değişmiş olabilir" mesajı.
2. **Senin tarafın:** `monitor.yml` 6 saatte bir gerçek YouTube'u açıp test eder. Bozulursa
   `youtube-broke` etiketli bir issue açar → GitHub sana e-posta/bildirim gönderir. Düzelince issue'yu kendisi kapatır.
3. **Hızlı düzeltme (çoğu durumda):** `remote-config.json` içindeki seçicileri güncelle ve push'la.
   Kullanıcılar 6 saat içinde (ya da popup açılınca) yeni seçicileri alır, Store incelemesine gerek kalmaz.
4. **Kod değişikliği gerekiyorsa:** `manifest.json` içindeki `version`'ı artır,
   `git tag v1.0.1 && git push --tags` → Store'a otomatik yüklenir, Chrome kullanıcıları otomatik günceller.

## Kurulum (ilk kez)

1. Repo: https://github.com/anilpekesen/youtube-shorts-auto-scroll (public kalmalı, uzak config buradan okunuyor).
   Bağış adresi `extension/src/defaults.js` içindeki `DONATION`.
2. Yerelde dene: `chrome://extensions` → Geliştirici modu → "Paketlenmemiş öğe yükle" → `extension/` klasörü.
3. Testi çalıştır: `npm install && npx playwright install chromium && npm run monitor`
   (tarayıcıyı görmek için: `npm run monitor:headed`).

## Chrome Web Store'a yükleme

1. https://chrome.google.com/webstore/devconsole → tek seferlik 5$ geliştirici kaydı.
2. `npm run zip` → `extension.zip` dosyasını yükle.
3. Gizlilik sekmesi: "veri toplanmıyor" seç, gizlilik politikası URL'si olarak `PRIVACY.md`'nin GitHub linkini ver.
   İzin gerekçeleri:
   - `storage`: aç/kapa ayarını saklamak
   - `alarms`: seçici config'ini periyodik yenilemek
   - `raw.githubusercontent.com`: seçici config'ini (sadece veri, kod değil) indirmek
4. İlk yayından sonra otomatik yayın için GitHub repo secrets ekle:
   `CWS_EXTENSION_ID`, `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET`, `CWS_REFRESH_TOKEN`
   ([nasıl alınır](https://github.com/fregante/chrome-webstore-upload-keys)).

### Politika notları
- **USDT (TRC20) bağış:** İsteğe bağlı bağış linki/adresi serbest. Yasak olanlar: kullanıcının cihazında
  kripto madencilik yapmak ve bağışı bir özelliğin kilidini açma şartına bağlamak. Bu eklenti ikisini de yapmıyor.
- **İsim:** "YouTube" kelimesi isimde ilk sırada olmamalı ve YouTube logosu kullanılmamalı. Bu yüzden isim
  "Auto Scroll for YouTube Shorts" ve ikon kendi tasarımımız.
- **Uzak kod yasak:** MV3 uzaktan JS çalıştırmaya izin vermez. `remote-config.json` sadece CSS seçici listesi
  içerir ve arka planda filtrelenir, bu yüzden kurallara uygun.
