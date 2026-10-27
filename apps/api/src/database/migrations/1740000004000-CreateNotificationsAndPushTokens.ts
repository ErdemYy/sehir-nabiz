import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsAndPushTokens1740000004000
  implements MigrationInterface
{
  name = 'CreateNotificationsAndPushTokens1740000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Notification Type Enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "notification_type_enum" AS ENUM(
          'EVENT_APPROVED',
          'EVENT_REJECTED',
          'EVENT_RESOLVED',
          'EVENT_DISPUTED',
          'EVENT_FEEDBACK',
          'MODERATION_QUEUE',
          'SYSTEM'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Push Platform Enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "push_platform_enum" AS ENUM('ios', 'android', 'web');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 3. events tablosuna version kolonu ekle (Monotonik durum ve WebSocket tutarlılığı için)
    await queryRunner.query(`
      ALTER TABLE "events"
      ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT 1;
    `);

    // 4. user_notifications tablosu
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_notifications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "type" "notification_type_enum" NOT NULL DEFAULT 'SYSTEM',
        "title" character varying(150) NOT NULL,
        "body" character varying(500) NOT NULL,
        "eventId" uuid,
        "readAt" TIMESTAMP WITH TIME ZONE,
        "expiresAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_notifications_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_notifications_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_notifications_event" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_notifications_user_created" ON "user_notifications" ("userId", "createdAt" DESC);
      CREATE INDEX IF NOT EXISTS "IDX_notifications_user_read" ON "user_notifications" ("userId", "readAt");
      CREATE INDEX IF NOT EXISTS "IDX_notifications_event" ON "user_notifications" ("eventId");
    `);

    // 5. device_push_tokens tablosu
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "device_push_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "token" character varying(255) NOT NULL,
        "platform" "push_platform_enum" NOT NULL DEFAULT 'android',
        "deviceIdentifier" character varying(128),
        "isActive" boolean NOT NULL DEFAULT true,
        "lastSeenAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_device_push_tokens_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_device_push_token" UNIQUE ("token"),
        CONSTRAINT "FK_device_push_tokens_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_device_push_tokens_user_active" ON "device_push_tokens" ("userId", "isActive");
    `);

    // 6. user_notification_preferences tablosu
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_notification_preferences" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "followedEvents" boolean NOT NULL DEFAULT true,
        "confirmedEvents" boolean NOT NULL DEFAULT true,
        "reportedEvents" boolean NOT NULL DEFAULT true,
        "nearbyEvents" boolean NOT NULL DEFAULT false,
        "systemNotifications" boolean NOT NULL DEFAULT true,
        "pushEnabled" boolean NOT NULL DEFAULT true,
        "inAppEnabled" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_notification_preferences_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_notification_preferences_user" UNIQUE ("userId"),
        CONSTRAINT "FK_user_notification_preferences_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_notification_preferences";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "device_push_tokens";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_notifications";`);
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN IF EXISTS "version";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "push_platform_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "notification_type_enum";`);
  }
}
