import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOutboxEventsAndIdempotency1740000005000
  implements MigrationInterface
{
  name = 'CreateOutboxEventsAndIdempotency1740000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Türkçe arama için unaccent eklentisi
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS unaccent;
    `);

    // 2. Outbox Status Enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "outbox_status_enum" AS ENUM(
          'PENDING',
          'PROCESSING',
          'PROCESSED',
          'FAILED'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 3. outbox_events Tablosu
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "outbox_events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "aggregate_type" character varying(64) NOT NULL,
        "aggregate_id" uuid NOT NULL,
        "event_type" character varying(64) NOT NULL,
        "payload" jsonb NOT NULL,
        "status" "outbox_status_enum" NOT NULL DEFAULT 'PENDING',
        "attempts" integer NOT NULL DEFAULT 0,
        "next_attempt_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "processed_at" TIMESTAMP WITH TIME ZONE,
        "lock_lease_expires_at" TIMESTAMP WITH TIME ZONE,
        "last_error" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_outbox_events_id" PRIMARY KEY ("id")
      );
    `);

    // 4. İndeksler (Worker polling ve recovery için)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_outbox_events_status_next_attempt"
      ON "outbox_events" ("status", "next_attempt_at");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_outbox_events_aggregate"
      ON "outbox_events" ("aggregate_type", "aggregate_id");
    `);

    // 5. user_notifications için İdempotency Anahtarı
    await queryRunner.query(`
      ALTER TABLE "user_notifications"
      ADD COLUMN IF NOT EXISTS "idempotency_key" character varying(255);
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_user_notifications_idempotency"
      ON "user_notifications" ("idempotency_key")
      WHERE "idempotency_key" IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. İdempotency İndeks ve Kolonu Kaldır
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_user_notifications_idempotency";
    `);

    await queryRunner.query(`
      ALTER TABLE "user_notifications"
      DROP COLUMN IF EXISTS "idempotency_key";
    `);

    // 2. outbox_events Tablosunu Kaldır
    await queryRunner.query(`
      DROP TABLE IF EXISTS "outbox_events";
    `);

    // 3. Enum'u Kaldır
    await queryRunner.query(`
      DROP TYPE IF EXISTS "outbox_status_enum";
    `);
  }
}
