# ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)

Bu kılavuz, ŞehirNabız projesinde yerel geliştirme ortamının kurulması, kod standartları, test süreçleri ve komut satırı araçlarının kullanımını detaylandırır.

---

## 1. Ortam Hazırlığı

Projeyi çalıştırmadan önce sisteminizde aşağıdaki araçların kurulu olduğunu doğrulayın:

- **Node.js:** `v24.x` (veya en az `v20.x`)
- **pnpm:** `v12.x` (veya en az `v9.x`)
- **Git:** Sürüm kontrol sistemi
- **Graphify CLI:** Bilgi grafı motoru (`graphify 0.9.90`)

---

## 2. Çevresel Değişkenler (Environment Variables)

Projeyi ilk kez klonladığınızda örnek çevre dosyalarını kopyalayın:

```bash
# Backend için
cp apps/api/.env.example apps/api/.env

# Mobil uygulama için
cp apps/mobile/.env.example apps/mobile/.env
```

> [!IMPORTANT]
> Port çakışmalarını önlemek amacıyla backend API varsayılan olarak **`PORT=3001`** üzerinde çalışmaktadır (`http://localhost:3001/api/v1`).

---

## 3. Temel Turborepo Komutları

Monorepo genelinde veya paket bazında çalıştırabileceğiniz temel komutlar:

| Komut | Açıklama |
| :--- | :--- |
| `pnpm run build` | Tüm monorepo paketlerini Turborepo önbelleği ile derler. |
| `pnpm run typecheck` | TypeScript Strict modunda tüm çalışma alanında tip denetimi yapar. |
| `pnpm run lint` | ESLint ve kod kalitesi denetimlerini yürütür. |
| `pnpm run test` | Backend (Vitest) ve Shared paket (Node test runner) birim testlerini çalıştırır. |
| `pnpm run clean` | Oluşan `dist` ve geçici derleme klasörlerini temizler. |

---

## 4. Uygulama Bazlı Çalışma

### 4.1 Backend API (`apps/api`)
```bash
# Geliştirme modunda başlatma (hot reload)
pnpm --filter sehir-nabiz-api start:dev

# Üretim derlemesi oluşturma
pnpm --filter sehir-nabiz-api build

# Sağlık kontrolü testi (Health Check)
curl http://localhost:3001/api/v1/health
```

### 4.2 Mobil Uygulama (`apps/mobile`)
```bash
# Expo geliştirme sunucusunu başlatma
pnpm --filter sehir-nabiz-mobile start

# Android emülatöründe çalıştırma
pnpm --filter sehir-nabiz-mobile android

# iOS simülatöründe çalıştırma
pnpm --filter sehir-nabiz-mobile ios
```

---

## 5. Kodlama ve Mimari Kuralları

1. **TypeScript Strict Mode:** Tüm kod `strict: true` modunda yazılır. `any` kesinlikle yasaktır; tip bilinmiyorsa `unknown` ve Zod type guard'ları kullanılır.
2. **Paket Paylaşımı:** API ve mobil arasında paylaşılan her tip/şema mutlaka `@sehir-nabiz/shared` paketine eklenmeli ve oradan import edilmelidir.
3. **İsimlendirme Politikası:**
   - Kod, fonksiyon ve değişken isimleri: **İngilizce** (`eventCategory`, `verifyVote`, `createEventDto`)
   - Kullanıcı arayüzü, hata mesajları ve bildirimler: **Türkçe** ("Görsel yüklenemedi", "Konum doğrulandı")
4. **Graphify Senkronizasyonu:** Kod veya mimari dosyalarda değişiklik yapıldıktan sonra `graphify update .` komutu çalıştırılmalıdır.
