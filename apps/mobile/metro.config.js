const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// Expo SDK 58 resmî monorepo desteği
const config = getDefaultConfig(projectRoot);

// 1. Monorepo kökü ve workspace paketleri izleme listesi
config.watchFolders = [
  monorepoRoot,
  path.resolve(monorepoRoot, 'packages/shared'),
  path.resolve(monorepoRoot, 'packages/design-tokens'),
];

// 2. Windows pnpm workspace çözümlemesi için nodeModulesPaths
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'packages/shared/node_modules'),
];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@sehir-nabiz/shared': path.resolve(monorepoRoot, 'packages/shared/dist/index.js'),
  '@sehir-nabiz/design-tokens': path.resolve(monorepoRoot, 'packages/design-tokens/dist/index.js'),
};

// 3. Expo Go Önizleme Modu Algılayıcısı
const isExpoGo =
  process.argv.includes('--go') ||
  process.argv.includes('-g') ||
  process.env.EXPO_GO_PREVIEW === 'true' ||
  process.env.EXPO_PUBLIC_EXPO_GO_PREVIEW === 'true';

if (isExpoGo) {
  process.env.EXPO_PUBLIC_EXPO_GO_PREVIEW = 'true';
}

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Yalnızca Expo Go Preview modunda MapLibre Native paketini stub'a yönlendir
  if (isExpoGo && moduleName === '@maplibre/maplibre-react-native') {
    return {
      filePath: path.resolve(projectRoot, 'src/mocks/maplibre-stub.tsx'),
      type: 'sourceFile',
    };
  }

  // Windows pnpm junction sınırını aşmak için doğrudan workspace paketinin derlenmiş dosyasına yönlendir
  if (moduleName === '@sehir-nabiz/shared') {
    return {
      filePath: path.resolve(monorepoRoot, 'packages/shared/dist/index.js'),
      type: 'sourceFile',
    };
  }

  if (moduleName === '@sehir-nabiz/design-tokens') {
    return {
      filePath: path.resolve(monorepoRoot, 'packages/design-tokens/dist/index.js'),
      type: 'sourceFile',
    };
  }

  // Diğer tüm paketleri Expo'nun varsayılan Metro resolver'ına bırak
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
