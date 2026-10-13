# Auto Scroll for YouTube Shorts, Instagram Reels & TikTok

YouTube Shorts, Instagram Reels veya TikTok videosu bitince otomatik olarak sonrakine geçen, ücretsiz Chrome eklentisi (Manifest V3).

**[Chrome Web Store'dan kur](https://chromewebstore.google.com/detail/auto-scroll-for-youtube-s/cdjmnadedkcjiepgplkaikbnegaiemon)** · Extension ID: `cdjmnadedkcjiepgplkaikbnegaiemon`

## Yapı

```
extension/              ← Store'a yüklenen klasör (zip'lenen kısım)
  manifest.json
  src/defaults.js       ← site tanımları + seçiciler, USDT bağış adresi, uzak config URL'si
  src/content.js        ← video bitişini algılar, sonrakine geçer, sağlık durumu bildirir
  src/background.js     ← uzak config'i 6 saatte bir çeker, bozulunca ikonda "!" gösterir
  src/popup.*           ← site başına aç/kapa ve durum, USDT (TRC20) bağış
remote-config.json      ← GitHub'dan canlı okunan seçiciler (Store incelemesi olmadan düzeltme)
tests/monitor.mjs       ← gerçek YouTube'da uçtan uca test (TikTok/Instagram CI'da test edilmiyor, bkz. aşağı)
.github/workflows/
  monitor.yml           ← 6 saatte bir test; bozulursa issue açar (GitHub e-posta atar)
  release.yml           ← v* tag'i push'layınca Chrome Web Store'a yükler
  store-status.yml      ← 6 saatte bir Store durumuna bakar; sürüm yayına girince ya da reddedilince issue açar
```

## Nasıl çalışır

Her site `defaults.js` içindeki `SITES` altında tanımlı: hangi host'larda ve hangi sayfalarda (`path`)
çalışacağı, ve aktif video / sonraki butonu / scroll container seçicileri.

| Site | Sayfa | Not |
|---|---|---|
| YouTube Shorts | `/shorts/…` | Her video yeni URL |
| TikTok | `/`, `/foryou`, `/following`, `/friends` | URL değişmez; aktif video elementi değişir |
| Instagram Reels | `/reels/…` | Buton etiketleri dile göre değiştiği için "sonraki" butonu yapıdan bulunur |

Videolar bitince ya `ended` olayı gelir ya da başa sarar. Eklenti ikisini de yakalar ve sırayla şunları dener:
**"Sonraki" butonu → ArrowDown tuşu → container scroll** (container seçici yoksa videonun kaydırılabilir üst elementi).
URL ya da ekrandaki aktif video değişirse başarılı sayılır; hiçbiri işe yaramazsa o sitenin sağlık durumu "bozuk" olur.

## Bir site değişince ne olur?

1. **Kullanıcı tarafı:** ikonda kırmızı `!`, popup'ta ilgili sitenin satırında "Sayfa yapısı değişmiş" mesajı.
2. **Senin tarafın:** `monitor.yml` 6 saatte bir gerçek YouTube'u açıp test eder. Bozulursa
   `youtube-broke` etiketli bir issue açar → GitHub sana e-posta/bildirim gönderir. Düzelince issue'yu kendisi kapatır.
   TikTok ve Instagram için otomatik izleme yok (Instagram giriş istiyor, TikTok GitHub sunucularını sık engelliyor);
   bunlar için sinyal kullanıcı yorumları ve popup'taki durum.
3. **Hızlı düzeltme (çoğu durumda):** `remote-config.json` içinde `sites.<site>.selectors` altındaki seçicileri güncelle ve push'la.
   Üstteki `selectors` anahtarı v1.0 kurulumları için (sadece YouTube); YouTube seçicisini değiştirirsen ikisini de güncelle.
   Kullanıcılar 6 saat içinde (ya da popup açılınca) yeni seçicileri alır, Store incelemesine gerek kalmaz.
4. **Kod değişikliği gerekiyorsa:** `manifest.json` içindeki `version`'ı artır,
   `git tag v1.1.1 && git push --tags` → Store'a otomatik yüklenir, Chrome kullanıcıları otomatik günceller.

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
   - youtube.com / instagram.com / tiktok.com içerik script'i: video bitişini algılayıp sonrakine geçmek
4. İlk yayından sonra otomatik yayın için GitHub repo secrets ekle:
   `CWS_EXTENSION_ID`, `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET`, `CWS_REFRESH_TOKEN`
   ([nasıl alınır](https://github.com/fregante/chrome-webstore-upload-keys)).

### Politika notları
- **USDT (TRC20) bağış:** İsteğe bağlı bağış linki/adresi serbest. Yasak olanlar: kullanıcının cihazında
  kripto madencilik yapmak ve bağışı bir özelliğin kilidini açma şartına bağlamak. Bu eklenti ikisini de yapmıyor.
- **İsim:** Marka adları (YouTube, Instagram, TikTok) isimde ilk sırada olmamalı ve logoları kullanılmamalı. Bu yüzden isim
  "Auto Scroll for YouTube Shorts, Instagram Reels & TikTok" ve ikon kendi tasarımımız.
- **v1.1 izin uyarısı:** v1.1 yeni siteler eklediği için Chrome mevcut kullanıcılara "yeni izin" onayı sorar ve
  onaylanana kadar eklentiyi devre dışı bırakır. Yeni site eklemek her seferinde bunu tetikler.
- **Uzak kod yasak:** MV3 uzaktan JS çalıştırmaya izin vermez. `remote-config.json` sadece CSS seçici listesi
  içerir ve arka planda filtrelenir, bu yüzden kurallara uygun.
