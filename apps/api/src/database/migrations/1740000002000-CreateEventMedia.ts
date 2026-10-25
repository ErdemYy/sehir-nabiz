import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventMedia1740000002000 implements MigrationInterface {
  name = 'CreateEventMedia1740000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "media_status" AS ENUM ('PENDING_UPLOAD', 'PROCESSING', 'READY', 'REJECTED', 'DELETED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "event_media" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "eventId" UUID NOT NULL,
        "uploadedById" UUID NOT NULL,
        "storageKey" VARCHAR(255) NOT NULL,
        "originalFileName" VARCHAR(255),
        "mimeType" VARCHAR(50) NOT NULL,
        "fileSize" BIGINT NOT NULL,
        "width" INT,
        "height" INT,
        "status" "media_status" NOT NULL DEFAULT 'PENDING_UPLOAD',
        "checksum" VARCHAR(64),
        "verifiedAt" TIMESTAMPTZ,
        "rejectionReason" VARCHAR(255),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "uq_event_media_storage_key" UNIQUE ("storageKey"),
        CONSTRAINT "fk_event_media_event" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_event_media_user" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_event_media_event_id" ON "event_media" ("eventId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_event_media_event_status" ON "event_media" ("eventId", "status");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_event_media_storage_key" ON "event_media" ("storageKey");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "event_media";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "media_status";`);
  }
}
