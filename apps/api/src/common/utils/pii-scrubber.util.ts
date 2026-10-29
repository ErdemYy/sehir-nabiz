/**
 * ŞehirNabız — Kişisel Veri Arındırma ve Maskeleme Yardımcısı (PiiScrubber)
 * KVKK ve GDPR uyumlu metin içi hassas veri temizleme algoritması.
 */

export class PiiScrubber {
  // 1. E-posta Adresleri Regex (RFC 5322 uyumlu standart eşleşme)
  private static readonly EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  // 2. Türkiye Cep ve Sabit Telefon Numaraları (05xx, +905xx, 02xx, 03xx, 04xx ve formatlı boşluk/parantez/tire)
  // Sınır koruması (\b) ile koordinat, posta kodu ve tarihleri yanlış pozitif eşlemelerden korur.
  private static readonly PHONE_REGEX =
    /(?:\+?90[\s.-]?)?(?:\(?0?[1-9]\d{2}\)?[\s.-]?)\d{3}[\s.-]?\d{2}[\s.-]?\d{2}\b/g;

  // 3. T.C. Kimlik Numarası (11 haneli, sıfırla başlamayan ulusal kimlik numarası)
  private static readonly TCKN_REGEX = /\b[1-9]\d{10}\b/g;

  /**
   * Metin içerisindeki telefon, e-posta ve TCKN gibi hassas kişisel verileri maskeler
   */
  public static scrub(text?: string | null): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    let result = text;

    // 1. TCKN maskele (11 haneli kimlik no 10 haneli telefonlardan önce maskelenmeli)
    result = result.replace(this.TCKN_REGEX, '[Kimlik No Gizlendi]');

    // 2. E-posta adreslerini maskele
    result = result.replace(this.EMAIL_REGEX, '[E-posta Gizlendi]');

    // 3. Telefon numaralarını maskele
    result = result.replace(this.PHONE_REGEX, '[Telefon Gizlendi]');

    return result;
  }

  /**
   * Bir metnin kişisel veri (PII) içerip içermediğini tespit eder
   */
  public static containsPii(text?: string | null): boolean {
    if (!text || typeof text !== 'string') {
      return false;
    }
    return (
      this.EMAIL_REGEX.test(text) ||
      this.PHONE_REGEX.test(text) ||
      this.TCKN_REGEX.test(text)
    );
  }
}
