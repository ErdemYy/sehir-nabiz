# ŞehirNabız'a katkı

Hata bildirimlerinde beklenen ve gerçekleşen davranışı, tekrar üretme adımlarını ve cihaz/ortam bilgisini paylaşın. Ekran görüntülerindeki kişisel bilgileri ve konumları maskeleyin.

1. Büyük değişiklikler için önce kapsamı bir issue üzerinden açıklayın.
2. Repoyu fork edin ve açıklayıcı bir dal oluşturun.
3. [AGENTS.md](AGENTS.md) ve [geliştirici rehberini](docs/DEVELOPMENT.md) okuyun.
4. İngilizce kod adları, Türkçe arayüz mesajları ve strict TypeScript kullanın. `any` eklemeyin; mevcut yorumları koruyun.
5. Değişikliğe uygun testleri ve `pnpm run typecheck` komutunu çalıştırın. Kod değişikliklerinden sonra `graphify update .` çalıştırın.
6. Pull request açıklamasına problemi, çözümü ve doğrulama sonuçlarını yazın. Mobil görsel değişikliklerde ekran görüntüsü ekleyin.

Gizli anahtar, gerçek kullanıcı verisi, `.env` veya imzalama dosyası göndermeyin. Güvenlik açıklarını [özel bildirim kanalı](SECURITY.md) üzerinden paylaşın.

Katkılar projenin [MIT lisansı](LICENSE) kapsamında sunulur.
