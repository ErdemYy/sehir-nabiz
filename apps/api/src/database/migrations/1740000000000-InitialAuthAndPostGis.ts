import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialAuthAndPostGis1740000000000 implements MigrationInterface {
  name = 'InitialAuthAndPostGis1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. PostGIS ve UUID Uzantıları
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis";`);

    // 2. Enum Türleri
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "user_role" AS ENUM ('CITIZEN', 'TRUSTED_REPORTER', 'MUNICIPAL_OFFICER', 'MODERATOR', 'ADMIN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "account_status" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 3. Kullanıcılar Tablosu (Users)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" VARCHAR(255) NOT NULL,
        "passwordHash" VARCHAR(255) NOT NULL,
        "displayName" VARCHAR(100) NOT NULL,
        "role" "user_role" NOT NULL DEFAULT 'CITIZEN',
        "accountStatus" "account_status" NOT NULL DEFAULT 'ACTIVE',
        "reputationScore" INT NOT NULL DEFAULT 10,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "uq_users_email" UNIQUE ("email")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
    `);

    // 4. Oturum ve Refresh Token Tablosu (RefreshTokens)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL,
        "tokenHash" VARCHAR(64) NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "isRevoked" BOOLEAN NOT NULL DEFAULT false,
        "replacedByTokenHash" VARCHAR(64),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "fk_refresh_tokens_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_user_id" ON "refresh_tokens" ("userId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_token_hash" ON "refresh_tokens" ("tokenHash");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "account_status";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role";`);
  }
}
