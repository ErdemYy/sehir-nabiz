import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccountDeletionAndAudit1740000006000
  implements MigrationInterface
{
  name = 'CreateAccountDeletionAndAudit1740000006000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. account_status enum güncellemesi
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TYPE "account_status" ADD VALUE IF NOT EXISTS 'PENDING_DELETION';
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TYPE "account_status" ADD VALUE IF NOT EXISTS 'DELETED';
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. deletion_request_status_enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "deletion_request_status_enum" AS ENUM(
          'PENDING',
          'PROCESSING',
          'COMPLETED',
          'CANCELLED',
          'FAILED'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 3. deletion_client_source_enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "deletion_client_source_enum" AS ENUM(
          'MOBILE_APP',
          'WEB_REQUEST',
          'ADMIN_ACTION'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 4. account_deletion_requests tablosu
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "account_deletion_requests" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "status" "deletion_request_status_enum" NOT NULL DEFAULT 'PENDING',
        "reason" character varying(500),
        "scheduledFor" TIMESTAMP WITH TIME ZONE NOT NULL,
        "completedAt" TIMESTAMP WITH TIME ZONE,
        "cancelledAt" TIMESTAMP WITH TIME ZONE,
        "attemptCount" integer NOT NULL DEFAULT 0,
        "lastError" text,
        "clientSource" "deletion_client_source_enum" NOT NULL DEFAULT 'MOBILE_APP',
        "ipAddress" character varying(100),
        "userAgent" character varying(255),
        "details" jsonb,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_account_deletion_requests_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_account_deletion_requests_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_account_deletion_user_id" ON "account_deletion_requests" ("userId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_account_deletion_status" ON "account_deletion_requests" ("status");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_account_deletion_scheduled_for" ON "account_deletion_requests" ("scheduledFor");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "account_deletion_requests";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "deletion_client_source_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "deletion_request_status_enum";`);
  }
}
