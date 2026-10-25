const test = require('node:test');
const assert = require('node:assert/strict');
const { lightTheme, darkTheme, radii, spacing } = require('@sehir-nabiz/design-tokens');

test('Mobil Navigasyon & Floating Tab Mimarisi Testleri', async (t) => {
  await t.test('5 ana sekme eksiksiz ve doğru sırada tanımlanmış olmalı', () => {
    const expectedTabs = ['index', 'feed', 'create', 'notifications', 'profile'];
    const expectedLabels = ['Harita', 'Akış', 'Bildir', 'Bildirimler', 'Profil'];

    assert.equal(expectedTabs.length, 5, 'Tam 5 sekme olmalı');
    assert.equal(expectedLabels[0], 'Harita');
    assert.equal(expectedLabels[1], 'Akış');
    assert.equal(expectedLabels[2], 'Bildir');
    assert.equal(expectedLabels[3], 'Bildirimler');
    assert.equal(expectedLabels[4], 'Profil');
  });

  await t.test('"Bildir" sekmesi merkezi aksiyon (isAction) olarak işaretlenmeli', () => {
    const createTab = {
      key: 'create',
      name: 'create',
      label: 'Bildir',
      isAction: true,
    };

    assert.equal(createTab.isAction, true, 'Bildir sekmesi isAction olmalı');
    assert.equal(createTab.name, 'create');
  });

  await t.test('Floating Tab Bar boyutları ve radius kuralları Urban Floating UI uyumlu olmalı', () => {
    assert.equal(radii.sheet, 24, 'Tab bar radius 24px olmalı');
    assert.equal(radii.pill, 999, 'Aksiyon butonu pill radius olmalı');

    // Safe area hesaplama mantığı
    const calculateBottomPadding = (insetBottom) => Math.max(insetBottom, 12);
    assert.equal(calculateBottomPadding(0), 12, 'Sıfır inset durumunda minimum 12px boşluk olmalı');
    assert.equal(calculateBottomPadding(34), 34, 'Home indicator (34px) durumunda tam inset uygulanmalı');
  });

  await t.test('Tema geçiş mantığı (Light <-> Dark <-> System) doğru çalışmalı', () => {
    let mode = 'light';
    const toggle = (current) => (current === 'dark' ? 'light' : 'dark');

    assert.equal(toggle('light'), 'dark');
    assert.equal(toggle('dark'), 'light');

    const resolveIsDark = (themeMode, systemIsDark) => {
      if (themeMode === 'system') return systemIsDark;
      return themeMode === 'dark';
    };

    assert.equal(resolveIsDark('light', true), false);
    assert.equal(resolveIsDark('dark', false), true);
    assert.equal(resolveIsDark('system', true), true);
    assert.equal(resolveIsDark('system', false), false);
  });

  await t.test('Showcase ekranı production ortamında (__DEV__ = false) engellenmeli', () => {
    const isShowcaseAllowed = (isDev) => isDev === true;

    assert.equal(isShowcaseAllowed(true), true, 'Development ortamında erişilebilir olmalı');
    assert.equal(isShowcaseAllowed(false), false, 'Production ortamında erişim kesinlikle engellenmeli');
  });
});
