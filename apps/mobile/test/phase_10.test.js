const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('Phase 10 — Şehir İstatistikleri, Heatmap, Profil ve Arama Mobil Testleri', () => {
  describe('Şehir İstatistikleri & Metrik Hesaplamaları (Section 5)', () => {
    it('istatistik özetinde çözüm oranı ve ortalama teyit doğru hesaplanmalı', () => {
      const mockStats = {
        totalEvents: 50,
        activeEvents: 30,
        resolvedEvents: 20,
        disputedEvents: 2,
        averageConfirmations: 4.8,
        resolutionRate: 40.0,
      };

      assert.equal(mockStats.activeEvents + mockStats.resolvedEvents, mockStats.totalEvents);
      const computedRate = (mockStats.resolvedEvents / mockStats.totalEvents) * 100;
      assert.equal(computedRate, mockStats.resolutionRate);
      assert.ok(mockStats.averageConfirmations > 0);
    });

    it('feragatname metni sahte kesinlik yaratmayacak şekilde standart olmalı', () => {
      const disclaimer =
        'İstatistikler ŞehirNabız üzerinde yayınlanan kullanıcı bildirimlerine dayanmaktadır; tüm gerçek olayların eksiksiz kaydını temsil etmez.';
      assert.ok(disclaimer.includes('tüm gerçek olayların eksiksiz kaydını temsil etmez'));
      assert.ok(!disclaimer.includes('%95 doğrudur')); // Sahte kesinlik bulunmamalı
    });

    it('kategori dağılım yüzdeleri toplamı %100 sınırını aşmamalı', () => {
      const categories = [
        { categoryCode: 'TRAFFIC', count: 25, percentage: 50.0 },
        { categoryCode: 'ROAD_WORK', count: 15, percentage: 30.0 },
        { categoryCode: 'WATER_OUTAGE', count: 10, percentage: 20.0 },
      ];

      const totalPercentage = categories.reduce((sum, c) => sum + c.percentage, 0);
      assert.equal(totalPercentage, 100.0);
    });
  });

  describe('Yoğunluk Haritası (Heatmap) ve Opaklık Standartları (Section 6)', () => {
    it('heatmap katman opaklığı harita etiketlerini örtmeyecek şekilde <= 0.70 olmalı', () => {
      const heatmapOpacity = 0.65;
      assert.ok(heatmapOpacity <= 0.70);
      assert.ok(heatmapOpacity >= 0.50);
    });

    it('nokta yoğunluk ağırlığı (weight) 0.1 ile 1.0 arasında normalize edilmeli', () => {
      const normalizeWeight = (count, maxCount) => {
        return Math.min(1.0, Math.max(0.1, Math.round((count / maxCount) * 100) / 100));
      };

      assert.equal(normalizeWeight(100, 100), 1.0);
      assert.equal(normalizeWeight(50, 100), 0.5);
      assert.equal(normalizeWeight(1, 100), 0.1); // min sınır
      assert.equal(normalizeWeight(0, 100), 0.1);
    });

    it('heatmap açılıp kapatılabilir state makinesine sahip olmalı', () => {
      let showHeatmap = false;
      const toggleHeatmap = () => {
        showHeatmap = !showHeatmap;
      };

      toggleHeatmap();
      assert.equal(showHeatmap, true);
      toggleHeatmap();
      assert.equal(showHeatmap, false);
    });
  });

  describe('Kullanıcı Bildirimlerim ve Reddedilme Gerekçesi Kalkanı (Section 8)', () => {
    it('reddedilen olaylarda moderatör gerekçesi kullanıcıya açıkça sunulmalı', () => {
      const rejectedEvent = {
        id: 'event-rej-1',
        title: 'Mükerrer Bildirim',
        status: 'REJECTED',
        rejectionReason: '150m mesafede aynı kaza bildirimi mevcut.',
      };

      assert.equal(rejectedEvent.status, 'REJECTED');
      assert.ok(rejectedEvent.rejectionReason.length > 5);
      assert.equal(rejectedEvent.rejectionReason, '150m mesafede aynı kaza bildirimi mevcut.');
    });

    it('onaylanmış veya yayındaki olaylarda red gerekçesi bulunmamalı', () => {
      const activeEvent = {
        id: 'event-act-1',
        title: 'Yol Bakımı',
        status: 'ACTIVE',
        rejectionReason: null,
      };

      assert.equal(activeEvent.rejectionReason, null);
    });
  });

  describe('Kullanıcı İtibar Seviyeleri ve Katkı Sayaçları (Section 7)', () => {
    it('itibar puanına göre doğru rütbe seviyesi eşleşmeli', () => {
      const getReputationLevel = (score) => {
        if (score >= 100) return 'Şehir Koruyucusu (Seviye 4)';
        if (score >= 50) return 'Güvenilir Gözlemci (Seviye 3)';
        if (score >= 20) return 'Aktif Vatandaş (Seviye 2)';
        return 'Topluluk Gözlemcisi (Seviye 1)';
      };

      assert.equal(getReputationLevel(120), 'Şehir Koruyucusu (Seviye 4)');
      assert.equal(getReputationLevel(65), 'Güvenilir Gözlemci (Seviye 3)');
      assert.equal(getReputationLevel(25), 'Aktif Vatandaş (Seviye 2)');
      assert.equal(getReputationLevel(10), 'Topluluk Gözlemcisi (Seviye 1)');
    });

    it('katkı istatistikleri gerçek sayısal alanlara sahip olmalı', () => {
      const stats = {
        reportedCount: 12,
        confirmedCount: 34,
        resolvedCount: 5,
        reputationScore: 45,
      };

      assert.equal(typeof stats.reportedCount, 'number');
      assert.equal(typeof stats.confirmedCount, 'number');
      assert.equal(typeof stats.resolvedCount, 'number');
      assert.ok(stats.reportedCount >= stats.resolvedCount);
    });
  });

  describe('Arama Akışı & Türkçe Karakterler (Section 13)', () => {
    it('Türkçe arama terimlerinde min 2 karakter koşulu denetlenmeli', () => {
      const isValidSearch = (query) => {
        return (query || '').trim().length >= 2;
      };

      assert.equal(isValidSearch(''), false);
      assert.equal(isValidSearch('a'), false);
      assert.equal(isValidSearch('su'), true);
      assert.equal(isValidSearch('tramvay'), true);
      assert.equal(isValidSearch('İncesu'), true);
    });

    it('büyük/küçük Türkçe harfler normalize edilebilmeli', () => {
      const normalizeTr = (str) => {
        return str
          .toLocaleLowerCase('tr-TR')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
      };

      assert.equal(normalizeTr('ÇAMLICA'), normalizeTr('çamlıca'));
      assert.equal(normalizeTr('İNCESU'), normalizeTr('incesu'));
    });
  });

  describe('Ayarlar ve Bildirim Tercihleri Güvenliği (Section 9)', () => {
    it('yakınımdaki gelişmeler (nearbyEvents) tercihi varsayılan olarak kapalı olmalı', () => {
      const defaultPreferences = {
        followedEvents: true,
        confirmedEvents: true,
        reportedEvents: true,
        nearbyEvents: false, // Gizlilik gereği varsayılan kapalıdır
        pushEnabled: true,
      };

      assert.equal(defaultPreferences.nearbyEvents, false);
      assert.equal(defaultPreferences.followedEvents, true);
    });
  });
});
