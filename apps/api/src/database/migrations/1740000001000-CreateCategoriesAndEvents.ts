import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesAndEvents1740000001000 implements MigrationInterface {
  name = 'CreateCategoriesAndEvents1740000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enum Türleri
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "event_severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "event_status" AS ENUM ('PENDING_REVIEW', 'ACTIVE', 'DISPUTED', 'RESOLVED', 'REJECTED', 'EXPIRED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Kategoriler Tablosu
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "code" VARCHAR(50) NOT NULL,
        "name_tr" VARCHAR(100) NOT NULL,
        "description_tr" TEXT NOT NULL,
        "icon" VARCHAR(50) NOT NULL,
        "color_hex" VARCHAR(7) NOT NULL,
        "default_duration_hours" INT NOT NULL DEFAULT 4,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "uq_categories_code" UNIQUE ("code")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_categories_code" ON "categories" ("code");
    `);

    // 3. 11 Temel Kategoriyi İdempotent Olarak Ekle (Seed)
    await queryRunner.query(`
      INSERT INTO "categories" ("code", "name_tr", "description_tr", "icon", "color_hex", "default_duration_hours", "is_active")
      VALUES 
        ('TRAFFIC', 'Trafik Yoğunluğu', 'Aşırı araç yoğunluğu, yavaşlayan trafik veya sıkışıklık.', 'traffic-cone', '#EA580C', 3, true),
        ('ACCIDENT', 'Trafik Kazası', 'Maddi hasarlı veya yaralanmalı trafik kazası bildirimi.', 'car-crash', '#DC2626', 4, true),
        ('ROAD_WORK', 'Yol Çalışması', 'Asfalt yenileme, kazı, bakım ve şerit kapatma çalışmaları.', 'wrench', '#D97706', 24, true),
        ('WATER_OUTAGE', 'Su Kesintisi', 'Şebeke arızası veya planlı su kesintileri.', 'droplet-off', '#0284C7', 8, true),
        ('POWER_OUTAGE', 'Elektrik Kesintisi', 'Trafo arızası, hat kopması veya planlı elektrik kesintileri.', 'zap-off', '#CA8A04', 6, true),
        ('INFRASTRUCTURE', 'Altyapı Arızası', 'Kanalizasyon taşması, doğalgaz sızıntısı, çökme veya yol bozulması.', 'tool', '#475569', 12, true),
        ('PUBLIC_TRANSPORT', 'Toplu Taşıma', 'Metro, tramvay veya otobüs sefer iptalleri ve gecikmeler.', 'bus', '#2563EB', 4, true),
        ('WEATHER', 'Hava Koşulları', 'Fırtına, şiddetli yağmur, buzlanma veya yoğun kar yağışı uyarısı.', 'cloud-snow', '#0D9488', 6, true),
        ('DISASTER', 'Afet ve Acil Durum', 'Deprem, sel, yangın veya heyelan gibi acil durum bildirimleri.', 'alert-triangle', '#991B1B', 48, true),
        ('EVENT', 'Şehir Etkinliği', 'Konser, maraton, festival veya yol kapayan açık hava etkinlikleri.', 'calendar', '#7C3AED', 8, true),
        ('OTHER', 'Diğer Gelişmeler', 'Şehir hayatını etkileyen diğer duyuru ve bildirimler.', 'info', '#64748B', 6, true)
      ON CONFLICT ("code") DO NOTHING;
    `);

    // 4. Olaylar (Events) Tablosu
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "events" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "authorId" UUID NOT NULL,
        "categoryId" UUID NOT NULL,
        "title" VARCHAR(150) NOT NULL,
        "description" TEXT NOT NULL,
        "severity" "event_severity" NOT NULL DEFAULT 'MEDIUM',
        "status" "event_status" NOT NULL DEFAULT 'PENDING_REVIEW',
        "location" GEOMETRY(Point, 4326) NOT NULL,
        "addressText" VARCHAR(255),
        "city" VARCHAR(60),
        "district" VARCHAR(60),
        "confirmationCount" INT NOT NULL DEFAULT 0,
        "denialCount" INT NOT NULL DEFAULT 0,
        "reliabilityScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "resolvedAt" TIMESTAMPTZ,
        "isDemo" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "fk_events_author" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_events_category" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT
      );
    `);

    // 5. Uzamsal (GiST) ve B-Tree İndeksleri
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_events_location_gist" ON "events" USING GIST ("location");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_events_status_created_at" ON "events" ("status", "createdAt" DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_events_category_id_status" ON "events" ("categoryId", "status");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_events_author_id" ON "events" ("authorId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_events_expires_at" ON "events" ("expiresAt") WHERE "status" = 'ACTIVE';
    `);

    // 6. Moderasyon Denetim Kayıtları (Moderation Audit Trail)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "event_moderation_logs" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "eventId" UUID NOT NULL,
        "moderatorId" UUID NOT NULL,
        "previousStatus" "event_status" NOT NULL,
        "newStatus" "event_status" NOT NULL,
        "reason" VARCHAR(500),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "fk_moderation_event" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_moderation_moderator" FOREIGN KEY ("moderatorId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_event_moderation_logs_event_id" ON "event_moderation_logs" ("eventId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "event_moderation_logs";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "events";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "event_status";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "event_severity";`);
  }
}
