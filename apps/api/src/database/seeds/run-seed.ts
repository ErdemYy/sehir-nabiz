import AppDataSource from '../data-source';
import { seedDemoEvents } from './seed-demo-events';

async function run() {
  console.log('[Seed] Veritabanı bağlantısı kuruluyor...');
  await AppDataSource.initialize();

  try {
    await seedDemoEvents(AppDataSource);
    console.log('[Seed] Tamamlandı.');
  } catch (error) {
    console.error('[Seed] Hata:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
