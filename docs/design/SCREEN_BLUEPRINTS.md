# ŞehirNabız — Mobil Ekran Planları (SCREEN_BLUEPRINTS.md)

Bu doküman, ŞehirNabız mobil uygulamasındaki ana ekranların amacını, bileşen hiyerarşisini, yerleşim şemasını, etkileşim akışlarını, veri durumlarını ve yetkilendirme gereksinimlerini tanımlar.

---

## 1. Harita Ekranı (`/` veya `/(tabs)/index`)

### Ekran Amacı:
Kullanıcının şehirdeki aktif olayları (kaza, yol çalışması, arıza vb.) coğrafi konumları ve kümelenmiş (clustered) pinler üzerinden interaktif olarak keşfetmesini sağlamak.

### Bileşen Hiyerarşisi:
```text
MapScreenLayout
├── mapCanvas (Phase 6 MapLibre Vektör Haritası / Şimdilik Placeholder)
├── searchBarSlot
│   └── SearchBar (Cadde/İlçe arama ve UI Showcase kısayolu)
├── categoryFilterSlot
│   └── Horizontal ScrollView > CategoryChip x 11
├── mapActionControlsSlot
│   ├── FloatingIconButton (Mevcut Konuma Git)
│   ├── FloatingIconButton (Harita Katmanları: Trafik/Uydu)
│   └── FloatingIconButton (Gelişmiş Mesafe & Güvenilirlik Filtreleri)
├── bottomSheetSlot
│   └── BottomSheet (Pin tıklandığında açılan olay hızlı önizleme kartı)
└── bottomNavigationSlot
    └── FloatingTabBar (5 Ana Sekme)
```

### Kullanıcı Etkileşimleri:
- Haritayı kaydırma ve yaklaştırma (Pan & Pinch to zoom).
- Kategori çipine dokunarak haritadaki olayları filtreleme.
- Olay pinine dokunulduğunda `BottomSheet` açılarak hızlı özetin gösterilmesi.
- `BottomSheet` üzerindeki "Detayları Gör" butonu ile olay sayfasına gitme, "Teyit Et" butonu ile oylama başlatma.

### Durum Yönetimi:
- **Loading:** Harita karoları arka planda yüklenirken hafif parıltı; pinler gelene kadar FloatingIconButton'lar aktif.
- **Empty:** Seçilen kategoride o bölgede olay yoksa harita merkezinde FloatingCard ile "Bu bölgede bildirilen aktif olay bulunmuyor" bilgisi.
- **Error:** GPS konumu alınamazsa varsayılan şehir merkezine (örn. Kayseri Cumhuriyet Meydanı) odaklanma ve kullanıcıya konum izin uyarısı.

### Auth Gereksinimi:
- **Anonim:** Herkese açık. Olayları görüntüleyebilir, haritada gezinebilir.
- **Giriş Gerekli:** Olay teyit etme veya yeni olay bildirme tıklandığında AuthBottomSheet açılır.

---

## 2. Şehir Akışı Ekranı (`/(tabs)/feed`)

### Ekran Amacı:
Harita yerine kronolojik ve mesafeye göre sıralı bir sosyal akış tercih eden kullanıcılar için olayların kart formatında listelenmesi.

### Bileşen Hiyerarşisi:
```text
AppScreen (scrollable)
├── AppHeader ("Şehir Akışı", "Çevrenizdeki son doğrulanmış olaylar")
├── Horizontal Filter Chips ("Tümü", "Yakınımdakiler", "Acil Durumlar")
└── Vertical List (PaddingBottom: 100px)
    └── AppCard x N
        ├── Header Row (Category AppBadge, StatusBadge, Zaman Damgası)
        ├── Title (AppText headingM bold)
        ├── Description (AppText bodyS secondary)
        └── Footer Row (İlçe/Mesafe, Teyit Sayısı, Fotoğraf Sayısı)
```

### Etkileşimler:
- Sayfayı aşağı çekerek yenileme (Pull-to-refresh).
- Karta dokunulduğunda tam detay ekranına geçiş.
- Hızlı teyit butonu ile doğrudan akış üzerinden oy verebilme.

### Auth Gereksinimi:
- **Anonim:** Görüntüleme serbest.
- **Giriş Gerekli:** Teyit oyu ve yorum ekleme.

---

## 3. Olay Bildir Ekranı (`/(tabs)/create`)

### Ekran Amacı:
Kullanıcının sahada gördüğü olayı 60 saniye içinde fotoğraf, konum ve kategori bilgileriyle sisteme bildirmesi.

### Bileşen Hiyerarşisi:
```text
AppScreen (scrollable, keyboardAvoiding)
├── AppHeader ("Olay Bildir", "Şehrinizdeki aksaklığı paylaşın")
├── Location Verification Card (Otomatik GPS konumu ve 150m fuzzing rozeti)
├── Category Selector (Horizontal CategoryChip listesi)
├── AppInput (Olay Başlığı, min 5 karakter)
├── AppTextArea (Ayrıntılı Açıklama, min 10 karakter, 500 karakter sayacı)
├── Severity Selector (Düşük / Orta / Yüksek / Kritik FilterChip'leri)
├── Media Upload Slot (Phase 4 MinIO/S3 entegrasyonlu 3 fotoğraf yuvası)
└── AppButton (Primary 52px, "Olayı Bildir", validasyon tamamlanmadan disabled)
```

### Güvenlik ve Gizlilik:
- EXIF temizleme motoru arka planda GPS ve kamera verilerini tamamen siler.
- Kullanıcı ev/iş adresindeyse konum otomatik olarak 150-300m rastgele ötelenir.
- 150m yarıçapta son 45 dakikada benzer olay varsa "Mükerrer Bildirim Uyarısı" verilir.

### Auth Gereksinimi:
- **Zorunlu Giriş:** Anonim kullanıcılar bildirim yapamaz. Butona tıklandığında giriş modalı açılır.

---

## 4. Bildirimler Ekranı (`/(tabs)/notifications`)

### Ekran Amacı:
Kullanıcının bildirdiği olayların topluluk teyidi durumunu, kazanılan itibar puanlarını ve yakın çevresindeki kritik uyarıları listelemek.

### Bileşen Hiyerarşisi:
```text
AppScreen (scrollable)
├── AppHeader ("Bildirimler", "Olay teyitleri ve yerel uyarılar")
└── Notification List
    └── AppCard (Okunmamış bildirimlerde primary border)
        ├── Left Icon (Başarı: Yeşil Tik, Uyarı: Sarı Üçgen, Sistem: Kalkan)
        ├── Content (Başlık, mesaj metni, zaman damgası)
        └── Unread Dot (Turkuaz nokta)
```

### Auth Gereksinimi:
- **Zorunlu Giriş:** Oturum açmamış kullanıcılar için EmptyState ("Bildirimlerinizi görmek için giriş yapın") gösterilir.

---

## 5. Profil ve Ayarlar Ekranı (`/(tabs)/profile`)

### Ekran Amacı:
Kullanıcının itibar puanını, rütbesini, bildirdiği olay istatistiklerini görüntülemesi ve tema/gizlilik ayarlarını yönetmesi.

### Bileşen Hiyerarşisi:
```text
AppScreen (scrollable)
├── AppHeader ("Profil", "Hesabınız ve tercihleriniz")
├── User Identity Card
│   ├── AppAvatar (Doğrulanmış onay rozeti ile)
│   ├── Name & Role Badge (Güvenilir Yazar, Vatandaş, Moderatör)
│   └── Reputation Score Indicator (İtibar Puanı)
├── Appearance / Theme Selector (Açık / Koyu / Sistem 3'lü buton)
├── Privacy Shield Card (KVKK ve Konum Fuzzing bilgilendirmesi)
├── UI Showcase Link (Yalnızca __DEV__ modunda görünür)
└── Logout / Account Actions
```

---

## 6. Olay Detay ve Teyit Ekranı (Planlanan Detay Ekranı)

### Ekran Amacı:
Seçilen bir olayın tüm fotoğraflarını, tam açıklamasını, harita üzerindeki konumunu, güvenilirlik skorunu ve topluluk teyit oylarını görüntülemek.

### Bileşen Hiyerarşisi:
```text
AppScreen (scrollable)
├── AppHeader (Geri butonu, Paylaş butonu)
├── Media Carousel (Maksimum 3 adet temizlenmiş WebP fotoğraf)
├── Event Meta Card (Kategori, Şiddet, Durum, Yayınlanma Zamanı)
├── Description & Address Block
├── Mini Map Preview (Olayın 500m çevresini gösteren statik harita)
├── Verification Bar (Topluluk Güvenilirlik Skoru %85 Doğrulandı)
└── Action Buttons Floating Footer
    ├── AppButton ("Doğru / Olay Yerindeyim", primary)
    ├── AppButton ("Yanlış / Sahte", outline destructive)
    └── AppButton ("Çözüldü / Bitti", secondary)
```
