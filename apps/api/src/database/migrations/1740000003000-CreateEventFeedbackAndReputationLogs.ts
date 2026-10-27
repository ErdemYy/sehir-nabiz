import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventFeedbackAndReputationLogs1740000003000 implements MigrationInterface {
  name = 'CreateEventFeedbackAndReputationLogs1740000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enum Türü
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "feedback_type" AS ENUM ('CONFIRM', 'DISPUTE', 'RESOLVED_REPORT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Events tablosuna eksik sayaç sütunlarını ekle
    await queryRunner.query(`
      ALTER TABLE "events" 
      ADD COLUMN IF NOT EXISTS "disputeCount" INT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "resolvedReportCount" INT NOT NULL DEFAULT 0;
    `);

    // 3. Topluluk Geri Bildirimi Tablosu (event_feedbacks)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "event_feedbacks" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "eventId" UUID NOT NULL,
        "userId" UUID NOT NULL,
        "type" "feedback_type" NOT NULL,
        "reason" VARCHAR(500),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "fk_event_feedbacks_event" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_event_feedbacks_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_event_feedback_event_user" UNIQUE ("eventId", "userId")
      );
    `);

    // İndeksler
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_event_feedback_event_id" ON "event_feedbacks" ("eventId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_event_feedback_user_id" ON "event_feedbacks" ("userId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_event_feedback_type" ON "event_feedbacks" ("type");
    `);

    // 4. Kullanıcı İtibar Denetim Kayıtları Tablosu (user_reputation_logs)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_reputation_logs" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL,
        "delta" INT NOT NULL,
        "reason" VARCHAR(150) NOT NULL,
        "referenceId" UUID,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "fk_user_reputation_logs_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_user_reputation_logs_user_id" ON "user_reputation_logs" ("userId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. İtibar logları tablosunu kaldır
    await queryRunner.query(`
      DROP TABLE IF EXISTS "user_reputation_logs";
    `);

    // 2. Geri bildirimler tablosunu kaldır
    await queryRunner.query(`
      DROP TABLE IF EXISTS "event_feedbacks";
    `);

    // 3. Olay tablosundan eklenen sütunları kaldır
    await queryRunner.query(`
      ALTER TABLE "events" 
      DROP COLUMN IF EXISTS "resolvedReportCount",
      DROP COLUMN IF EXISTS "disputeCount";
    `);

    // 4. Enum türünü kaldır
    await queryRunner.query(`
      DROP TYPE IF EXISTS "feedback_type";
    `);
  }
}
