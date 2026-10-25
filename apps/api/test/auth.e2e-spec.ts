import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../src/database/data-source';
import * as net from 'net';

// PostgreSQL portunun (5432) erişilebilirliğini kontrol et
async function isPortOpen(host: string, port: number): Promise<boolean> {
  return new Promise(resolve => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

describe('PostgreSQL / PostGIS & Auth Entegrasyon Testleri (E2E)', async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const isPostgresUp = await isPortOpen(host, port);

  if (!isPostgresUp) {
    it.skip('PostgreSQL / PostGIS servisi (127.0.0.1:5432) çevrimdışı: Docker daemon kapalı olduğundan entegrasyon testleri atlandı.', () => {});
    return;
  }

  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      ...(dataSourceOptions as any),
      database: 'sehir_nabiz_test', // Test veritabanı ayrımı
    });
    await dataSource.initialize();
    await dataSource.runMigrations();
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.dropDatabase();
      await dataSource.destroy();
    }
  });

  it('PostGIS eklentisinin aktif olduğu doğrulanmalı', async () => {
    const result = await dataSource.query('SELECT PostGIS_Version();');
    expect(result).toBeDefined();
    expect(result[0].postgis_version).toBeDefined();
  });

  it('Migration tablolarının eksiksiz oluştuğu doğrulanmalı', async () => {
    const tables = await dataSource.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('users', 'refresh_tokens');
    `);
    expect(tables.length).toBe(2);
  });
});
