const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Proje ve monorepo kök dizinleri
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Monorepo kökünü ve paylaşılan paketleri Metro izleme listesine ekle
config.watchFolders = [monorepoRoot];

// 2. Paket çözümleme sıralaması (önce yerel mobile node_modules, sonra kök)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
