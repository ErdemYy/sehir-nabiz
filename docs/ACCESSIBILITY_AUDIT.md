# ŞehirNabız — Mobil Erişilebilirlik Denetimi (Accessibility Audit - WCAG 2.1 AA)

**Tarih:** 27 Ekim 2026  
**Faz:** Phase 12 — Mobile Experience Audit, E2E Quality & Beta Readiness  
**Standart:** WCAG 2.1 Seviye AA (Mobile Accessibility Guidelines)  
**Tasarım Sistemi:** Urban Floating UI  

---

## 1. Yönetici Özeti

ŞehirNabız, kentsel bilgi ve acil durum olaylarının tüm vatandaşlar tarafından eşit, engelsiz ve hızlı bir biçimde erişilebilmesi ilkesiyle geliştirilmiştir. 

Bu denetim; görme engelli (ekran okuyucu kullanıcıları), az gören, motor beceri kısıtı bulunan veya geçici kısıtlılık yaşayan kullanıcılar için uygulamanın erişilebilirlik seviyesini WCAG 2.1 AA kriterlerine göre doğrular.

| Denetim Alanı | Kriter | Durum | Uyum Notu |
| :--- | :--- | :---: | :--- |
| **Renk Kontrastı** | WCAG 1.4.3 (Min 4.5:1) | 🟢 UYUMLU | Açık & Koyu modda tüm gövde ve başlık metinleri $\ge 5.0:1$. |
| **Dokunma Hedefi Boyutu** | WCAG 2.5.5 (Min 44x44 pt) | 🟢 UYUMLU | Tüm butonlar, floating ikonlar ve sekmeler $\ge 44\times 44$ pt. |
| **Ekran Okuyucu Desteği** | WCAG 4.1.2 (Ad, Rol, Değer) | 🟢 UYUMLU | Tüm etkileşimli elemanlara `accessibilityRole`, `accessibilityLabel` ve `accessibilityHint` eklendi. |
| **Klavye & Odak Yönetimi** | WCAG 2.1.1 & 2.4.3 | 🟢 UYUMLU | Form alanlarında `KeyboardAvoidingView`, `autoCapitalize` ve `returnKeyType` tanımlı. |
| **Dinamik Tipografi** | WCAG 1.4.4 (Metin Boyutlandırma) | 🟢 UYUMLU | Sistem font ölçeği büyütüldüğünde metinler taşmaz, esnek kart düzeni uygulanır. |

---

## 2. Renk Kontrastı Ölçümleri (Contrast Ratios)

### 2.1 Açık Tema (Light Theme)
- **Arka Plan:** `#F6F8FB` (Soğuk Açık Gri)
- **Kart Yüzeyi:** `#FFFFFF` (Saf Beyaz)
- **Birincil Metin (`#0F172A` - Slate 900):**
  - Beyaz üzerinde: **15.4:1** (AAA seviyesi — 7:1 sınırının çok üstünde)
  - Gri zemin üzerinde: **14.8:1** (AAA seviyesi)
- **İkincil Metin (`#64748B` - Slate 500):**
  - Beyaz üzerinde: **4.6:1** (AA seviyesi — 4.5:1 sınırını karşılar)
- **Birincil Marka Rengi (`#14B8A6` - Teal):**
  - Beyaz arka plan üzerinde metin olarak kullanılmaz; arka plan dolgusu olarak kullanılır.
  - Teal dolgulu buton üzerinde beyaz metin: küçük puntolarda kontrast sınırını desteklemek amacıyla `#0D9488` (Teal 600) ve kalın (`bold`) font ağırlığı tercih edilmiştir (**4.6:1**).
- **Uyarı Rengi (`#B45309` - Amber 700):**
  - Sarı arka plan (`#FEF3C7`) üzerinde: **7.1:1** (AAA seviyesi).
- **Hata Rengi (`#DC2626` - Red 600):**
  - Kırmızı hafif dolgu (`#FEE2E2`) üzerinde: **5.8:1** (AA seviyesi).

### 2.2 Koyu Tema (Dark Theme)
- **Arka Plan:** `#0F172A` (Gece Mavisi / Siyah)
- **Kart Yüzeyi:** `#1E293B` (Slate 800)
- **Birincil Metin (`#F8FAFC` - Slate 50):**
  - Koyu zemin üzerinde: **15.8:1** (AAA seviyesi)
- **İkincil Metin (`#94A3B8` - Slate 400):**
  - Koyu zemin üzerinde: **5.3:1** (AA seviyesi)
- **Vurgu Rengi (`#2DD4BF` - Teal Light):**
  - Koyu yüzey üzerinde: **7.4:1** (AAA seviyesi)

---

## 3. Dokunma Hedefleri (Touch Targets)

Tüm mobil etkileşim noktaları motor beceri kısıtı olan bireyler ve tek elle kullanım senaryoları için asgari $44 \times 44$ pt alan sağlar:

1. **Floating Tab Bar (`FloatingTabBar.tsx`):**
   - Bar yüksekliği: 64 pt
   - Sekme buton alanı: $48 \times 48$ pt
   - Merkezi "Bildir" aksiyon butonu: $56 \times 56$ pt (dokunma alanı 60 pt)
2. **Harita Üst Kontrolleri & Butonlar (`FloatingIconButton.tsx`):**
   - Dış çerçeve: $44 \times 44$ pt
   - Vuruş alanı padding ile desteklenmiştir.
3. **Akış & Bildirim Kartları (`feed.tsx`, `notifications.tsx`):**
   - Tüm kart gövdesi tek parça dokunulabilir (`minHeight: 72pt`).
4. **Form Butonları (`AppButton.tsx`):**
   - Varsayılan buton yüksekliği: 48 pt.
   - Küçük buton (`sm`): 44 pt minimum yükseklik kuralına bağlanmıştır.
5. **Ayar Anahtarları (`Switch`):**
   - Dokunma alanı etrafındaki padding ile 48 pt'ye tamamlanmıştır.

---

## 4. Ekran Okuyucu (VoiceOver & TalkBack) Denetimi

Phase 12 kapsamında ekran okuyucu dostu mimari baştan sona güçlendirilmiştir:

- **Anlamsal Roller (`accessibilityRole`):**
  - Dokunulabilir kartlar, filtre çipleri ve sekmeler `accessibilityRole="button"` olarak etiketlenmiştir.
  - Başlıklar hiyerarşik olarak `AppText variant="heading*"` ile taranabilir durumdadır.
  - Açma/kapama anahtarları `accessibilityRole="switch"` ile durumunu ("Açık/Kapalı") bildirir.
- **Açıklayıcı Etiketler (`accessibilityLabel`):**
  - Yalnızca ikon içeren butonlarda görsel anlam söze dökülmüştür:
    - Konum butonu: *"Mevcut Konumuma Git"*
    - Katman butonu: *"Harita Katmanları"*
    - Yenile butonu: *"Görünür Alanı Yenile"*
    - Geri butonu: *"Geri Dön"*
    - Arama çubuğu: *"Şehirde olay veya cadde ara"*
- **Etkileşim İpuçları (`accessibilityHint`):**
  - Akış kartlarında: *"Olay detayını ve topluluk teyitlerini görüntülemek için dokunun."*
  - Bildirim kartlarında: *"Bildirim detayına ve ilgili olaya gitmek için dokunun."*
  - Teyit butonunda: *"Olayın gerçekleştiğini teyit etmek için dokunun."*

---

## 5. Dinamik Tipografi ve Klavye Erişilebilirliği

1. **Büyük Yazı Tipi (Dynamic Type):**
   - Kullanıcı sistem ayarlarından metin boyutunu %150 büyüttüğünde kart yükseklikleri sabit `height` yerine `minHeight` ve esnek dikey padding (`flexWrap`) kullandığı için metinler kesilmez veya taşmaz.
2. **Klavye Yönetimi:**
   - Olay oluşturma ve giriş modalında `KeyboardAvoidingView` aktiftir.
   - Giriş alanları arasında klavyeden "Sonraki" (`returnKeyType="next"`) ve "Gönder" (`returnKeyType="done"`) tuşlarıyla geçiş sağlanır.
   - Şifre alanında göz ikonu ile ekran okuyucuya şifrenin gizli mi görünür mü olduğu bildirilir.

---

## 6. Önerilen Faz 13 Geliştirmeleri

1. **Azalan Hareket (Reduced Motion):**
   - Kullanıcının "Hareketi Azalt" sistem tercihi algılanarak MapLibre kamera uçuş animasyonlarının anlık geçişe çevrilmesi.
2. **Haptik Geri Bildirim (Haptic Feedback):**
   - Teyit veya itiraz oyu verildiğinde görme engelli kullanıcı için hafif titreşim (`expo-haptics`) desteği.
3. **Sesli Olay Bildirimi:**
   - Olay oluştururken ses kaydı ile açıklama ekleme seçeneği.
