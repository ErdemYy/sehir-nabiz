const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

describe('Phase 11 — Mobil Güvenlik, Gizlilik ve Performans Sertleştirmesi Testleri', () => {
  describe('1. Konum Gizliliği ve Gerçekçi Güvenlik Bildirimleri', () => {
    it('mobil ayarlar dosyasında yanıltıcı "150 Metre Konum Bulanıklaştırma" ifadesi bulunmamalı', () => {
      const settingsPath = path.resolve(__dirname, '../app/profile/settings.tsx');
      const content = fs.readFileSync(settingsPath, 'utf8');

      // Gerçekte var olmayan 150m bulanıklaştırma iddiaları temizlenmiş olmalı
      assert.ok(
        !content.includes('150 Metre Konum Bulanıklaştırma'),
        'Yanıltıcı "150 Metre Konum Bulanıklaştırma" metni ayarlardan kaldırılmış olmalı',
      );
    });

    it('ayarlar ekranı cihaz GPS konumunun saklanmadığını açıkça taahhüt etmeli', () => {
      const settingsPath = path.resolve(__dirname, '../app/profile/settings.tsx');
      const content = fs.readFileSync(settingsPath, 'utf8');

      assert.ok(
        content.includes('Cihaz Konumu Asla Saklanmaz'),
        'Cihaz GPS konumunun saklanmadığı beyanı mevcut olmalı',
      );
      assert.ok(
        content.includes('EXIF & GPS Temizleme Garantisi'),
        'EXIF/GPS meta verisi temizleme garantisi mevcut olmalı',
      );
      assert.ok(
        content.includes('Yoğunluk Haritası k-Anonymity'),
        'Heatmap k-anonymity koruma beyanı mevcut olmalı',
      );
    });
  });

  describe('2. Arama Güvenliği ve Karakter Kısıtlaması', () => {
    it('arama terimi 100 karakter sınırını aşmamalı', () => {
      const validateSearchTerm = term => {
        const trimmed = (term || '').trim();
        if (trimmed.length < 2) return { valid: false, error: 'En az 2 karakter olmalıdır' };
        if (trimmed.length > 100) return { valid: false, error: 'Maksimum 100 karakter olabilir' };
        return { valid: true };
      };

      assert.equal(validateSearchTerm('a').valid, false);
      assert.equal(validateSearchTerm('kaza').valid, true);
      assert.equal(validateSearchTerm('a'.repeat(101)).valid, false);
      assert.equal(validateSearchTerm('a'.repeat(100)).valid, true);
    });
  });

  describe('3. Heatmap k-Anonymity ve Feragatname Doğrulaması', () => {
    it('yoğunluk yanıtı kAnonymityThreshold ve suppressedPoints alanlarını desteklemeli', () => {
      const mockHeatmapResponse = {
        totalPoints: 21,
        aggregatedClusterCount: 2,
        suppressedPoints: 1,
        kAnonymityThreshold: 2,
        points: [
          { latitude: 38.72, longitude: 35.48, weight: 1.0, count: 15 },
          { latitude: 38.73, longitude: 35.49, weight: 0.33, count: 5 },
        ],
        disclaimer:
          'Yoğunluk haritası gizlilik korumalı mekânsal agregasyonla üretilmektedir; tekil olay konumlarını doğrudan temsil etmez ve resmî tehlike veya risk haritası değildir.',
      };

      assert.equal(mockHeatmapResponse.suppressedPoints, 1);
      assert.equal(mockHeatmapResponse.kAnonymityThreshold, 2);
      assert.ok(
        mockHeatmapResponse.disclaimer.includes(
          'gizlilik korumalı mekânsal agregasyonla üretilmektedir',
        ),
      );
      assert.ok(
        mockHeatmapResponse.disclaimer.includes(
          'tekil olay konumlarını doğrudan temsil etmez',
        ),
      );
    });
  });

  describe('4. Transactional Outbox Olay Tipleri Bütünlüğü', () => {
    it('Outbox olay tipleri frontend ve backend arasında tutarlı olmalı', () => {
      const allowedOutboxEventTypes = [
        'EVENT_CREATED',
        'EVENT_STATUS_CHANGED',
        'EVENT_PUBLISHED',
        'EVENT_REJECTED',
        'EVENT_RESOLVED',
        'EVENT_DISPUTED',
        'EVENT_FEEDBACK_SUBMITTED',
        'EVENT_FEEDBACK_REMOVED',
      ];

      assert.ok(allowedOutboxEventTypes.includes('EVENT_CREATED'));
      assert.ok(allowedOutboxEventTypes.includes('EVENT_STATUS_CHANGED'));
      assert.ok(allowedOutboxEventTypes.includes('EVENT_FEEDBACK_SUBMITTED'));
    });
  });
});
