# ŞehirNabız — Mobil Kullanıcı Deneyimi Denetimi (Mobile UX Audit)

**Tarih:** 27 Ekim 2026  
**Faz:** Phase 12 — Mobile Experience Audit, E2E Quality & Beta Readiness  
**Tasarım Sistemi:** Urban Floating UI  
**Hedef Ekran Sayısı:** 15 Mobil Ekran ve Modal

---

## 1. Giriş ve Denetim Metodolojisi

Bu denetim, ŞehirNabız mobil uygulamasının tüm kullanıcı akışlarını, görsel tutarlılığını, yükleme/boş/hata durumlarını ve küçük ekran uyumluluğunu en ince ayrıntısına kadar incelemek amacıyla yapılmıştır.

Urban Floating UI prensipleri:
- **Zemin:** `#F6F8FB` (Açık) / `#0F172A` (Koyu)
- **Kartlar & Paneller:** `#FFFFFF` (Açık) / `#1E293B` (Koyu), 16–24px radius, yumuşak gölge
- **Vurgu & Birincil:** `#14B8A6` (Teal), ikincil `#2563EB` (Mavi), uyarı `#F59E0B` (Amber), hata `#EF4444` (Kırmızı)
- **Tipografi:** Plus Jakarta Sans (Başlıklar), Manrope (Gövde metinleri)
- **Hiyerarşi & Boşluk:** 4px ızgara (`xxs: 2`, `xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 40`)

---

## 2. 15 Ekran Kapsamlı Denetim Raporu

### 1. Harita Ekranı (`(tabs)/index.tsx` & `MapScreenLayout.tsx`)
- **İşlev:** Kentsel olayların interaktif MapLibre haritası üzerinde kümelenmiş veya tekil pinlerle görüntülenmesi.
- **Düzen & Geometri İyileştirmesi (Kritik Düzeltme):**
  - *Önceki Sorun:* Arama çubuğu (~80px yükseklik) ile kategori çipleri dikeyde çakışıyor, çiplere dokunulması zorlaşıyordu.
  - *Yapılan Düzeltme:* `searchBarSlot` `insets.top + 12`, `categoryFilterSlot` `insets.top + 94`, `mapActionControlsSlot` `insets.top + 152` olarak yeniden konumlandırıldı.
  - *Banner & Heatmap:* Canlı bağlantı banner'ı `insets.top + 146` noktasına, yoğunluk hapı ise 64px'lik Floating Tab Bar'ın hemen üzerine `insets.bottom + 76` noktasına taşındı.
- **Durumlar:** Canlı soket durumu (`BAĞLI`, `YENİDEN BAĞLANIYOR`, `KOPUK`) rozeti, offline demo fallback güvenliği.

### 2. Akış Ekranı (`(tabs)/feed.tsx`)
- **İşlev:** Çevredeki olayların zamansal ve mesafeye göre listelenmesi.
- **Kullanılabilirlik:** Tümü, Yakınımdakiler ve Acil Durumlar filtre çipleri; Şehir İstatistikleri hızlı giriş kartı.
- **Erişilebilirlik İyileştirmesi:** Her olay kartına `accessibilityRole="button"`, olay başlığı, kategori ve ilçe içeren `accessibilityLabel` ve dokunma hint'i eklendi.
- **Durumlar:** Kaydırma sırasında yumuşak animasyon, pull-to-refresh desteği.

### 3. Bildir Sekmesi (`(tabs)/create.tsx`)
- **İşlev:** Alt gezinme çubuğundaki merkezi yüzen aksiyon butonu.
- **Kullanılabilirlik:** Dokunulduğunda sekmeyi değiştirmek yerine 4 adımlı olay bildirim sihirbazını başlatır.
- **Güvenlik:** Giriş yapmamış kullanıcıları engeller veya bildirim taslağını yerel hafızaya saklar.

### 4. Bildirimler Ekranı (`(tabs)/notifications.tsx`)
- **İşlev:** Teyit edilen, çözülen, reddedilen veya yakındaki olaylara dair anlık ve geçmiş uyarılar.
- **Tasarım:** Tarihe göre gruplandırma ("Bugün", "Dün", "Daha Önce"), okunmamış bildirim filtresi ve "Tümünü Oku" aksiyonu.
- **Durumlar:** 
  - *Misafir Kullanıcı:* "Giriş Yapmalısınız" EmptyState kartı ve AuthModal tetiği.
  - *Boş Durum:* "Henüz Bildiriminiz Yok" / "Okunmamış Bildirim Yok" açıklaması.
  - *Yükleme/Hata:* Skeleton gösterimi ve "Tekrar Dene" butonu.

### 5. Profil Ekranı (`(tabs)/profile.tsx`)
- **İşlev:** Kullanıcı kimliği, itibar puanı, kentsel katkı sayaçları ve yönetim bağlantıları.
- **Tasarım:** Avatar, itibar puanı bilgilendirme kartı (açılır/kapanır), 3'lü sayaç (Bildirdiğim, Teyit Ettiğim, Çözülen).
- **Rol Denetimi:** Yalnızca `MODERATOR` veya `ADMIN` rolüne sahip kullanıcılar için sarı vurgulu Moderatör Paneli bağlantısı.
- **Oturum:** Misafir kullanıcı için birincil "Giriş Yap / Kayıt Ol" butonu, giriş yapmış kullanıcı için güvenli çıkış diyaloğu.

### 6. Olay Detay Ekranı (`events/[id].tsx`)
- **İşlev:** Olay fotoğrafları, harita konumu, açıklama, kategori etiketi ve topluluk etkileşimleri.
- **Topluluk Etkileşimi:** "Ben de gördüm" (CONFIRM), "İtiraz Et" (DISPUTE), "Sorun Çözüldü" (RESOLVED_REPORT) butonları.
- **Tutarlılık:** Misafir kullanıcı oy vermek istediğinde AuthModal açılır; olay sahibi kendi olayına oy veremez.
- **Açıklanabilirlik:** Sahte kesinlik ("%98 güvenilir") yerine "Topluluk tarafından teyit edildi" gibi metinsel gösterge.

### 7. Olay Oluşturma Sihirbazı (`CreateEventFlow.tsx`)
- **İşlev:** 4 adımlı (Kategori & Başlık -> Konum Belirleme -> Fotoğraf Yükleme -> Önizleme & Onay) form akışı.
- **Dayanıklılık:** Çevrimdışı taslak kaydetme (AsyncStorage), ağ koptuğunda veri kaybını önleme.
- **Güvenlik:** Çift tıklama kilidi (Submission Lock), 150m mükerrer olay uyarısı (Duplicate Warning).

### 8. Konum Seçici Modal (`LocationPickerModal.tsx`)
- **İşlev:** Harita üzerinde iğneyi sürükleyerek veya mevcut GPS konumunu kullanarak olay noktasını seçme.
- **Gizlilik:** Cihaz konumu sunucuda tutulmaz, yalnızca kullanıcının seçtiği nihai koordinat kaydedilir.
- **Kullanılabilirlik:** Ters coğrafi kodlama (Reverse Geocoding) ile otomatik ilçe ve cadde tespiti.

### 9. Fotoğraf Seçici (`PhotoPicker.tsx`)
- **İşlev:** Kameradan veya galeriden maksimum 3 adet fotoğraf yükleme.
- **Sanitizasyon:** EXIF ve GPS meta verileri istemci tarafında temizlenir; dosya boyutu sınırı (8MB) denetlenir.

### 10. Giriş / Kayıt Modal (`AuthModal.tsx`)
- **İşlev:** E-posta ve şifre ile giriş yapma veya yeni hesap açma.
- **Kullanılabilirlik:** Sekmeli geçiş (Giriş Yap <-> Kayıt Ol), form validasyonu, şifre gizle/göster ikonu.
- **Dayanıklılık:** Token yenileme kilit mekanizmasıyla paralel isteklerde oturum düşmesi engellenir.

### 11. Şehir İstatistikleri Ekranı (`stats/index.tsx`)
- **İşlev:** Şehir genelinde bildirilen olayların kategori, ilçe ve zamansal dağılım grafikleri.
- **Kullanılabilirlik:** Şehir ve zaman periyodu (24s, 7g, 30g, Tümü) seçimi, responsive çubuk grafikler.
- **Yasal Feragatname:** "İstatistikler ŞehirNabız üzerinde yayınlanan kullanıcı bildirimlerine dayanmaktadır; tüm gerçek olayların eksiksiz kaydını temsil etmez." açıklaması.

### 12. Bildirdiğim Olaylar Ekranı (`profile/my-events.tsx`)
- **İşlev:** Kullanıcının geçmişte açtığı olayların durum takibi.
- **Kullanılabilirlik:** Durum filtre çipleri (Tümü, İncelemede, Yayında, Çözüldü, Reddedildi).
- **Gerekçe Kalkanı:** Moderatör tarafından reddedilen olaylarda kırmızı arka planlı açıklama kartı ile kullanıcının bilgilendirilmesi.

### 13. Uygulama Ayarları Ekranı (`profile/settings.tsx`)
- **İşlev:** Görünüm teması (Açık, Koyu, Sistem), bildirim filtreleri ve gizlilik taahhütleri.
- **Erişilebilirlik:** Tüm Switch anahtarlarına `accessibilityLabel` eklenmiştir.
- **Gizlilik Beyanı:** "Cihaz Konumu Asla Saklanmaz", "EXIF & GPS Temizleme Garantisi" ve "k-Anonymity" ilkeleri.

### 14. Moderatör Yönetim Paneli (`moderation/index.tsx`)
- **İşlev:** Yetkili personelin inceleme bekleyen ve itiraz edilen olayları değerlendirmesi.
- **Güvenlik:** Rol kalkanı (`CITIZEN` rolüne sahip kullanıcılar için özel yetkisiz erişim ekranı).
- **Canlı Senkronizasyon:** WebSocket üzerinden anlık kuyruk güncellemesi ve olay onaylama/reddetme modalı.

### 15. UI Showcase Ekranı (`showcase/index.tsx`)
- **İşlev:** Urban Floating UI tasarım sistemine ait tüm butonlar, badge'ler, kartlar ve renk paletinin canlı testi.
- **Güvenlik:** Yalnızca geliştirme modunda (`__DEV__ = true`) erişilebilir, canlıda gizlenir.

---

## 3. Ekran Boyutu ve Donanım Uyumluluğu

- **Küçük Ekranlar (iPhone SE / Android Compact 360-375pt):** Dikey boşluklar ve padding değerleri `Math.max` ve responsive inset mantığı ile taşmaları önleyecek şekilde düzenlenmiştir.
- **Geniş Ekranlar & Tabletler:** Kartların maksimum genişliği sınırlandırılmış, yatay padding korunmuştur.
- **Çentik ve Dinamik Ada (Safe Area):** `react-native-safe-area-context` ile tüm üst ve alt çubuklar sistem barlarıyla mükemmel uyumludur.
