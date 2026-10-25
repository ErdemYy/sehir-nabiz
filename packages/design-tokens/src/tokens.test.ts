import test from 'node:test';
import assert from 'node:assert/strict';
import {
  palette,
  lightTheme,
  darkTheme,
  spacing,
  radii,
  shadows,
  typographyVariants,
  fontFamilies,
} from './index';

test('Tasarım Sistemi — Renk Tokenları ve Kontrast', async (t) => {
  await t.test('Light theme renkleri Urban Floating UI spesifikasyonuna uymalı', () => {
    assert.equal(lightTheme.primary, '#14B8A6', 'Primary turkuaz olmalı');
    assert.equal(lightTheme.primaryDark, '#0F766E', 'PrimaryDark uyumlu olmalı');
    assert.equal(lightTheme.accentBlue, '#2563EB', 'AccentBlue uyumlu olmalı');
    assert.equal(lightTheme.background, '#F6F8FB', 'Background yumuşak gri-mavi olmalı');
    assert.equal(lightTheme.surface, '#FFFFFF', 'Surface saf beyaz olmalı');
    assert.equal(lightTheme.text, '#0F172A', 'TextPrimary koyu slate olmalı');
    assert.equal(lightTheme.textSecondary, '#64748B', 'TextSecondary slate 500 olmalı');
    assert.equal(lightTheme.border, '#E2E8F0', 'Border slate 200 olmalı');
    assert.equal(lightTheme.success, '#16A34A', 'Success yeşil olmalı');
    assert.equal(lightTheme.warning, '#F59E0B', 'Warning sarı olmalı');
    assert.equal(lightTheme.error, '#DC2626', 'Error kırmızı olmalı');
  });

  await t.test('Dark theme renkleri gece modu ve erişilebilirlik standartlarına uymalı', () => {
    assert.equal(darkTheme.background, '#0B1726', 'Koyu tema gece mavisi olmalı');
    assert.equal(darkTheme.surface, '#152436', 'Koyu tema yüzeyi uyumlu olmalı');
    assert.equal(darkTheme.surfaceElevated, '#1C3044', 'Yükseltilmiş yüzey ayrışmalı');
    assert.equal(darkTheme.text, '#F8FAFC', 'Koyu temada metin açık renk olmalı');
    assert.equal(darkTheme.textSecondary, '#A9B8C8', 'İkincil metin açık gri-mavi olmalı');
    assert.equal(darkTheme.border, '#304154', 'Koyu temada kenarlık belirgin olmalı');
    assert.equal(darkTheme.primary, '#2DD4BF', 'Koyu temada erişilebilir yüksek kontrast turkuaz kullanılmalı');
  });

  await t.test('11 backend kategorisinin tümü için renk tanımları mevcut olmalı', () => {
    const expectedCategories = [
      'TRAFFIC',
      'ACCIDENT',
      'ROAD_WORK',
      'WATER_OUTAGE',
      'POWER_OUTAGE',
      'INFRASTRUCTURE',
      'PUBLIC_TRANSPORT',
      'WEATHER',
      'DISASTER',
      'EVENT',
      'OTHER',
    ];

    for (const cat of expectedCategories) {
      assert.ok(
        palette.categories[cat as keyof typeof palette.categories],
        `Kategori rengi eksik: ${cat}`
      );
    }
  });
});

test('Tasarım Sistemi — 4px Grid Spacing ve Radius Kuralları', async (t) => {
  await t.test('Aralıklar 4px katları kuralına uymalı', () => {
    assert.equal(spacing.xs, 4);
    assert.equal(spacing.sm, 8);
    assert.equal(spacing.md, 12);
    assert.equal(spacing.lg, 16);
    assert.equal(spacing.xl, 20);
    assert.equal(spacing.xxl, 24);
    assert.equal(spacing['3xl'], 32);
    assert.equal(spacing['4xl'], 40);
    assert.equal(spacing['5xl'], 48);
  });

  await t.test('Radius tokenları spesifikasyonla birebir eşleşmeli', () => {
    assert.equal(radii.small, 8, 'Small radius 8px olmalı');
    assert.equal(radii.medium, 12, 'Medium radius 12px olmalı');
    assert.equal(radii.large, 16, 'Large radius 16px olmalı');
    assert.equal(radii.card, 20, 'Card radius 20px olmalı');
    assert.equal(radii.sheet, 24, 'Sheet radius 24px olmalı');
    assert.equal(radii.pill, 999, 'Pill radius 999 olmalı');
  });

  await t.test('Platform bağımsız gölge (shadow) seviyeleri tanımlı olmalı', () => {
    assert.equal(shadows.elevation0.elevation, 0);
    assert.equal(shadows.elevation1.elevation, 2);
    assert.equal(shadows.elevation2.elevation, 4);
    assert.equal(shadows.floating.elevation, 8);
  });
});

test('Tasarım Sistemi — Tipografi Ölçeği ve Font Aileleri', async (t) => {
  await t.test('Başlık fontu Plus Jakarta Sans ve gövde fontu Manrope tanımlı olmalı', () => {
    assert.ok(fontFamilies.heading.bold.includes('PlusJakartaSans'));
    assert.ok(fontFamilies.body.regular.includes('Manrope'));
  });

  await t.test('Tipografi varyantları doğru font boyutları ve satır yüksekliklerine sahip olmalı', () => {
    assert.equal(typographyVariants.display.fontSize, 32);
    assert.equal(typographyVariants.display.lineHeight, 40);
    assert.equal(typographyVariants.headingXL.fontSize, 24);
    assert.equal(typographyVariants.headingL.fontSize, 20);
    assert.equal(typographyVariants.headingM.fontSize, 18);
    assert.equal(typographyVariants.bodyL.fontSize, 16);
    assert.equal(typographyVariants.bodyM.fontSize, 14);
    assert.equal(typographyVariants.bodyS.fontSize, 13);
    assert.equal(typographyVariants.caption.fontSize, 12);
    assert.equal(typographyVariants.label.fontSize, 11);
  });
});
